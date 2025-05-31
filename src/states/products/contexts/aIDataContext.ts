import { createContext, type Context } from "react";

/**
 * Props interface for AIDataContext.
 */
export interface AIDataContextProps {
    /**
     * Sends a message to the Gemini AI service and returns the response.
     * @param message - The message to send to the AI service.
     * @param apiKey - The API key for authenticating with the Gemini service.
     * @returns A promise that resolves to the AI's response.
     */
    handleSendMessageToGemini: (message: string, apiKey: string) => void;

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
     * Enables the Figma MCP (Model Context Provider) integration.
     */
    setEnableFigmaMCP: (enable: boolean) => void;

    /**
     * Indicates whether the Figma MCP integration is enabled.
     */
    enableFigmaMCP: boolean;
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
