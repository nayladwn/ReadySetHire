import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // frontend dev server
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

const QuestionSchema = z.object({
  question: z.string(),
});

function getModel() {
  const provider = process.env.AI_PROVIDER;
  if (provider === "openai") {
    return new ChatOpenAI({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
    });
  }
  if (provider === "anthropic") {
    return new ChatAnthropic({
      model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
      temperature: 0.7,
    });
  }
  throw new Error(`Unsupported AI provider: ${provider}`);
}
const baseModel = getModel();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an HR assistant. Generate a professional interview question for the given job role."],
  ["human", "Job Role: {role}\nReturn only the question text."],
]);

app.post("/api/generate-question", async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || typeof role !== "string") {
      return res.status(400).json({ error: "Role is required" });
    }

    const modelWithSchema = baseModel.withStructuredOutput(QuestionSchema, {
      name: "question",
      strict: true,
    });

    const chain = prompt.pipe(modelWithSchema);
    const result = await chain.invoke({ role });

    const parsed = QuestionSchema.safeParse(result);
    if (!parsed.success) {
      return res.status(502).json({
        error: "Model returned invalid schema",
        details: parsed.error.flatten(),
      });
    }

    res.json(parsed.data);
  } catch (err) {
    console.error("Error generating question:", err);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`LLM server running on port ${PORT}`));
