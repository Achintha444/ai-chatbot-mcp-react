import { useEffect, useRef, useState } from 'react';
import Hedaer from './components/header';
import InputArea from './components/inputArea';
import MessageArea from './components/messageArea';
import SettingsPanel from './components/settingsPanel';
import type { Message } from './models/models';
import useAIData from './states/products/hooks/useAIData';

const GeminiChatbot = () => {
  const { handleSendMessageToGemini, geminiCallResponse, geminiCallLoading, geminiCallError } = useAIData();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  /**
   * Scrolls the message area to the bottom when new messages are added.
   */
  const scrollToBottom = () => {
    (messagesEndRef.current as HTMLDivElement | null)?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when the component mounts or messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add message to the messages array when geminiCallResponse changes
  useEffect(() => {
    if (geminiCallResponse) {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: geminiCallResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }
  }, [geminiCallResponse]);

  // Add error message to the messages array when geminiCallError changes
  useEffect(() => {
    if (geminiCallError) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Error: ${geminiCallError}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [geminiCallError]);

  // Handle sending a message to the Gemini AI service
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Call the Gemini AI service with the user's message and API key
    handleSendMessageToGemini(userMessage.text);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Hedaer setShowSettings={() => setShowSettings(!showSettings)} />

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          setShowSettings={setShowSettings}
        />
      )}

      {/* Messages Area */}
      <MessageArea
        messages={messages}
        geminiCallLoading={geminiCallLoading}
        messagesEndRef={messagesEndRef}
      />

      {/* Input Area */}
      <InputArea
        handleSendMessage={handleSendMessage}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        geminiCallLoading={geminiCallLoading}
      />
    </div>
  );
};

export default GeminiChatbot;
