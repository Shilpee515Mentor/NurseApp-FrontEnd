import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../config/environment';

class LLMService {
  private socket: Socket;
  private messageCallbacks: ((message: string) => void)[] = [];
  private isConnected: boolean = false;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      // Get socket URL from configuration
      const socketUrl = CONFIG.SOCKET_URL;
      console.log('Initializing socket with URL:', socketUrl);
      
      this.socket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'], // Force websocket transport
        forceNew: true,
        timeout: 5000, // 5 seconds timeout
      });

      this.socket.on('connect', () => {
        console.log('Connected to LLM service');
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from LLM service:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('Connection error details:', error);
        console.error('Socket URL:', socketUrl);
        this.isConnected = false;
      });

      this.socket.on('chat response', (data: string) => {
        console.log('Received chat response:', data);
        // Handle streaming responses
        if (data === '[START]') {
          // Clear previous messages or prepare for new stream
          return;
        }
        if (data === '[END]') {
          // Finalize stream
          return;
        }
        if (data.startsWith('[ERROR]')) {
          console.error('LLM Service Error:', data);
          return;
        }
        
        // Normal message processing
        this.messageCallbacks.forEach(callback => callback(data));
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  }

  public sendMessage(message: string): void {
    if (!this.isConnected) {
      console.warn('Not connected to LLM service. Attempting to reconnect...');
      this.initializeSocket();
    }
    this.socket.emit('chat message', message);
  }

  public onMessage(callback: (message: string) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.messageCallbacks = [];
    this.isConnected = false;
  }
}

export const llmService = new LLMService();
