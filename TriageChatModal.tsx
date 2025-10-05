import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { X, Send } from 'lucide-react';
import { apiUrl } from '../config/api';

export default function TriageChatModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hello! I can help you find the right department. Please describe your symptoms.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
  const response = await fetch(apiUrl('/api/triage/ask'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: input }),
        });
        const data = await response.json();
        const aiMessage = { from: 'ai', text: data.reply };
        setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    console.error(error);
    const errorMessage = { from: 'ai', text: 'Sorry, I am having trouble connecting. Please try again later.' };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg flex flex-col h-[70vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI Symptom Checker</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded-lg space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.from === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                 dangerouslySetInnerHTML={{ __html: msg.text }} // To render bold text from AI
              />
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <p className="max-w-xs p-3 rounded-2xl bg-gray-200 text-gray-500 animate-pulse">
                Thinking...
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
            placeholder="For example: 'I have a broken bone in my arm'"
            className="flex-1 p-3 border rounded-lg"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}