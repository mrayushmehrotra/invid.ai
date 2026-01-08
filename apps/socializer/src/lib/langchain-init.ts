import { initChatModel } from "langchain";

const load_key = process.env.GROQ_API_KEY;
if (!load_key) {
  throw new Error("GROQ_API_KEY is not set");
}

export const llm = await initChatModel("gpt-4.1");
