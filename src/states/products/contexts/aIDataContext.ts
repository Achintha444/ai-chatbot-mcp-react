import { createContext, type Context } from "react";

/**
 * Props interface for AIDataContext.
 */
export interface AIDataContextProps {
    /**
     * Initializes the Google Gemini API client with the provided API key.
     * @param apiKey - The API key for authenticating with the Google Gemini API.
     */
    initializeGenAI: (apiKey: string) => void;

    /**
     * Sends a message to the Gemini AI service and returns the response.
     * @param message - The message to send to the AI service.
     * @returns A promise that resolves to the AI's response.
     */
    handleSendMessageToGemini: (message: string) => void;

    /**
     * Response from the Gemini AI service.
     */
    geminiCallResponse: string | null;

    /**
     * Indicates whether the Gemini AI service call is loading.
     */
    geminiCallLoading: boolean;

    /**
     * Error message from the Gemini AI service call, if any.
     */
    geminiCallError: string | null;
    
    /**
     * Add mcp client to the context
     */
    addMcpClientToContext: (mcpClientIdentifier: string) => Promise<void>;

    /**
     * Remove mcp client from the context
     */
    removeMcpClientFromContext: (mcpClientIdentifier: string) => Promise<void>;
}

/**
 * Context object for managing the AIDataContext.
 */
const AIDataContext: Context<null | AIDataContextProps> = createContext<
    null | AIDataContextProps
>(
    null
);

/**
 * Display name for the AIDataContext.
 */
AIDataContext.displayName = "AIDataContext";

export default AIDataContext;
