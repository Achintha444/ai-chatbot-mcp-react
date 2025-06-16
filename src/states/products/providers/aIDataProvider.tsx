import type { FunctionComponent, PropsWithChildren, ReactElement } from "react";
import { useState } from 'react';
import { McpClient } from "../../../api/mcp/mcpClient";
import { initializeGenAIInstance, sendMessageToGemini } from "../../../api/sendMessageGemini";
import { availableMCPServerUrls } from "../../../assets/mcpServers";
import AIDataContext from "../contexts/aIDataContext";

/**
 * Props interface for the [AIDataProvider]
 */
export type AIDataProviderProps = PropsWithChildren;

/**
 * React context provider for the AI data.
 *
 * @param props - Props injected to the component.
 * @returns Internal authentication data context instance.
 */
const AIDataProvider: FunctionComponent<AIDataProviderProps> = (
    props: AIDataProviderProps
): ReactElement => {
    const { children } = props;

    const [geminCallLoading, setGeminiCallLoading] = useState(false);
    const [geminiCallError, setGeminiCallError] = useState<string | null>(null);
    const [geminCallResponse, setGeminiCallResponse] = useState<string | null>(null);
    const [enableMCPClients, setEnableMCPClients] = useState<Map<string, McpClient>>(new Map());

    /**
     * Initializes the Google Gemini API client with the provided API key.
     * 
     * @param apiKey - The API key for authenticating with the Google Gemini API.
     */
    const initializeGenAI = (apiKey: string) => {
        if (!apiKey) {
            throw new Error('Please set your Google Gemini API key in settings');
        }

        // Assuming sendMessageToGemini initializes the client internally
        initializeGenAIInstance(apiKey);
    };

    /**
     * Handles sending a message to the Gemini AI service.
     *
     * @param message - The message to send to the AI service.
     */
    const handleSendMessageToGemini = async (message: string) => {
        setGeminiCallLoading(true);

        try {
            const result: string | undefined = await sendMessageToGemini(
                message,
                Array.from(enableMCPClients.values())
            );

            if (!result) {
                setGeminiCallError('No response from Gemini');
                return;
            }

            setGeminiCallResponse(result);
            setGeminiCallError(null);
        } catch (error) {
            if (error instanceof Error) {
                setGeminiCallError(error.message || 'An error occurred while sending the message to Gemini');
            } else {
                setGeminiCallError('An unknown error occurred while sending the message to Gemini');
            }
            setGeminiCallResponse(null);
        } finally {
            setGeminiCallLoading(false);
        }
    };

    /**
     * Add mcp client to the context
     */
    const addMcpClientToContext = async (mcpClientIdentifier: string) => {
        if (enableMCPClients.get(mcpClientIdentifier)) {
            return;
        }

        const availableMCPServers: Map<string, McpClient> = new Map(enableMCPClients);
        const newMcpClient: McpClient = new McpClient(availableMCPServerUrls.get(mcpClientIdentifier)!);

        await newMcpClient.initializeWithStreamedHTTP();

        availableMCPServers.set(
            mcpClientIdentifier, newMcpClient,
        );

        setEnableMCPClients(availableMCPServers);
    }

    /**
     * Remove mcp client from the context
     */
    const removeMcpClientFromContext = async (mcpClientIdentifier: string) => {
        if (!enableMCPClients.get(mcpClientIdentifier)) {
            return;
        }

        const availableMCPServers: Map<string, McpClient> = new Map(enableMCPClients);
        const mcpClient: McpClient = availableMCPServers.get(mcpClientIdentifier)!;

        // close the connection
        await mcpClient.close();

        availableMCPServers.delete(mcpClientIdentifier);
        setEnableMCPClients(availableMCPServers);
    }

    /**
     * Check if given mcp client is enabled
     */
    const isMcpClientEnabled = (mcpClientIdentifier: string) => {
        return enableMCPClients.has(mcpClientIdentifier);
    }

    return (
        <AIDataContext.Provider
            value={{
                initializeGenAI: initializeGenAI,
                handleSendMessageToGemini: handleSendMessageToGemini,
                geminiCallResponse: geminCallResponse,
                geminiCallLoading: geminCallLoading,
                geminiCallError: geminiCallError,
                addMcpClientToContext: addMcpClientToContext,
                removeMcpClientFromContext: removeMcpClientFromContext,
                isMcpClientEnabled: isMcpClientEnabled,
            }}
        >
            {children}
        </AIDataContext.Provider>
    );
};

export default AIDataProvider;
