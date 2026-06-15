import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  answer: number;
}

export interface PaperContent {
  summary: string;
  quiz: QuizQuestion[];
}

export async function generateSummaryAndQuiz(
  title: string,
  abstract: string
): Promise<PaperContent> {
  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are helping CS students understand research papers. Always respond with valid JSON only, no markdown.",
      },
      {
        role: "user",
        content: `Given this paper:

Title: ${title}

Abstract: ${abstract}

Generate:
1. A clear, engaging 3-4 paragraph summary for a CS student. Explain the problem, approach, key contributions, and why it matters.
2. Exactly 5 multiple-choice quiz questions testing comprehension. Each question must have exactly 4 options with exactly one correct answer.

Respond with ONLY valid JSON in this exact format:
{
  "summary": "...",
  "quiz": [
    {
      "question": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "answer": 0
    }
  ]
}

The "answer" field is the 0-based index of the correct option.`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in AI response");

  const parsed = JSON.parse(jsonMatch[0]) as PaperContent;

  if (!parsed.summary || !Array.isArray(parsed.quiz) || parsed.quiz.length !== 5) {
    throw new Error("Invalid AI response structure");
  }

  return parsed;
}
