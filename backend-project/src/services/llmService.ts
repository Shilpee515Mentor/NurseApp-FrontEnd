import ollama from 'ollama';
import * as process from 'process';
import { Tool } from '../types/llm';
import { Request } from '../models/Request';

// Define tools in Ollama's format
const tools: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'create_request',
            description: 'Create a patient assistance request',
            parameters: {
                type: 'object',
                properties: {
                    priority: {
                        type: 'string',
                        enum: ['low', 'medium', 'high'],
                        description: 'Priority level of the request'
                    },
                    description: {
                        type: 'string',
                        description: 'Detailed description of the assistance needed'
                    },
                    department: {
                        type: 'string',
                        enum: [
                            'Emergency',
                            'Intensive Care',
                            'Pediatrics',
                            'Maternity',
                            'Oncology',
                            'Cardiology',
                            'Neurology',
                            'Orthopedics',
                            'Psychiatry',
                            'Rehabilitation',
                            'Geriatrics',
                            'Surgery',
                            'Outpatient'
                        ],
                        description: 'Department responsible for handling the request'
                    }
                },
                required: ['priority', 'description', 'department']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_patient_requests',
            description: 'Retrieve patient requests',
            parameters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
                        description: 'Filter requests by status'
                    },
                    patientId: {
                        type: 'string',
                        description: 'ID of the patient'
                    }
                },
                required: ['patientId']
            }
        }
    }
];

interface AssistanceRequest {
    priority: string;
    description: string;
    department: string;
    status: string;
    room: string;
    patient: string;
}

interface FunctionCallResult {
    text: string;
    pendingRequest?: AssistanceRequest;
}

class LLMService {
    private ollamaHost: string;
    private text: string = '';
    private functionCall: any = null;
    private pendingRequest: AssistanceRequest | null = null;
    private context: any;

    constructor() {
        // Always use the default Ollama port, regardless of environment variable
        this.ollamaHost = 'http://localhost:11434';
        console.log('Ollama Host:', this.ollamaHost);
    }

    private systemPrompt = `You are a helpful hospital assistant for admitted patients. Your role is to:

1. Engage in a natural conversation with patients to understand their needs:
   - Ask clarifying questions when needed
   - Maintain context of the conversation
   - Show empathy and understanding

2. Collect relevant information for assistance requests:
   - Nature of the assistance needed
   - Urgency/priority level
   - Relevant medical context
   - Department that should handle the request

3. Before creating a request:
   - Summarize the patient's needs
   - Ask for confirmation
   - Explain what will happen next

4. Response protocol:
   - Use create_request for new assistance requests
   - Use get_patient_requests to check status of existing requests
   - Always maintain a conversational tone
   - Prioritize patient safety and comfort

Format your responses using this JSON structure:
{
    "thoughts": "Your internal reasoning about the situation",
    "response": "Your response to the patient",
    "function_call": {
        "name": "function_name",
        "parameters": {}
    }
}`;

