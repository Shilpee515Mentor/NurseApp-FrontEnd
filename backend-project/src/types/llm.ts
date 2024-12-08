export interface FunctionCall {
    function: {
        name: string;
        arguments: string;
    };
}

export interface ToolParameter {
    type: string;
    description: string;
    enum?: string[];
}

export interface ToolFunction {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: {
            [key: string]: ToolParameter;
        };
        required?: string[];
    };
}

export interface Tool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: {
                [key: string]: ToolParameter;
            };
            required: string[];
        };
    };
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    function_call?: FunctionCall;
}

export interface ChatRequest {
    model: string;
    messages: ChatMessage[];
    stream?: boolean;
    functions?: Tool[];
}
