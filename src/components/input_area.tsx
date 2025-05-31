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
            <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3">
                <textarea
                    value={inputMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 resize-none text-gray-800"
                    rows={1}
                    onInput={onInput}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || geminiCallLoading}
                    className="flex-none bg-blue-500 text-white p-3 rounded-2xl hover:bg-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default InputArea;