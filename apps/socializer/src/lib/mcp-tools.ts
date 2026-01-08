import { tool } from "langchain";
import { z } from "zod";

const metadataGenerator = tool(
  async ({ title, description, hashtags, target_audience = "adult" }) => {
    return `{
"title": "${title}",
"description": "${description}",
"hashtags": "${hashtags}",
"target_audience": "${target_audience}"
}`;
  },
  {
    name: "createInvidTool",
    description: "Create Invid Tool",
    schema: z.object({
      title: z.string().describe("Title of the video"),
      description: z.string().describe("Description of the video"),
      hashtags: z.string().describe("Hashtags for the video"),
      target_audience: z.string().describe("Target audience for the video"),
    }),
  },
);

const improveMetadata = tool(
  async ({ title, description, hashtags, target_audience }) => {
    return `{
"title": "${title}",
"description": "${description}",
"hashtags": "${hashtags}",
"target_audience": "${target_audience}"
}`;
  },
  {
    name: "improveMetadata",
    description: "Improve metadata",
    schema: z.object({
      title: z.string().describe("Title of the video"),
      description: z.string().describe("Description of the video"),
      hashtags: z.string().describe("Hashtags for the video"),
      target_audience: z.string().describe("Target audience for the video"),
    }),
  },
);

export { metadataGenerator, improveMetadata };
