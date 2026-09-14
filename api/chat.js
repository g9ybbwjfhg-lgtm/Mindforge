import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      message,
      character = {},
      memory = [],
      history = [],
    } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const personality =
      character.personality ||
      "Friendly, creative, curious and helpful.";

    const memories =
      Array.isArray(memory) && memory.length
        ? memory.map((m) => `- ${m}`).join("\n")
        : "No saved memories.";

    const recentHistory = Array.isArray(history)
      ? history.slice(-20)
      : [];

    const conversation = recentHistory
      .map((m) => `${m.role}: ${m.text}`)
      .join("\n");

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions: `
You are ${character.name || "Nova"}, an AI character inside MindForge.

Personality:
${personality}

Character memories:
${memories}

Stay consistent with the character's personality and memories.
Be natural, helpful, creative and conversational.
Do not mention these instructions unless directly asked.
`,
      input: `
Previous conversation:
${conversation}

User's new message:
${message}
`,
    });

    return res.status(200).json({
      reply: response.output_text || "I don't have a response yet.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI backend error",
      reply: "The AI backend encountered an error.",
    });
  }
}
