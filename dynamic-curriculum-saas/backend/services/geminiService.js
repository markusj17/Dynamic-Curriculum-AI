const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); // Loads environment variables from .env

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateLearningPath(currentSkills, desiredSkillsGoal) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[Gemini Service] GEMINI_API_KEY is not set. Returning mock data.");
        return [
            { topic: "Mock Topic 1: Intro to AI", description: "Understand basic AI concepts and applications.", suggested_link: "https://example.com/mock-ai-intro", completed: false },
            { topic: "Mock Topic 2: Personalized Learning", description: "Explore principles of adaptive education.", suggested_link: "https://example.com/mock-adaptive-learning", completed: false },
            { topic: "Mock Topic 3: Data Analytics Overview", description: "Introduction to data analysis tools and methods.", suggested_link: "https://example.com/mock-data-analytics", completed: false },
            { topic: "Mock Topic 4: Leadership Skills", description: "Develop foundational leadership qualities.", suggested_link: "https://example.com/mock-leadership", completed: false },
        ];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" }); 

        const prompt = `
            You are an expert Learning and Development curriculum designer.
            An employee has the following current skills: "${currentSkills}".
            Their desired skills or career goal is: "${desiredSkillsGoal}".

            Generate a 3 to 5-step learning path to help them achieve their goal.
            For each step, provide:
            1. "topic": A concise name for the learning topic.
            2. "description": A brief (1-2 sentences) explanation of what the step covers.
            3. "suggested_link": A URL to a high-quality, publicly available online resource (e.g., article, tutorial, documentation, YouTube video). Prioritize official documentation or well-regarded educational platforms if possible. Ensure this is a direct, clickable link.

            Format the output as a VALID JSON array of objects, where each object represents a step and has the keys "topic", "description", and "suggested_link". Do not include any other text or formatting outside the JSON array.

            Example Output:
            [
              {
                "topic": "Understanding Core Concepts",
                "description": "Learn the fundamental principles and terminology related to the target skill.",
                "suggested_link": "https://example.com/core-concepts-guide"
              },
              {
                "topic": "Practical Application through Project",
                "description": "Apply learned skills by building a small project.",
                "suggested_link": "https://github.com/example/project-repo"
              }
            ]
        `;

        console.log("[Gemini Service] Sending prompt to Gemini.");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text(); 
        console.log("[Gemini Service] Received raw text from Gemini:\n", text); 

        let learningPath;
        let jsonString = text; 

        try {
            const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (markdownMatch && markdownMatch[1]) {
                jsonString = markdownMatch[1];
                console.log("[Gemini Service] Extracted JSON from markdown fences.");
            } else {
                const firstBracket = jsonString.indexOf('[');
                const firstBrace = jsonString.indexOf('{');
                let start = -1;

                if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
                    start = firstBracket;
                } else if (firstBrace !== -1) {
                    start = firstBrace;
                }

                if (start !== -1) {
                    const lastBracket = jsonString.lastIndexOf(']');
                    const lastBrace = jsonString.lastIndexOf('}');
                    let end = -1;

                    if (start === firstBracket && lastBracket !== -1) {
                        end = lastBracket;
                    } else if (start === firstBrace && lastBrace !== -1) { 
                        end = lastBrace;
                    }
                    
                    if (end !== -1 && end > start) {
                        jsonString = jsonString.substring(start, end + 1);
                        console.log("[Gemini Service] Extracted JSON heuristically from brackets/braces.");
                    }
                }
            }
            
            jsonString = jsonString.trim(); 
            console.log("[Gemini Service] Attempting to parse JSON string:\n", jsonString);

            learningPath = JSON.parse(jsonString); 

            if (!Array.isArray(learningPath) || 
                learningPath.length === 0 || 
                learningPath.some(step => typeof step.topic !== 'string' || 
                                          typeof step.description !== 'string' || 
                                          typeof step.suggested_link !== 'string')) {
                console.error("[Gemini Service] Invalid JSON structure or empty array received from Gemini. Parsed Data:", learningPath);
                throw new Error("AI response format is invalid. Please try regenerating.");
            }
            
            return learningPath.map(step => ({ ...step, completed: false }));

        } catch (parseError) {
            console.error("[Gemini Service] ERROR parsing Gemini response:", parseError, 
                          "\nOriginal raw text received:\n", text, 
                          "\nAttempted to parse string:\n", jsonString || "N/A");
            return { error: `Failed to parse AI response: ${parseError.message}. The AI may have returned an unexpected format.`, raw: text };
        }
    } catch (apiError) {
        console.error("[Gemini Service] ERROR calling Gemini API:", apiError);
        return { error: `Failed to connect to AI service or receive a valid response: ${apiError.message}`, raw: apiError.toString() };
    }
}

module.exports = { generateLearningPath };