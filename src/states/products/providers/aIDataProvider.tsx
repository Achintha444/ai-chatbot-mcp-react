import type { FunctionComponent, PropsWithChildren, ReactElement } from "react";
import { initializeGenAIInstance, sendMessageToGemini } from "../../../api/sendMessageGemini";
import AIDataContext from "../contexts/aIDataContext";
import { useState } from 'react';

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
            const result = await sendMessageToGemini(message);
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

    return (
        <AIDataContext.Provider
            value={{
                initializeGenAI: initializeGenAI,
                handleSendMessageToGemini: handleSendMessageToGemini,
                geminiCallResponse: geminCallResponse,
                geminiCallLoading: geminCallLoading,
                geminiCallError: geminiCallError
            }}
        >
            {children}
        </AIDataContext.Provider>
    );
};

export default AIDataProvider;
