import { Socket } from 'socket.io';
import { llmService } from '../services/llmService';

export const setupLLMHandlers = (socket: Socket) => {
  console.log('Client connected to LLM service');

  socket.on('chat message', async (message: string) => {
    try {
      console.log('Received chat message:', message);

      // Send start marker
      socket.emit('chat response', '[START]');

      let fullResponse = '';
      let tokenCount = 0;

      // Process message with streaming
      await llmService.streamMessage(message, (token) => {
        fullResponse += token;
        tokenCount++;
        socket.emit('chat response', token);
        console.log(`Emitted token ${tokenCount}:`, token);
      });

      // Send end marker
      socket.emit('chat response', '[END]');

      console.log('Full LLM Response:', fullResponse);
      console.log('Total tokens emitted:', tokenCount);
    } catch (error) {
      console.error('LLM processing error:', error);
      const errorMessage = error instanceof Error 
        ? `[ERROR] ${error.message}` 
        : '[ERROR] Unknown error processing message';
      
      console.error('Sending error to client:', errorMessage);
      socket.emit('chat response', errorMessage);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from LLM service');
  });
};
