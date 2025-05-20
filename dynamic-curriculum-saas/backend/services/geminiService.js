const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    console.error("[Gemini Service] FATAL: GEMINI_API_KEY is not set or empty.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function generateLearningPath(currentSkills, desiredSkillsGoal) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("[Gemini Service] FATAL: GEMINI_API_KEY is not set.");
        throw new Error("Gemini API key not configured on server.");
    }
    

    console.log("[Gemini Service] @google/generative-ai version:", require('@google/generative-ai/package.json').version);
    
    try {
        console.log("[Gemini Service] Creating model with name: gemini-pro");
        
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest", 
            generationConfig,
            safetySettings,
        });
        
        const prompt = `
            You are an expert Learning and Development curriculum designer.
            An employee has the following current skills: "${currentSkills}".
            Their desired skills or career goal is: "${desiredSkillsGoal}".

            Generate a 3 to 5-step learning path to help them achieve their goal.
            For each step, provide:
            1. "topic": A concise name for the learning topic (e.g., "Introduction to Python Basics").
            2. "description": A brief (1-2 sentences) explanation of what the step covers and why it's important for their goal.
            3. "suggested_link": A URL to a high-quality, publicly available, and directly accessible online resource (e.g., specific article, tutorial, documentation page, YouTube video). Avoid generic homepage links.

            Format the output as a VALID JSON array of objects. Each object must have only the keys "topic", "description", and "suggested_link". Do not include any text before or after the JSON array.
            Example:
            [
              {
                "topic": "Understanding Core Python",
                "description": "Learn Python's fundamental syntax, data types, and control flow.",
                "suggested_link": "https://docs.python.org/3/tutorial/"
              }
            ]
        `;

        console.log(`[Gemini Service] Sending prompt to Gemini`);
        
        // Use a very simple generation call first to diagnose
        let result;
        try {
            // Log the full model object for debugging
            console.log("[Gemini Service] Model configuration:", {
                modelName: model.modelName,
                hasGenerateContent: typeof model.generateContent === 'function'
            });
            
            // Try a simple test first
            console.log("[Gemini Service] Testing with simple prompt first");
            const testResult = await model.generateContent("Hello, can you respond with a simple test?");
            console.log("[Gemini Service] Test successful!");
            
            // If test succeeds, try the real prompt
            result = await model.generateContent(prompt);
        } catch (apiError) {
            console.error("[Gemini Service] API Error details:", {
                message: apiError.message,
                name: apiError.name,
                stack: apiError.stack?.slice(0, 500)
            });
            
            // Try updating the package if needed
            throw new Error(`Gemini API call failed: ${apiError.message}`);
        }
        
        const response = await result.response;
        const textResponseFromAI = response.text();
        
        console.log("[Gemini Service] Successfully received response from Gemini");
        
        // Process the response as before
        let jsonString = textResponseFromAI;
        const markdownMatch = textResponseFromAI.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
        } else {
            const firstBracket = jsonString.indexOf('[');
            const firstBrace = jsonString.indexOf('{');
            let start = -1;
            if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) start = firstBracket;
            else if (firstBrace !== -1) start = firstBrace;

            if (start !== -1) {
                const lastBracket = jsonString.lastIndexOf(']');
                const lastBrace = jsonString.lastIndexOf('}');
                let end = -1;
                if (start === firstBracket && lastBracket !== -1) end = lastBracket;
                else if (start === firstBrace && lastBrace !== -1) end = lastBrace;
                
                if (end !== -1 && end > start) jsonString = jsonString.substring(start, end + 1);
            }
        }
        jsonString = jsonString.trim();
        
        const learningPath = JSON.parse(jsonString);
        
        if (!Array.isArray(learningPath) || learningPath.length === 0 ||
            learningPath.some(step => typeof step.topic !== 'string' || 
                                      typeof step.description !== 'string' || 
                                      typeof step.suggested_link !== 'string')) {
            console.error("[Gemini Service] Invalid JSON structure or empty array received from Gemini.", learningPath);
            throw new Error("AI returned an invalid or empty learning path structure.");
        }
        
        return learningPath.map(step => ({ ...step, completed: false }));
    } catch (error) {
        console.error("[Gemini Service] Error during Gemini interaction or parsing:", 
                      error.message, 
                      error.stack ? `\nStack (short): ${error.stack.substring(0, 500)}`: '');
        
        const serviceError = new Error(`Failed to generate learning path from AI. ${error.name === 'GoogleGenerativeAIError' ? 'AI service error.' : 'Data processing error.'}`);
        serviceError.statusCode = 500; 
        serviceError.originalErrorName = error.name;
        serviceError.originalErrorMessage = error.message;
        throw serviceError; 
    }
}

module.exports = { generateLearningPath };