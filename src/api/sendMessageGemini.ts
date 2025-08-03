import { FunctionCallingConfigMode, GenerateContentResponse, GoogleGenAI, type FunctionDeclaration } from '@google/genai';

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
): Promise<string | undefined> => {
    try {
        const allFunctionDeclarations: FunctionDeclaration[] = [];

        // Initial content structure
        const initialContent = {
            role: 'user',
            parts: [{ text: message }]
        };

        // Send the message to the Gemini API
        const response: GenerateContentResponse | undefined = await genai?.models.generateContent({
            model: model,
            contents: [ initialContent ],
            config: {
                tools: allFunctionDeclarations.length > 0 ? [
                    { functionDeclarations: allFunctionDeclarations }
                ] : undefined,
                toolConfig: allFunctionDeclarations.length > 0 ? {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.ANY,
                    }
                } : undefined
            }
        });

        if (!response) {
            throw new Error('Failed to get response from Gemini');
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
