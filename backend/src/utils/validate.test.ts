import { describe, expect, test } from "bun:test";
import { validateUrl } from "./validate.js";

describe("validateUrl", () => {
  describe("valid URLs", () => {
    test("accepts valid HTTPS URL", () => {
      const result = validateUrl("https://example.com");
      expect(result.valid).toBe(true);
    });

    test("accepts HTTPS URL with path", () => {
      const result = validateUrl("https://example.com/login");
      expect(result.valid).toBe(true);
    });

    test("accepts HTTPS URL with query params", () => {
      const result = validateUrl("https://example.com/search?q=test");
      expect(result.valid).toBe(true);
    });

    test("accepts HTTP URL on public domain", () => {
      const result = validateUrl("http://example.com");
      expect(result.valid).toBe(true);
    });

    test("accepts subdomain", () => {
      const result = validateUrl("https://sub.example.com");
      expect(result.valid).toBe(true);
    });
  });

  describe("protocol validation", () => {
    test("rejects URL without protocol", () => {
      const result = validateUrl("example.com");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("HTTP or HTTPS");
    });

    test("rejects file:// protocol", () => {
      const result = validateUrl("file:///etc/passwd");
      expect(result.valid).toBe(false);
    });

    test("rejects ftp:// protocol", () => {
      const result = validateUrl("ftp://example.com");
      expect(result.valid).toBe(false);
    });

    test("rejects javascript: protocol", () => {
      const result = validateUrl("javascript:alert('xss')");
      expect(result.valid).toBe(false);
    });

    test("rejects data: protocol", () => {
      const result = validateUrl("data:text/html,<script>alert(1)</script>");
      expect(result.valid).toBe(false);
    });

    test("rejects about: protocol", () => {
      const result = validateUrl("about:blank");
      expect(result.valid).toBe(false);
    });
  });

  describe("localhost and loopback", () => {
    test("rejects localhost", () => {
      const result = validateUrl("http://localhost:3000");
      expect(result.valid).toBe(false);
    });

    test("rejects 127.0.0.1", () => {
      const result = validateUrl("http://127.0.0.1");
      expect(result.valid).toBe(false);
    });

    test("rejects 0.0.0.0", () => {
      const result = validateUrl("http://0.0.0.0");
      expect(result.valid).toBe(false);
    });

    test("rejects IPv6 loopback", () => {
      const result = validateUrl("http://[::1]");
      expect(result.valid).toBe(false);
    });
  });

  describe("private networks", () => {
    test("rejects 10.x.x.x (Class A)", () => {
      const result = validateUrl("http://10.0.0.1");
      expect(result.valid).toBe(false);
    });

    test("rejects 172.16.x.x (Class B)", () => {
      const result = validateUrl("http://172.16.0.1");
      expect(result.valid).toBe(false);
    });

    test("rejects 192.168.x.x (Class C)", () => {
      const result = validateUrl("http://192.168.1.1");
      expect(result.valid).toBe(false);
    });

    test("rejects link-local 169.254.x.x", () => {
      const result = validateUrl("http://169.254.1.1");
      expect(result.valid).toBe(false);
    });
  });

  describe("cloud metadata endpoints", () => {
    test("rejects AWS metadata endpoint", () => {
      const result = validateUrl("http://169.254.169.254/latest/meta-data");
      expect(result.valid).toBe(false);
    });

    test("rejects GCP metadata endpoint", () => {
      const result = validateUrl("http://metadata.google.internal");
      expect(result.valid).toBe(false);
    });

    test("rejects Azure metadata endpoint", () => {
      const result = validateUrl("http://metadata.azure.internal");
      expect(result.valid).toBe(false);
    });
  });

  describe("sensitive ports", () => {
    test("rejects SSH port 22", () => {
      const result = validateUrl("http://example.com:22");
      expect(result.valid).toBe(false);
    });

    test("rejects MySQL port 3306", () => {
      const result = validateUrl("http://example.com:3306");
      expect(result.valid).toBe(false);
    });

    test("rejects Redis port 6379", () => {
      const result = validateUrl("http://example.com:6379");
      expect(result.valid).toBe(false);
    });

    test("rejects PostgreSQL port 5432", () => {
      const result = validateUrl("http://example.com:5432");
      expect(result.valid).toBe(false);
    });

    test("rejects MongoDB port 27017", () => {
      const result = validateUrl("http://example.com:27017");
      expect(result.valid).toBe(false);
    });
  });

  describe("dark web", () => {
    test("rejects .onion domains", () => {
      const result = validateUrl("http://example.onion");
      expect(result.valid).toBe(false);
    });

    test("rejects .i2p domains", () => {
      const result = validateUrl("http://example.i2p");
      expect(result.valid).toBe(false);
    });
  });

  describe("URL manipulation", () => {
    test("rejects credentials in URL", () => {
      const result = validateUrl("http://user:pass@example.com");
      expect(result.valid).toBe(false);
    });

    test("rejects path traversal", () => {
      const result = validateUrl("http://example.com/../../../etc/passwd");
      expect(result.valid).toBe(false);
    });

    test("rejects encoded path traversal", () => {
      const result = validateUrl("http://example.com/%2e%2e/secret");
      expect(result.valid).toBe(false);
    });

    test("rejects null byte injection", () => {
      const result = validateUrl("http://example.com/file%00.txt");
      expect(result.valid).toBe(false);
    });
  });

  describe("internal domains", () => {
    test("rejects .internal domains", () => {
      const result = validateUrl("http://service.internal");
      expect(result.valid).toBe(false);
    });

    test("rejects .local domains", () => {
      const result = validateUrl("http://printer.local");
      expect(result.valid).toBe(false);
    });

    test("rejects .corp domains", () => {
      const result = validateUrl("http://intranet.corp");
      expect(result.valid).toBe(false);
    });
  });

  describe("admin panels", () => {
    test("rejects phpmyadmin", () => {
      const result = validateUrl("http://example.com/phpmyadmin");
      expect(result.valid).toBe(false);
    });

    test("rejects wp-admin", () => {
      const result = validateUrl("http://example.com/wp-admin");
      expect(result.valid).toBe(false);
    });
  });
});
