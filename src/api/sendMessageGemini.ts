import { FunctionCallingConfigMode, GenerateContentResponse, GoogleGenAI, type FunctionDeclaration } from '@google/genai';
import type { McpClient } from './mcp/mcpClient';

/**
 * Google Gemini API integration for sending messages and receiving responses.
 */
let genai: GoogleGenAI | null = null;

/**
 * Model for a message in the chat application.
 */
const model: string = 'gemini-2.0-flash';

/**
 * Initializes the Google Gemini API client with the provided API key.
 *
 * @param apiKey - The API key for authenticating with the Google Gemini API.
 */
export const initializeGenAIInstance = (apiKey: string) => {
    if (!genai) {
        genai = new GoogleGenAI({
            apiKey: apiKey,
        });
    }
}

/// Script to send a message to Google Gemini API and return the response
export const sendMessageToGemini = async (
    message: string,
    enabledMcpClients: McpClient[],
): Promise<string|undefined> => {
    try {
        const allFunctionDeclarations: FunctionDeclaration[] = [];
        const allTools: Map<string, McpClient> = new Map();

        for (let i = 0; i < enabledMcpClients.length; i++) {
            const mcpClient = enabledMcpClients[i];
            const functionDeclarations: FunctionDeclaration[] = await mcpClient.convertAllToolsToGeminiFunctions();
            allFunctionDeclarations.push(...functionDeclarations);

            functionDeclarations.map((functionDeclaration) => {
                allTools.set(functionDeclaration.name ?? "", mcpClient);
            });
        }

        // Send the message to the Gemini API
        const response: GenerateContentResponse | undefined = await genai?.models.generateContent({
            model: model,
            contents: message,
            config: {
                tools: allFunctionDeclarations.length > 0 ? [
                    { functionDeclarations: allFunctionDeclarations }
                ] : undefined,
                toolConfig: allFunctionDeclarations.length > 0 ? {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.AUTO
                    }
                } : undefined
            }
        });
        
        if (!response) {
            throw new Error('Failed to get response from Gemini');
        }

        // Process function calls to see if any mcp tools need to be called
        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionResults = [];
            
            for (const functionCall of response.functionCalls) {
                const { name, args } = functionCall;

                // mcp client related to the tool
                const mcpClient: McpClient | undefined = allTools.get(name ?? "");

                if (!mcpClient) {
                    throw new Error(`No MCP client found for tool ${name}`);
                }

                const mcpResult = await mcpClient.executeTool(
                    name!, 
                    args!
                );
                
                functionResults.push({
                    name: name,
                    response: {
                        success: mcpResult.success,
                        content: mcpResult.content || mcpResult.error || 'No response'
                    }
                });
            }

            const followUpResponse: GenerateContentResponse = await genai!.models.generateContent({
                model: model,
                contents: [
                    message,
                    ...response.functionCalls.map(fc => ({
                        role: 'tool',
                        functionCall: fc
                    })),
                    ...functionResults.map(result => ({
                        role: 'tool',
                        functionResponse: {
                            name: result.name,
                            response: result.response
                        }
                    }))
                ]
            });

            return followUpResponse.text;
        }

        return response.text;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error sending message to Gemini: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while sending the message to Gemini');
        }
    }
};

