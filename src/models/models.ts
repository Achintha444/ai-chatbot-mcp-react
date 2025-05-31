/**
 * Message model for a chat application.
 */
export interface Message {
    /**
     * Unique identifier for the message.
     */
    id: number;

    /**
     * The text content of the message.
     */
    text: string,

    /**
     * Sender of the message, either 'user' or 'bot'.
     */
    sender: 'user' | 'bot',

    /**
     * Timestamp of when the message was sent.
     */
    timestamp: Date,

    /**
     * Optional flag to indicate if the message is an error.
     */
    isError?: boolean
}
