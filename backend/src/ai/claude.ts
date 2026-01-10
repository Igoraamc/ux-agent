import Anthropic from "@anthropic-ai/sdk";
import type { DetectedElement } from "../types/index.js";
import type { AgentAction } from "./actions.js";
import { AGENT_TOOLS } from "./tools.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import { claudeLogger } from "../lib/logger.js";
import "dotenv/config";

export type AgentResponse = {
  action: AgentAction;
  thinking: string | null;
};

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
      actionHistory: string[] = [],
    ): Promise<AgentResponse> {
      const historySection =
        actionHistory.length > 0
          ? `
                  <previous-actions>
                    ${actionHistory.map((a, i) => `<action step="${i + 1}">${a}</action>`).join("\n")}
                  </previous-actions>
                  `
          : "";

      const startTime = Date.now();

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
                  ${historySection}
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

      claudeLogger.debug(
        {
          model: "claude-haiku-4-5-20251001",
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
          stopReason: response.stop_reason,
          durationMs: Date.now() - startTime,
        },
        "Claude API call completed",
      );

      let thinking: string | null = null;
      let action: AgentAction | null = null;

      for (const block of response.content) {
        if (block.type === "text") {
          thinking = block.text;
        } else if (block.type === "tool_use") {
          action = {
            action: block.name,
            args: block.input,
          } as AgentAction;
        }
      }

      if (!action) {
        claudeLogger.error(
          { responseContent: response.content },
          "Claude did not return a tool use action",
        );
        throw new Error("Claude did not return a tool use action");
      }

      return { action, thinking };
    },
  };
}
