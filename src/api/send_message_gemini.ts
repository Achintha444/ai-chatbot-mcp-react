/// Script to send a message to Google Gemini API and return the response
const sendMessageToGemini = async (message: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error('Please set your Google Gemini API key in settings');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: message
                }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini');
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response received';
}

export default sendMessageToGemini;
