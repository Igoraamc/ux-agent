import { describe, expect, test } from "bun:test";
import {
  getUniqueSelector,
  getElementAttributes,
  INTERACTIVE_SELECTORS,
} from "./selectors.js";

describe("getUniqueSelector", () => {
  function mockElement(overrides: {
    tagName: string;
    id?: string;
    dataTestid?: string;
    name?: string;
    href?: string;
    textContent?: string;
  }) {
    return {
      tagName: overrides.tagName,
      textContent: overrides.textContent ?? null,
      getAttribute: (attr: string) => {
        if (attr === "id") return overrides.id ?? null;
        if (attr === "data-testid") return overrides.dataTestid ?? null;
        if (attr === "name") return overrides.name ?? null;
        if (attr === "href") return overrides.href ?? null;
        return null;
      },
    };
  }

  test("returns selector with ID when present", () => {
    const el = mockElement({ tagName: "BUTTON", id: "submit-btn" });
    expect(getUniqueSelector(el)).toBe("button#submit-btn");
  });

  test("returns selector with data-testid when no ID", () => {
    const el = mockElement({ tagName: "INPUT", dataTestid: "email-input" });
    expect(getUniqueSelector(el)).toBe('input[data-testid="email-input"]');
  });

  test("returns selector with name when no ID or data-testid", () => {
    const el = mockElement({ tagName: "INPUT", name: "username" });
    expect(getUniqueSelector(el)).toBe('input[name="username"]');
  });

  test("returns selector with href for links", () => {
    const el = mockElement({ tagName: "A", href: "/login" });
    expect(getUniqueSelector(el)).toBe('a[href="/login"]');
  });

  test("returns selector with text content as fallback", () => {
    const el = mockElement({ tagName: "BUTTON", textContent: "  Click Me  " });
    expect(getUniqueSelector(el)).toBe('button:has-text("Click Me")');
  });

  test("returns empty string when no identifiers", () => {
    const el = mockElement({ tagName: "DIV" });
    expect(getUniqueSelector(el)).toBe("");
  });

  test("converts tagName to lowercase", () => {
    const el = mockElement({ tagName: "BUTTON", id: "btn" });
    expect(getUniqueSelector(el)).toBe("button#btn");
  });

  test("prioritizes ID over data-testid", () => {
    const el = mockElement({
      tagName: "BUTTON",
      id: "my-id",
      dataTestid: "my-testid",
    });
    expect(getUniqueSelector(el)).toBe("button#my-id");
  });

  test("prioritizes data-testid over name", () => {
    const el = mockElement({
      tagName: "INPUT",
      dataTestid: "my-testid",
      name: "my-name",
    });
    expect(getUniqueSelector(el)).toBe('input[data-testid="my-testid"]');
  });
});

describe("getElementAttributes", () => {
  test("extracts all attributes", () => {
    const el = {
      attributes: [
        { name: "id", value: "btn" },
        { name: "class", value: "primary" },
        { name: "data-test", value: "click" },
      ],
    };
    expect(getElementAttributes(el)).toEqual({
      id: "btn",
      class: "primary",
      "data-test": "click",
    });
  });

  test("returns empty object for no attributes", () => {
    const el = { attributes: [] };
    expect(getElementAttributes(el)).toEqual({});
  });

  test("handles empty attribute values", () => {
    const el = {
      attributes: [
        { name: "disabled", value: "" },
        { name: "required", value: "" },
      ],
    };
    expect(getElementAttributes(el)).toEqual({
      disabled: "",
      required: "",
    });
  });

  test("skips null attributes in array", () => {
    const el = {
      attributes: [{ name: "id", value: "test" }, null, { name: "class", value: "active" }],
    };
    expect(getElementAttributes(el)).toEqual({
      id: "test",
      class: "active",
    });
  });
});

describe("INTERACTIVE_SELECTORS", () => {
  test("includes standard interactive elements", () => {
    expect(INTERACTIVE_SELECTORS).toContain("button");
    expect(INTERACTIVE_SELECTORS).toContain("a[href]");
    expect(INTERACTIVE_SELECTORS).toContain("input");
    expect(INTERACTIVE_SELECTORS).toContain("select");
    expect(INTERACTIVE_SELECTORS).toContain("textarea");
  });

  test("includes ARIA role selectors", () => {
    expect(INTERACTIVE_SELECTORS).toContain('[role="button"]');
    expect(INTERACTIVE_SELECTORS).toContain('[role="link"]');
  });

  test("includes onclick handler selector", () => {
    expect(INTERACTIVE_SELECTORS).toContain("[onclick]");
  });

  test("has expected length", () => {
    expect(INTERACTIVE_SELECTORS.length).toBe(8);
  });

  test("all entries are strings", () => {
    INTERACTIVE_SELECTORS.forEach((sel) => {
      expect(typeof sel).toBe("string");
    });
  });
});
