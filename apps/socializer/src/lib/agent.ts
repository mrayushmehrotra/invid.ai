import { createAgent } from "langchain";
import { YouTubeSeoAgentSystemPrompt } from "./prompts";
import { llm } from "./langchain-init";
import { improveMetadata, metadataGenerator } from "./mcp-tools";

const INVID_AGENT_PROMPT = YouTubeSeoAgentSystemPrompt().trim();

export const InvidAgent = createAgent({
  model: llm,
  tools: [improveMetadata, metadataGenerator],
  systemPrompt: INVID_AGENT_PROMPT,
});
