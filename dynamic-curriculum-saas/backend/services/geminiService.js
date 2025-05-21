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
        For an employee with current skills: "${currentSkills}"
        And their desired skills or career goal: "${desiredSkillsGoal}"

        Generate a detailed, step-by-step learning path. The path should include a mix of lesson content, quizzes to check understanding, practical challenges, and links to external resources or videos where appropriate.
        
        For each step in the path, provide the following in a JSON object:
        1.  "title": A concise title for the step (e.g., "Understanding Python Variables").
        2.  "step_type": Choose ONE from: "lesson", "quiz", "challenge", "external_resource", "video".
        3.  "estimated_duration_minutes": (Optional) An integer estimate.
        4.  "details": An object containing specific content for the step_type:
            *   If "lesson": Provide "markdown_content" (string): Detailed explanatory text in Markdown format. This can include concepts, examples, and code snippets.
            *   If "quiz": Provide "quiz_questions" (array of objects): Each object should have "question_text" (string), "question_type" (string, e.g., "multiple_choice", "true_false"), "options" (array of strings for multiple_choice), and "correct_answer" (string or index of correct option). Include 2-3 questions. Add an "explanation" (string) for the correct answer.
            *   If "challenge": Provide "challenge_description" (string): A practical task or problem for the employee to solve.
            *   If "external_resource": Provide "external_url" (string): A direct URL to a high-quality external article, documentation, or tool. And "resource_summary" (string): A brief summary of what the resource covers.
            *   If "video": Provide "video_url" (string): A direct URL to an educational video (e.g., YouTube). And "video_summary" (string): A brief summary of the video content.

        The overall path should have between 5 to 7 main steps. Ensure a logical flow.
        Output ONLY the JSON array of these step objects. Do not include any other text before or after the JSON.
        Example of one step object:
        {
          "title": "Python Data Types",
          "step_type": "lesson",
          "estimated_duration_minutes": 30,
          "details": {
            "markdown_content": "### Introduction to Python Data Types\\nPython has various built-in data types..."
          }
        }
        // Another example for a quiz step:
        // {
        //   "title": "Quiz: Python Basics",
        //   "step_type": "quiz",
        //   "estimated_duration_minutes": 15,
        //   "details": {
        //     "quiz_questions": [
        //       { "question_text": "What keyword is used to define a function in Python?", "question_type": "multiple_choice", "options": ["func", "def", "function", "define"], "correct_answer": "def", "explanation": "'def' is the keyword used for function definition." }
        //     ]
        //   }
        // }
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