import { Send } from "lucide-react";

/**
 * Props for the InputArea component.
 */
interface InputAreaProps {
    /**
     * Function to handle sending a message.
     */
    handleSendMessage: () => void;
    /**
     * Current input message.
     */
    inputMessage: string;
    /**
     * Function to set the input message.
     */
    setInputMessage: (message: string) => void;
    /**
     * Flag indicating if a Gemini call is in progress.
     */
    geminiCallLoading: boolean;
}

/**
 * InputArea component of the chat application.
 * 
 * @returns InputArea component for sending messages in a chat application.
 */
const InputArea = (props: InputAreaProps) => {
    const { handleSendMessage, inputMessage, setInputMessage, geminiCallLoading } = props;

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const onInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target: EventTarget & HTMLTextAreaElement = event.currentTarget;

        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
    }

    return (
        <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex items-center space-x-3">
                <div className="flex-1">
                    <textarea
                        value={inputMessage}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={1}
                        style={{
                            minHeight: '48px',
                            maxHeight: '120px',
                            height: 'auto'
                        }}
                        onInput={onInput}
                    />
                </div>
                <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || geminiCallLoading}
                    className="bg-blue-500 text-white p-3 rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default InputArea;