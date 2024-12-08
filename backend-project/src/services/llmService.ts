import ollama from 'ollama';
import * as process from 'process';
import { Tool } from '../types/llm';
import { Request } from '../models/Request';

// Define tools in Ollama's format
const tools: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'schedule_appointment',
            description: 'Schedule a medical appointment',
            parameters: {
                type: 'object',
                properties: {
                    symptoms: {
                        type: 'string',
                        description: 'Patient symptoms'
                    },
                    severity: {
                        type: 'string',
                        description: 'Severity',
                        enum: ['low', 'medium', 'high']
                    },
                    preferredDate: {
                        type: 'string',
                        description: 'Preferred date'
                    }
                },
                required: ['symptoms', 'severity']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'request_nurse_assistance',
            description: 'Request nurse help',
            parameters: {
                type: 'object',
                properties: {
                    urgency: {
                        type: 'string',
                        description: 'Urgency level',
                        enum: ['routine', 'urgent', 'emergency']
                    },
                    reason: {
                        type: 'string',
                        description: 'Reason for help'
                    }
                },
                required: ['urgency', 'reason']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_assistance_request',
            description: 'Create a nursing assistance request after confirming with the patient',
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
                    },
                    requiresConfirmation: {
                        type: 'boolean',
                        description: 'Whether to ask for patient confirmation before creating the request'
                    }
                },
                required: ['priority', 'description', 'department', 'requiresConfirmation']
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

1. Help patients with their immediate needs:
   - Comfort-related requests (blankets, pillows, room temperature)
   - Basic necessities (water, food, personal items)
   - Assistance with mobility or positioning
   - Pain management needs
   - Bathroom assistance

2. Understand and relay medical care needs:
   - Current discomfort or pain (scale 1-10)
   - Medication timing or questions
   - Changes in symptoms
   - Concerns about treatment

3. Communication guidelines:
   - Be warm and empathetic
   - Address the patient respectfully
   - Ask one question at a time
   - Confirm understanding of requests
   - Prioritize urgent needs
   - Maintain a calm, reassuring tone

4. Response protocol:
   - For medical assistance: Use request_nurse_assistance (urgent/emergency needs)
   - For routine care: Use schedule_appointment (doctor visits, procedures)
   - Always clarify the urgency level of requests

Keep responses focused on understanding and addressing the patient's immediate needs while ensuring their comfort and safety.`;

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

            // If there's a pending request and the user confirms
            if (context?.pendingRequest && userMessage.toLowerCase().includes('yes')) {
                try {
                    const request = new Request({
                        ...context.pendingRequest,
                        priority: context.pendingRequest.priority.toUpperCase()
                    });
                    await request.save();
                    
                    return {
                        text: `Perfect! I've submitted your request for assistance:\n\n` +
                              `Priority: ${context.pendingRequest.priority}\n` +
                              `Department: ${context.pendingRequest.department}\n` +
                              `Description: ${context.pendingRequest.description}\n` +
                              `Room: ${context.pendingRequest.room}\n\n` +
                              `A nurse will be notified and will assist you soon.`
                    };
                } catch (error) {
                    console.error('Error creating request:', error);
                    return {
                        text: 'I apologize, but I encountered an error while creating your request. Please try again or call for assistance using your bedside button.'
                    };
                }
            }
            
            // If there's a pending request and the user declines
            if (context?.pendingRequest && userMessage.toLowerCase().includes('no')) {
                return {
                    text: "I understand. I won't submit the request. Is there something else you'd like me to help you with?"
                };
            }

            // Add conversation context to the system prompt
            const enhancedSystemPrompt = `${this.systemPrompt}\n\nCurrent context:\n` +
                `- Patient Room: ${context?.room || 'Unknown'}\n` +
                `- Department: ${context?.department || 'General'}\n` +
                `- Previous Requests: ${context?.previousRequests || 'None'}\n\n` +
                `Based on the conversation, determine if a nursing assistance request should be created.`;

            const response = await this.retryWithBackoff(() =>
                ollama.chat({
                    model: 'mistral',
                    messages: [
                        { role: 'system', content: enhancedSystemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    stream: false,
                    tools: tools
                })
            );

            this.text = response.message.content;
            this.functionCall = response.message.tool_calls?.[0];

            if (this.functionCall) {
                const result = await this.handleFunctionCall(this.functionCall);
                if (!result) {
                    return {
                        text: "I apologize, but I couldn't process that request. Is there something else I can help you with?"
                    };
                }
                return {
                    text: result.text,
                    pendingRequest: result.pendingRequest
                };
            }

            return { text: this.text };
        } catch (error) {
            console.error('Error in processMessage:', error);
            return {
                text: 'I apologize, but I encountered an error. Please try again or call for assistance using your bedside button.'
            };
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
            case 'schedule_appointment':
                return {
                    text: `✓ Appointment scheduled: ${functionCall.arguments.symptoms} (${functionCall.arguments.severity} severity)`
                };

            case 'request_nurse_assistance':
                return {
                    text: `⚡ Nurse requested: ${functionCall.arguments.reason} (${functionCall.arguments.urgency})`
                };

            case 'create_assistance_request': {
                const { priority, description, department, requiresConfirmation } = functionCall.arguments;
                
                // Extract room and patient info from context if available
                const room = this.context?.room || 'Unknown';
                const patient = this.context?.patientId;
                
                if (requiresConfirmation) {
                    // Return a confirmation message to the patient
                    return {
                        text: `I'll help you create a request for nursing assistance. Here's what I understand:\n\n` +
                              `Priority: ${priority}\n` +
                              `Department: ${department}\n` +
                              `Description: ${description}\n` +
                              `Room: ${room}\n\n` +
                              `Would you like me to submit this request? Please confirm with "yes" or "no".`,
                        pendingRequest: {
                            priority,
                            description,
                            department,
                            room,
                            patient,
                            status: 'PENDING'
                        }
                    };
                } else {
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
            }

            default:
                throw new Error(`Unknown function: ${functionCall.name}`);
        }
    }
}

export const llmService = new LLMService();
