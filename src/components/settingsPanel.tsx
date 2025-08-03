import { useState } from "react";
import useAIData from "../states/products/hooks/useAIData";

/**
* Interface for the Settings component props.
*/
interface SettingsPanelProps {
    /**
     * Function to toggle the visibility of the settings panel.
     *
     * @param show - Boolean indicating whether to show or hide the settings.
     */
    setShowSettings: (show: boolean) => void;
}


/**
* Tthe settings component allows users to configure their API key for Google Gemini.
*
* @returns A React component for configuring API settings.
*/
const SettingsPanel = (props: SettingsPanelProps) => {
    const { setShowSettings } = props;

    // State to hold the API key input by the user
    const [apiKey, setApiKey] = useState('');

    const { initializeGenAI } = useAIData();
    
    /**
     * Initialize the Google Gemini API client with the provided API key.
     */
    const handleSaveApiKey = () => {
        if (!apiKey.trim()) {
            console.error("API key cannot be empty");
            return;
        }
        try {
            initializeGenAI(apiKey);
            console.log("Google Gemini API initialized with key:", apiKey);
        } catch (error) {
            console.error("Error initializing Google Gemini API:", error);
        }
        setShowSettings(false);
    };


    return (
        <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="p-4 max-w-4xl mx-auto flex-col items-cente space-y-6">
                <div className="flex-1 flex-col items-start justify-between">
                    <h3 className="font-semibold text-gray-800 mb-2">API Configuration</h3>
                    <div className="flex items-center space-x-3">
                        <input
                            type="password"
                            placeholder="Enter your Google Gemini API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        />
                        <button
                            onClick={handleSaveApiKey}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        Get your free API key from{' '}
                        <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            Google AI Studio
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}


export default SettingsPanel
