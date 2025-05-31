import type { FunctionComponent, PropsWithChildren, ReactElement } from "react";
import sendMessageToGemini from "../../../api/send_message_gemini";
import AIDataContext from "../contexts/aIDataContext";
import { useState, useCallback, useRef, useEffect } from 'react';
import MCPFigmaService from "../../../api/mcp/figma_mcp_service";

/**
 * Props interface for the [AIDataProvider]
 */
export type AIDataProviderProps = PropsWithChildren;

/**
 * React context provider for the AI data with Figma MCP integration.
 *
 * @param props - Props injected to the component.
 * @returns Internal authentication data context instance.
 */
const AIDataProvider: FunctionComponent<AIDataProviderProps> = (
    props: AIDataProviderProps
): ReactElement => {
    const { children } = props;

    const [geminiCallLoading, setGeminiCallLoading] = useState(false);
    const [geminiCallError, setGeminiCallError] = useState<string | null>(null);
    const [geminiCallResponse, setGeminiCallResponse] = useState<string | null>(null);

    const [enableFigmaMCP, setEnableFigmaMCP] = useState(false);
    const [mcpConnected, setMcpConnected] = useState(false);

    const mcpServiceRef = useRef<MCPFigmaService | null>(null);

    // Initialize MCP service on mount
    useEffect(() => {
        const initializeMCP = async () => {
            try {
                mcpServiceRef.current = new MCPFigmaService();
                await mcpServiceRef.current.initialize();
                setMcpConnected(true);
            } catch (error) {
                console.error('Failed to initialize MCP Figma service:', error);
                setMcpConnected(false);
            }
        };

        // Only initialize if Figma MCP integration is enabled
        if (enableFigmaMCP) {
            initializeMCP();
        }

    }, [enableFigmaMCP]);

    /**
     * Fetch current Figma context from MCP server
     */
    const fetchFigmaContext = useCallback(async (): Promise<string | null> => {
        if (!mcpServiceRef.current || !mcpConnected) {
            throw new Error('MCP Figma service not connected');
        }

        try {
            const context = await mcpServiceRef.current.getFigmaContext();
            const formattedContext = mcpServiceRef.current.formatContextForGemini(context);
            return formattedContext;
        } catch (error) {
            console.error('Failed to fetch Figma context:', error);
            throw error;
        }
    }, [mcpConnected]);

    /**
     * Handles sending a message to the Gemini AI service with optional Figma context.
     *
     * @param message - The message to send to the AI service.
     * @param apiKey - The API key for authenticating with the Gemini service.
     * @param includeFigmaContext - Whether to include current Figma context in the message.
     */
    const handleSendMessageToGemini = async (
        message: string,
        apiKey: string,
    ) => {
        setGeminiCallLoading(true);
        setGeminiCallError(null);

        try {
            let contextualMessage = message;

            // Add Figma context if requested and available
            if (enableFigmaMCP && mcpConnected) {
                try {
                    const context: string | null = await fetchFigmaContext();

                    // If context is available, prepend it to the message
                    if (context) {
                        contextualMessage = `${context}\n\nUser Question: ${message}`;
                    } else {
                        contextualMessage = `User Question: ${message}`;
                    }
                } catch (contextError) {
                    console.warn('Failed to fetch Figma context, proceeding without it:', contextError);
                    // Continue with original message if context fetch fails
                }
            }

            // Send the message to Gemini API
            const result: string = await sendMessageToGemini(contextualMessage, apiKey);

            setGeminiCallResponse(result);
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

    return (
        <AIDataContext.Provider
            value={{
                // Original Gemini functionality
                handleSendMessageToGemini: handleSendMessageToGemini,
                geminiCallResponse: geminiCallResponse,
                geminiCallLoading: geminiCallLoading,
                geminiCallError: geminiCallError,

                // Figma MCP integration
                setEnableFigmaMCP: setEnableFigmaMCP,
                enableFigmaMCP: enableFigmaMCP,
            }}
        >
            {children}
        </AIDataContext.Provider>
    );
};

export default AIDataProvider;
