import React, { useState } from 'react';
import { MessageSquare, Phone, Mail } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import type { Message, ChatState } from './types';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
  });

  const sendMessageToBackend = async (content: string) => {
    setChatState(prev => ({ ...prev, isTyping: true }));
    
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });
      
      const data = await response.json();
      
      setChatState(prev => ({
        isTyping: false,
        messages: [...prev.messages, {
          id: Date.now().toString(),
          content: data.response,
          sender: 'agent',
          timestamp: new Date(),
        }],
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    sendMessageToBackend(content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="text-blue-600" />
              Chat Support
            </h1>
            <div className="flex items-center gap-4">
              <a href="tel:+5511999999999" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <Phone size={20} />
                <span>(11) 99999-9999</span>
              </a>
              <a href="mailto:contato@empresa.com" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <Mail size={20} />
                <span>contato@empresa.com</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-[600px] overflow-y-auto p-4">
          {chatState.messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {chatState.isTyping && (
            <div className="flex items-center gap-2 text-gray-500 ml-4">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>

        <ChatInput onSendMessage={handleSendMessage} />
      </main>
    </div>
  );
}

export default App