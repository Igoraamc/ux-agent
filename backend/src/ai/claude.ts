import Anthropic from "@anthropic-ai/sdk";
import type { DetectedElement } from "../types/index.js";
import type { AgentAction } from "./actions.js";
import { AGENT_TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import "dotenv/config";

export function createClaudeAgent() {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  return {
    getNextAction: async function (
      screenshot: Buffer,
      elements: DetectedElement[],
      flowDescription: string,
      expectedResult: string,
    ) {
      const response = await client.messages.create({
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
                  <flow>
                    ${flowDescription}
                  </flow>

                  <expected-result>
                    ${expectedResult}
                  </expected-result>

                  <elements>
                    ${elements
                      .map(
                        (element) => `
                      <element>
                        <index>${element.index}</index>
                        <text>${element.text}</text>
                      </element>
                    `,
                      )
                      .join("\n")}
                  </elements>
                `,
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  data: screenshot.toString("base64"),
                  media_type: "image/png",
                },
              },
            ],
          },
        ],
        model: "claude-haiku-4-5-20251001",
        tools: AGENT_TOOLS,
      });

      console.log(JSON.stringify(response, null, 2));
    },
  };
}
