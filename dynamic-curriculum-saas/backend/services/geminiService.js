const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Ensure .env is loaded for local development if GEMINI_API_KEY is not globally available
// For Railway, environment variables are set in the dashboard.
// If this script is run directly (e.g. `node services/geminiService.js`), adjust path:
// require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // If .env is in project root
// Or if .env is in backend/
// require('dotenv').config(); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.6, 
  topK: 1,
  topP: 0.95,
  maxOutputTokens: 8192,
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
    let accumulatedRawText = "";
    let stringToParse = "N/A (Parsing not attempted or error before this stage)";
    let attempts = 0;
    const MAX_CONTINUATION_ATTEMPTS = 3;

    let initialPrompt = `
        You are an expert Learning and Development curriculum designer specializing in adaptive learning.
        For an employee with current skills: "${currentSkills}"
        And their desired skills or career goal: "${desiredSkillsGoal}"

        Generate a detailed, step-by-step learning path. The path should include a mix of lesson content, quizzes to check understanding, practical challenges, and links to external resources or videos where appropriate. The difficulty of quizzes and challenges should be appropriate for someone progressing from their current skills towards their desired goal. Each step should logically build upon the previous one.
        
        For each step in the path, provide the following in a JSON object:
        1.  "title": A concise title for the step (e.g., "Understanding Python Variables").
        2.  "step_type": Choose ONE from: "lesson", "quiz", "challenge", "external_resource", "video".
        3.  "estimated_duration_minutes": (Optional) An integer estimate.
        4.  "details": An object containing specific content for the step_type:
            *   If "lesson": Provide "markdown_content" (string): Detailed explanatory text (target 150-300 words) in Markdown format. Include concepts, examples, and potentially code snippets if relevant.
            *   If "quiz": Provide "quiz_questions" (array of 1-2 objects): Each question object should have: "question_text" (string), "question_type" (string, e.g., "multiple_choice", "true_false"), "options" (array of 3-4 strings, ONLY for "multiple_choice"), and "correct_answer" (string: the exact text of the correct option for multiple_choice, or "True"/"False" for true_false), and "explanation" (string).
            *   If "challenge": Provide "challenge_description" (string): A practical, hands-on task or problem. Also provide "success_criteria" (string).
            *   If "external_resource": Provide "external_url" (string): A direct URL. And "resource_summary" (string).
            *   If "video": Provide "video_url" (string): A direct URL. And "video_summary" (string).

        The overall path should have between 3 to 5 main steps for this initial generation. Ensure a logical flow.
        Output ONLY the JSON array of these step objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json or \`\`\` around the JSON array itself. The JSON output MUST be complete and well-formed.
        Example of one lesson step object:
        {
          "title": "Python Data Types",
          "step_type": "lesson",
          "estimated_duration_minutes": 30,
          "details": {
            "markdown_content": "### Introduction to Python Data Types\\nPython has various built-in data types..."
          }
        }
    `;


    let currentPrompt = initialPrompt;

    try {
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig,
            safetySettings,
        });
        
        while (attempts < MAX_CONTINUATION_ATTEMPTS) {
            attempts++;
            console.log(`[Gemini Service Attempt #${attempts}] Sending prompt to Gemini model: ${modelName}. Current prompt (first 200 chars): ${currentPrompt.substring(0,200)}...`);
            
            const result = await model.generateContent(currentPrompt);
            const response = await result.response;

            if (response.promptFeedback && response.promptFeedback.blockReason) {
                console.error(`[Gemini Service Attempt #${attempts}] Prompt was blocked. Reason: ${response.promptFeedback.blockReason}`, response.promptFeedback.safetyRatings);
                throw new Error(`AI generation blocked (Attempt ${attempts}): ${response.promptFeedback.blockReason}`);
            }
            if (!response.candidates || response.candidates.length === 0) {
                console.error(`[Gemini Service Attempt #${attempts}] No candidates returned from Gemini.`);
                throw new Error(`AI returned no content candidates (Attempt ${attempts}).`);
            }

            const candidate = response.candidates[0];
            const finishReason = candidate.finishReason;
            const safetyRatings = candidate.safetyRatings;

            console.log(`[Gemini Service Attempt #${attempts}] AI Generation Finish Reason: ${finishReason}`);
            if (safetyRatings && safetyRatings.length > 0) {
                console.log(`[Gemini Service Attempt #${attempts}] AI Generation Safety Ratings:`, JSON.stringify(safetyRatings, null, 2));
            }

            let currentTextChunk = "";
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                currentTextChunk = candidate.content.parts.map(part => part.text).join("");
            } else if (finishReason === 'STOP' && accumulatedRawText.length > 0 && currentTextChunk.length === 0) {
                 console.log(`[Gemini Service Attempt #${attempts}] Finish reason STOP with empty new chunk, assuming previous accumulation was complete.`);
                 break;
            } else if (currentTextChunk.length === 0 && finishReason !== 'STOP') {
                 console.warn(`[Gemini Service Attempt #${attempts}] Received empty text chunk with finishReason: ${finishReason}. This might indicate an issue.`);

            }
            
            accumulatedRawText += currentTextChunk;
            console.log(`[Gemini Service Attempt #${attempts}] Received chunk length: ${currentTextChunk.length}, Accumulated length: ${accumulatedRawText.length}`);

            if (finishReason === 'STOP') {
                console.log(`[Gemini Service Attempt #${attempts}] Generation finished with STOP.`);
                break; 
            } else if (finishReason === 'MAX_TOKENS') {
                console.warn(`[Gemini Service Attempt #${attempts}] AI generation stopped due to MAX_TOKENS. Output is truncated. Will attempt to continue if attempts < ${MAX_CONTINUATION_ATTEMPTS}.`);
                currentPrompt = `
                    You were previously generating a JSON array of learning path steps. The output was truncated.
                    Here is the part you already generated. It might be an incomplete JSON string:
                    \`\`\`
                    ${accumulatedRawText}
                    \`\`\`
                    Your task is to SEAMLESSLY continue generating the JSON array from exactly where it was cut off. 
                    Complete any unfinished objects or string values. Ensure the final combined output is a single, complete, and valid JSON array. 
                    Do NOT repeat any steps already fully provided. Do NOT add any introductory text, concluding text, or markdown fences like \`\`\`json. Just provide the remaining JSON to complete the array.
                    If the previous text ended mid-string, complete that string. If it ended mid-object, complete that object and any subsequent objects in the array.
                `;
                if (attempts >= MAX_CONTINUATION_ATTEMPTS) {
                    console.error(`[Gemini Service] Max continuation attempts (${MAX_CONTINUATION_ATTEMPTS}) reached. Output is still likely truncated: ${accumulatedRawText.substring(0,200)}...`);
                    throw new Error("AI response truncated after multiple continuation attempts.");
                }
            } else { 
                console.warn(`[Gemini Service Attempt #${attempts}] AI generation finished with unexpected reason: ${finishReason}.`);
                throw new Error(`AI generation stopped for reason: ${finishReason}.`);
            }
        }

        console.log("[Gemini Service] Final accumulated raw text (first 500 chars):\n---\n", accumulatedRawText.substring(0, 500) + (accumulatedRawText.length > 500 ? "..." : ""), "\n---");
        console.log(`[Gemini Service] Final full raw text length: ${accumulatedRawText.length}`);

        stringToParse = accumulatedRawText.trim();
        const markdownJsonMatch = stringToParse.match(/^```json\s*([\s\S]*?)\s*```$/);
        if (markdownJsonMatch && markdownJsonMatch[1]) {
            stringToParse = markdownJsonMatch[1].trim();
            console.log("[Gemini Service] Extracted JSON from markdown fences from accumulated text.");
        } else {
            const firstBracket = stringToParse.indexOf('[');
            if (firstBracket === -1) {
                console.error("[Gemini Service] No JSON array start character '[' found in final response:", stringToParse.substring(0, 200));
                throw new SyntaxError("No JSON array start character '[' found in AI response.");
            }

            let openBrackets = 0;
            let lastBracketIndex = -1;
            for (let i = firstBracket; i < stringToParse.length; i++) {
                if (stringToParse[i] === '[') openBrackets++;
                if (stringToParse[i] === ']') openBrackets--;
                if (openBrackets === 0 && stringToParse[i] === ']') {
                    lastBracketIndex = i;
                    break; 
                }
            }

            if (lastBracketIndex !== -1) {
                stringToParse = stringToParse.substring(firstBracket, lastBracketIndex + 1);
                console.log("[Gemini Service] Heuristically extracted JSON array from accumulated text.");
            } else {
                console.warn("[Gemini Service] Could not find a clear end for the JSON array. Attempting to parse from first '['.");
                stringToParse = stringToParse.substring(firstBracket);
            }
        }
        
        console.log("[Gemini Service] Final string to be parsed as JSON (first 500 chars):\n---\n", stringToParse.substring(0, 500) + (stringToParse.length > 500 ? "..." : ""), "\n---");
        
        if (stringToParse.length === 0) {
            throw new Error("AI returned an empty response after processing and extraction attempts.");
        }

        const learningPath = JSON.parse(stringToParse);

        if (!Array.isArray(learningPath) || learningPath.length === 0) {
            console.error("[Gemini Service] Parsed result is not an array or is empty.", learningPath);
            throw new Error("AI returned an invalid or empty learning path array after parsing.");
        }

        learningPath.forEach((step, index) => {
            if (typeof step.title !== 'string' || 
                typeof step.step_type !== 'string' ||
                !['lesson', 'quiz', 'challenge', 'external_resource', 'video'].includes(step.step_type) ||
                typeof step.details !== 'object' || step.details === null) {
                console.error(`[Gemini Service] Invalid base structure for step ${index}:`, JSON.stringify(step,null,2).substring(0,300));
                throw new Error(`AI returned an invalid base structure for learning path step ${index + 1}.`);
            }
            if (step.step_type === 'quiz' && (!Array.isArray(step.details.quiz_questions) || step.details.quiz_questions.length === 0)) {
                 console.warn(`[Gemini Service] Quiz step "${step.title}" has no questions or invalid quiz_questions structure.`);
            }
        });
        
        console.log("[Gemini Service] Successfully parsed final learning path with steps:", learningPath.length);
        return learningPath;

    } catch (apiOrParseError) {
        console.error(
            "[Gemini Service] Error during Gemini interaction or parsing:", 
            apiOrParseError.message, 
            apiOrParseError.originalErrorName ? `(Original Name: ${apiOrParseError.originalErrorName})` : '',
            apiOrParseError.stack ? `\nStack (short): ${apiOrParseError.stack.substring(0, 700)}`: '', 
            "\nOriginal accumulated raw text (if available, first 1000 chars):\n", 
            accumulatedRawText ? accumulatedRawText.substring(0,1000) + (accumulatedRawText.length > 1000 ? "..." : "") : "N/A",
            "\nString attempted for final parsing (if different, first 1000 chars):\n",
            stringToParse !== accumulatedRawText ? (stringToParse ? stringToParse.substring(0,1000) + (stringToParse.length > 1000 ? "..." : "") : "N/A") : "Same as accumulated"
        );
        
        let friendlyMessage = "Failed to generate learning path from AI. ";
        if (apiOrParseError.name === 'GoogleGenerativeAIError' || apiOrParseError.originalErrorName === 'GoogleGenerativeAIError') {
            friendlyMessage += "There was an issue communicating with the AI service. " + (apiOrParseError.originalErrorMessage || apiOrParseError.message);
        } else if (apiOrParseError instanceof SyntaxError || apiOrParseError.originalErrorName === 'SyntaxError') {
            friendlyMessage += "The AI returned data in an unexpected format that could not be parsed.";
        } else {
            friendlyMessage += `An internal error occurred: ${apiOrParseError.message}`;
        }
        
        const serviceError = new Error(friendlyMessage);
        serviceError.statusCode = 500; 
        serviceError.originalErrorName = apiOrParseError.name || apiOrParseError.originalErrorName;
        serviceError.originalErrorMessage = apiOrParseError.message || apiOrParseError.originalErrorMessage;
        if ((apiOrParseError instanceof SyntaxError || (apiOrParseError.message && apiOrParseError.message.includes("AI returned an invalid"))) && accumulatedRawText) {
            serviceError.aiRawResponse = accumulatedRawText.substring(0, 2000) + (accumulatedRawText.length > 2000 ? "..." : "");
        }
        throw serviceError; 
    }
}

module.exports = { generateLearningPath };