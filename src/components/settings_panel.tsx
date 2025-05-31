/**
 * Interface for the Settings component props.
 */
interface SettingsPanelProps {
    /**
     * The current API key for Google Gemini.
     */
    apiKey: string;
    /**
     * Function to update the API key.
     * 
     * @param key - The new API key to set.
     */
    setApiKey: (key: string) => void;
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
    const { apiKey, setApiKey, setShowSettings } = props;

    return (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="max-w-4xl mx-auto">
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
                        onClick={() => setShowSettings(false)}
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
    );
}

export default SettingsPanel;