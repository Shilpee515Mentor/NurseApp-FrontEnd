import { llmService } from '../services/llmService';

async function testLLMService() {
    const testCases = [
        // Test case 1: Simple symptom description
        "I have a bad headache and fever since yesterday",
        
        // Test case 2: Emergency situation
        "I'm having severe chest pain and difficulty breathing",
        
        // Test case 3: Routine check-up
        "I'd like to schedule a regular check-up next week",
        
        // Test case 4: Nurse assistance
        "I need help getting to the bathroom",
        
        // Test case 5: Complex situation
        "My wound dressing needs to be changed, and I'd also like to schedule a follow-up appointment"
    ];

    console.log('Starting LLM Service Tests\n');

    for (const [index, message] of testCases.entries()) {
        console.log(`\nTest Case ${index + 1}: "${message}"`);
        console.log('-'.repeat(50));

        try {
            // Test streaming response
            console.log('Response:');
            await llmService.streamMessage(message, (token) => {
                process.stdout.write(token);
            });
            console.log('\n');
        } catch (error) {
            console.error(`Error in test case ${index + 1}:`, error);
        }
    }
}

// Run the tests
testLLMService().catch(console.error);
