// backend/services/geminiService.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

require('dotenv').config({ path: '../.env' });


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.6, 
  topK: 1,
  topP: 0.95,
  maxOutputTokens: 4096,
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

    const modelName = "gemini-1.5-flash-latest"; 
    let rawTextFromAI = "N/A (Text not retrieved or error before retrieval)";
    let stringToParse = "N/A (Parsing not attempted or error before this stage)";

    try {
        const model = genAI.getGenerativeModel({ 
            model: modelName,
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

        console.log(`[Gemini Service] Sending prompt to Gemini model: ${modelName}. Prompt length: ${prompt.length}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        if (response.promptFeedback && response.promptFeedback.blockReason) {
            console.error(`[Gemini Service] Prompt was blocked. Reason: ${response.promptFeedback.blockReason}`, response.promptFeedback.safetyRatings);
            throw new Error(`AI generation blocked due to safety settings or other reasons: ${response.promptFeedback.blockReason}`);
        }
        if (!response.candidates || response.candidates.length === 0) {
            console.error("[Gemini Service] No candidates returned from Gemini. This might indicate a safety block or other issue.");
            throw new Error("AI returned no content. This may be due to safety filters or other restrictions.");
        }
        if (response.candidates[0].finishReason !== 'STOP' && response.candidates[0].finishReason !== 'MAX_TOKENS') {
             console.warn(`[Gemini Service] AI generation finished with reason: ${response.candidates[0].finishReason}. Output might be incomplete or problematic.`);
        }
        if (response.candidates[0].finishReason === 'MAX_TOKENS') {
             console.warn(`[Gemini Service] AI generation stopped due to MAX_TOKENS. Output is likely truncated. Consider increasing maxOutputTokens or simplifying the prompt/expected output length.`);
        }

        rawTextFromAI = response.text(); 
        console.log("[Gemini Service] Received raw text from Gemini (first 500 chars):\n---\n", rawTextFromAI.substring(0, 500) + (rawTextFromAI.length > 500 ? "..." : ""), "\n---");
        console.log(`[Gemini Service] Full raw text length: ${rawTextFromAI.length}`);

        stringToParse = rawTextFromAI.trim();
        const markdownMatch = stringToParse.match(/```json\s*([\s\S]*?)\s*```/);

        if (markdownMatch && markdownMatch[1]) {
            stringToParse = markdownMatch[1].trim();
            console.log("[Gemini Service] Extracted JSON from markdown fences.");
        } else {
            const firstValidChar = stringToParse.search(/[[{]/); 
            if (firstValidChar === -1) {
                console.error("[Gemini Service] No JSON array or object start character found in response.");
                throw new SyntaxError("No JSON array or object start character found in AI response.");
            }

            stringToParse = stringToParse.substring(firstValidChar);
            console.log("[Gemini Service] No markdown fences. Attempting to parse from first JSON-like character.");
        }
        
        console.log("[Gemini Service] String to be parsed as JSON (first 500 chars):\n---\n", stringToParse.substring(0, 500) + (stringToParse.length > 500 ? "..." : ""), "\n---");
        
        if (stringToParse.length === 0) {
            throw new Error("AI returned an empty response after attempting to extract JSON.");
        }

        const learningPath = JSON.parse(stringToParse);

        if (!Array.isArray(learningPath) || learningPath.length === 0) {
            console.error("[Gemini Service] Parsed result is not an array or is empty.", learningPath);
            throw new Error("AI returned an invalid or empty learning path array.");
        }

        learningPath.forEach((step, index) => {
            if (typeof step.title !== 'string' || 
                typeof step.step_type !== 'string' ||
                !['lesson', 'quiz', 'challenge', 'external_resource', 'video'].includes(step.step_type) ||
                typeof step.details !== 'object' || step.details === null) {
                console.error(`[Gemini Service] Invalid structure for step ${index}:`, step);
                throw new Error(`AI returned an invalid structure for learning path step ${index + 1}.`);
            }
        });
        
        console.log("[Gemini Service] Successfully parsed learning path with steps:", learningPath.length);

        return learningPath;

    } catch (apiOrParseError) {
        console.error(
            "[Gemini Service] Error during Gemini interaction or parsing:", 
            apiOrParseError.message, 
            apiOrParseError.cause ? `\nCause: ${apiOrParseError.cause}`: '',
            "\nOriginal raw text from Gemini (if available, first 1000 chars):\n", 
            rawTextFromAI ? rawTextFromAI.substring(0,1000) + (rawTextFromAI.length > 1000 ? "..." : "") : "N/A (Error before text was retrieved)",
            "\nString attempted for parsing (if different from raw, first 1000 chars):\n",
            stringToParse !== rawTextFromAI ? (stringToParse ? stringToParse.substring(0,1000) + (stringToParse.length > 1000 ? "..." : "") : "N/A (Empty stringToParse)") : "Same as raw text"
        );
        
        let friendlyMessage = "Failed to generate learning path from AI. ";
        if (apiOrParseError.name === 'GoogleGenerativeAIError') {
            friendlyMessage += "There was an issue communicating with the AI service (" + apiOrParseError.message + ").";
        } else if (apiOrParseError instanceof SyntaxError) {
            friendlyMessage += "The AI returned data in an unexpected format that could not be parsed.";
        } else {
            friendlyMessage += `An internal error occurred: ${apiOrParseError.message}`;
        }
        
        const serviceError = new Error(friendlyMessage);
        serviceError.statusCode = 500; 
        serviceError.originalErrorName = apiOrParseError.name;
        serviceError.originalErrorMessage = apiOrParseError.message;
        if ((apiOrParseError instanceof SyntaxError || apiOrParseError.message.includes("AI returned an invalid")) && rawTextFromAI) {
            serviceError.aiRawResponse = rawTextFromAI.substring(0, 2000) + (rawTextFromAI.length > 2000 ? "..." : "");
        }
        throw serviceError; 
    }
}

module.exports = { generateLearningPath };