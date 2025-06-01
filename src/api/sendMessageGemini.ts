import { GoogleGenAI } from '@google/genai';

/**
 * Google Gemini API integration for sending messages and receiving responses.
 */
let genai: GoogleGenAI | null = null;

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
export const sendMessageToGemini = async (message: string): Promise<string> => {
    try {
        const response = await genai?.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: message,
        });

        if (!response?.text) {
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

