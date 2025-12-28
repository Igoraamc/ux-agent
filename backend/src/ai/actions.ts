type ClickAction = {
  action: "click";
  args: { element_index: number; reason: string };
};

type TypeAction = {
  action: "type";
  args: { element_index: number; text: string; reason: string };
};

type ScrollAction = {
  action: "scroll";
  args: { direction: "up" | "down"; reason: string };
};

type WaitAction = {
  action: "wait";
  args: { seconds: number; reason: string };
};

type DoneAction = {
  action: "done";
  args: { summary: string; expected_result_achieved: string };
};

type FailAction = {
  action: "fail";
  args: { reason: string; blocker: string };
};

export type AgentAction =
  | ClickAction
  | TypeAction
  | ScrollAction
  | WaitAction
  | DoneAction
  | FailAction;