    private async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                return await operation();
            } catch (error) {
                retries++;
                console.warn(`Attempt ${retries} failed:`, error);

                // Specific error handling
                if (error instanceof Error) {
                    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
                        console.error('Ollama service connection failed. Ensure Ollama is running.');
                        
                        // Attempt to start Ollama (platform-specific)
                        if (process.platform === 'win32') {
                            try {
                                const { exec } = require('child_process');
                                exec('start "" "C:\\Program Files\\Ollama\\ollama.exe"', (error:any) => {
                                    if (error) {
                                        console.error('Failed to start Ollama:', error);
                                    }
                                });
                            } catch (startError) {
                                console.error('Could not attempt to start Ollama:', startError);
                            }
                        }
                    }
                }

                // Wait before retrying with exponential backoff
                const delay = Math.pow(2, retries) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error(`Operation failed after ${maxRetries} attempts`);
    }

    async processMessage(userMessage: string, context?: any): Promise<{ text: string; functionCall?: any; pendingRequest?: any }> {
        try {
            // Store context for use in handleFunctionCall
            this.context = context || {};

            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...(context?.previousMessages || []),
                { role: 'user', content: userMessage }
            ];

            const response = await this.retryWithBackoff(() =>
                ollama.chat({
                    model: 'mistral',
                    messages,
                    format: 'json',
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 1024,
                    }
                })
            );

            const result = JSON.parse(response.message.content);
            
            // Handle function calls if present
            if (result.function_call) {
                const functionResult = await this.handleFunctionCall(result.function_call);
                if (functionResult) {
                    return {
                        text: result.response + '\n' + functionResult.text,
                        functionCall: result.function_call,
                        pendingRequest: functionResult.pendingRequest
                    };
                }
            }

            return {
                text: result.response,
                functionCall: result.function_call
            };
        } catch (error) {
            console.error('Error in processMessage:', error);
            throw error;
        }
    }

    async streamMessage(userMessage: string, onToken: (token: string) => void): Promise<void> {
        return this.retryWithBackoff(async () => {
            try {
                console.log('Streaming message:', userMessage);
                console.log('System Prompt:', this.systemPrompt);
                console.log('Using Ollama Host:', this.ollamaHost);

                // Validate input
                if (!userMessage || userMessage.trim() === '') {
                    throw new Error('Empty message provided');
                }

                // Signal start of streaming
                onToken('[START]');

                // Attempt to ping Ollama service before making request
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const response = await fetch(`${this.ollamaHost}/api/version`, {
                        method: 'GET',
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error('Ollama service not responding');
                    }

                    const version = await response.json();
                    console.log('Ollama version:', version);
                } catch (pingError) {
                    console.error('Ollama service ping failed:', pingError);
                    throw new Error('Ollama service is not available');
                }

                const stream = await ollama.chat({
                    model: 'nemotron-mini',
                    messages: [
                        { 
                            role: 'system', 
                            content: this.systemPrompt + '\n\nIMPORTANT: Focus on having a natural conversation. Ask questions to understand the patient\'s concerns.' 
                        },
                        { role: 'user', content: userMessage }
                    ],
                    stream: true,
                    options: {
                        temperature: 0.7,
                        top_k: 40,
                        top_p: 0.9,
                        num_ctx: 512,
                        repeat_penalty: 1.1
                    }
                });

                let tokenCount = 0;
                let hasContent = false;

                for await (const part of stream) {
                    tokenCount++;
                    console.log(`Received token ${tokenCount}:`, part);

                    if (part.message?.content) {
                        hasContent = true;
                        onToken(part.message.content);
                    }
                }

                if (!hasContent) {
                    onToken('I apologize, but I was unable to generate a response. Please try again.');
                }

                // Signal end of streaming
                onToken('[END]');
            } catch (error: unknown) {
                console.error('Streaming error:', error);
                onToken('An error occurred while processing your message.');
                onToken('[END]');
                throw error;
            }
        });
    }

    async handleFunctionCall(functionCall: any): Promise<FunctionCallResult | null> {
        if (!functionCall) return null;

        switch (functionCall.name) {
            case 'create_request': {
                const { priority, description, department } = functionCall.parameters;
                
                // Extract room and patient info from context if available
                const room = this.context?.room || 'Unknown';
                const patient = this.context?.patientId;
                
                // Create the request immediately using the Request model
                try {
                    const request = new Request({
                        priority: priority.toUpperCase(),
                        description,
                        department,
                        room,
                        patient,
                        status: 'PENDING'
                    });
                    await request.save();
                    
                    return {
                        text: `I've created a request for nursing assistance:\n\n` +
                              `Priority: ${priority}\n` +
                              `Department: ${department}\n` +
                              `Description: ${description}\n` +
                              `Room: ${room}\n\n` +
                              `A nurse will be notified and will assist you soon.`
                    };
                } catch (error) {
                    console.error('Error creating request:', error);
                    return {
                        text: 'I apologize, but I encountered an error while creating your request. Please try again or call for assistance using your bedside button.'
                    };
                }
            }

            case 'get_patient_requests': {
                const { status, patientId } = functionCall.parameters;
                
                // Retrieve patient requests from database
                try {
                    const requests = await Request.find({ patientId, status });
                    return {
                        text: `Here are your requests:\n\n` +
                              requests.map(request => `Priority: ${request.priority}\nDepartment: ${request.department}\nDescription: ${request.description}\nRoom: ${request.room}\nStatus: ${request.status}`).join('\n\n')
                    };
                } catch (error) {
                    console.error('Error retrieving requests:', error);
                    return {
                        text: 'I apologize, but I encountered an error while retrieving your requests. Please try again or call for assistance using your bedside button.'
                    };
                }
            }

            default:
                throw new Error(`Unknown function: ${functionCall.name}`);
        }
    }
}

export const llmService = new LLMService();
