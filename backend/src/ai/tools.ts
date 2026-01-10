const clickTool = {
  name: "click",
  description:
    "Click on an interactive element identified by its index number in the screenshot",
  input_schema: {
    type: "object" as const,
    properties: {
      element_index: {
        type: "number",
        description:
          "The index number shown on the element in the annotated screenshot",
      },
      reason: {
        type: "string",
        description: "Why this click is necessary to progress the flow",
      },
    },
    required: ["element_index", "reason"],
  },
};

const typeTool = {
  name: "type",
  description: "Type text into an input field identified by its index number",
  input_schema: {
    type: "object" as const,
    properties: {
      element_index: {
        type: "number",
        description: "The index number of the input field",
      },
      text: {
        type: "string",
        description: "The text to type into the field",
      },
      reason: {
        type: "string",
        description: "Why this input is necessary",
      },
    },
    required: ["element_index", "text", "reason"],
  },
};

const scrollTool = {
  name: "scroll",
  description:
    "Scroll the page to reveal more content. Use 'top' to instantly scroll to the top of the page.",
  input_schema: {
    type: "object" as const,
    properties: {
      direction: {
        type: "string",
        enum: ["up", "down", "top"],
        description: "Direction to scroll. Use 'top' to jump to page start.",
      },
      reason: {
        type: "string",
        description: "Why scrolling is needed",
      },
    },
    required: ["direction", "reason"],
  },
};

const waitTool = {
  name: "wait",
  description:
    "Wait for the page to load or update. Use when expecting content to change.",
  input_schema: {
    type: "object" as const,
    properties: {
      seconds: {
        type: "number",
        description: "Seconds to wait (1-5)",
      },
      reason: {
        type: "string",
        description: "What you're waiting for",
      },
    },
    required: ["seconds", "reason"],
  },
};

const doneTool = {
  name: "done",
  description:
    "Mark the test as complete. Use when the expected result has been achieved.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "Summary of what was accomplished",
      },
      expected_result_achieved: {
        type: "boolean",
        description: "Whether the expected result was achieved",
      },
    },
    required: ["summary", "expected_result_achieved"],
  },
};

const failTool = {
  name: "fail",
  description:
    "Mark the test as failed. Use when the flow cannot be completed.",
  input_schema: {
    type: "object" as const,
    properties: {
      reason: {
        type: "string",
        description: "Why the test cannot continue",
      },
      blocker: {
        type: "string",
        description:
          "What is blocking progress (e.g., 'captcha', 'login required', 'element not found')",
      },
    },
    required: ["reason", "blocker"],
  },
};

export const AGENT_TOOLS = [
  clickTool,
  typeTool,
  scrollTool,
  waitTool,
  doneTool,
  failTool,
];
