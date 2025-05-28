import { MessageCircle, Settings } from "lucide-react";

/**
 * Header component props interface.
 */
interface HeaderProps {
    /**
     * Function to toggle the visibility of settings.
     */
    setShowSettings: () => void;
}

/**
 * Header component for the AI Assistant application.
 */
const Hedaer = (props: HeaderProps) => {
    const { setShowSettings } = props;

    return (
        <div className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
                        <p className="text-sm text-gray-500">Powered by Google Gemini</p>
                    </div>
                </div>
                <button
                    onClick={setShowSettings}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Settings className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
}

export default Hedaer;
