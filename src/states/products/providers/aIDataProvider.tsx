import type { FunctionComponent, PropsWithChildren, ReactElement } from "react";
import sendMessageToGemini from "../../../api/send_message_gemini";
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
     * Handles sending a message to the Gemini AI service.
     *
     * @param message - The message to send to the AI service.
     * @param apiKey - The API key for authenticating with the Gemini service.
     */
    const handleSendMessageToGemini = async (message: string, apiKey: string) => {
        setGeminiCallLoading(true);

        try {
            const result = await sendMessageToGemini(message, apiKey);
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
