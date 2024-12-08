import React, { createContext, useContext, useState, useEffect } from 'react';
import { llmService } from '../services/llmService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isComplete?: boolean;
}

interface LLMContextType {
  messages: Message[];
  sendMessage: (text: string) => void;
  isTyping: boolean;
}

const LLMContext = createContext<LLMContextType | undefined>(undefined);

export function LLMProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const unsubscribe = llmService.onMessage((text: string) => {
      if (text === '[START]') {
        setIsTyping(true);
        setCurrentMessage('');
      } else if (text === '[END]') {
        setIsTyping(false);
        if (currentMessage) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              text: currentMessage,
              sender: 'ai',
              timestamp: new Date(),
            },
          ]);
          setCurrentMessage('');
        }
      } else {
        setCurrentMessage(prev => prev + text);
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage && lastMessage.sender === 'ai' && !lastMessage.isComplete) {
            lastMessage.text += text;
            return newMessages;
          }
          
          return [
            ...prev,
            {
              id: Date.now().toString(),
              text: text,
              sender: 'ai',
              timestamp: new Date(),
              isComplete: false,
            },
          ];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
    llmService.sendMessage(text);
  };

  return (
    <LLMContext.Provider value={{ messages, sendMessage, isTyping }}>
      {children}
    </LLMContext.Provider>
  );
}

export function useLLM() {
  const context = useContext(LLMContext);
  if (context === undefined) {
    throw new Error('useLLM must be used within a LLMProvider');
  }
  return context;
}
