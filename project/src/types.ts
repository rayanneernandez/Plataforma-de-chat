export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
}