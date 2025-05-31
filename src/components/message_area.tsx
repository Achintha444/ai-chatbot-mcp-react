import { Bot, User } from "lucide-react";
import type { Message } from "../models/models";

/**
 * Props interface for the MessageArea component.
 */
interface MessageAreaProps {
    /**
     * Array of messages to display in the message area.
     */
    messages: Message[];
    /**
     * Flag indicating if a Gemini call is in progress.
     */
    geminiCallLoading: boolean;
    /**
     * Reference to the end of the messages for scrolling.
     */
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * MessageArea component of the chat application.
 * 
 * @param props - Props injected to the component.
 * @returns 
 */
const MessageArea = (props: MessageAreaProps) => {
    const { messages, geminiCallLoading, messagesEndRef } = props;

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getSenderIcon = (sender: string) => {
        switch (sender) {
            case 'user':
                return <User className="w-4 h-4 text-white" />;
            case 'bot':
                return <Bot className="w-4 h-4 text-white" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={
                            `flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`
                        }
                    >
                        <div className={
                            `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                                ? 'bg-blue-500'
                                : message.isError
                                    ? 'bg-red-500'
                                    : 'bg-gray-500'
                            }`
                        }
                        >
                            {getSenderIcon(message.sender)}
                        </div>
                        <div className={
                            `flex-1 max-w-3xl ${message.sender === 'user' ? 'text-right' : ''}`
                        }
                        >
                            <div className={`inline-block px-4 py-3 rounded-2xl ${message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : message.isError
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                }`}
                            >
                                <p className="whitespace-pre-wrap break-words">
                                    {message.text}
                                </p>
                            </div>
                            <p className={
                                `text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : ''
                                }`}
                            >
                                {formatTime(message.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}

                {
                    geminiCallLoading &&
                    <LoadingIndicator />
                }

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

/**
 * LoadingIndicator component to show a loading state in the message area.
 * 
 * @returns LoadingIndicator component that displays a loading animation while waiting for a response from the bot.
 */
const LoadingIndicator = () => {
    return (
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default MessageArea;