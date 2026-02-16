import {
  isValidUrl,
  normalizeUrl,
  extractHostname,
  generateSafeId,
  getFaviconUrl,
} from "../url";

describe("URL Utilities", () => {
  describe("isValidUrl", () => {
    test("should validate standard HTTP URLs", () => {
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("https://example.com")).toBe(true);
    });

    test("should validate URLs with paths and query parameters", () => {
      expect(isValidUrl("https://example.com/path?query=value")).toBe(true);
    });

    test("should reject invalid URLs", () => {
      expect(isValidUrl("not a url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(false);
    });

    test("should handle URLs with Greek letters in query parameters", () => {
      expect(isValidUrl("https://example.com?name=Μιχάλης")).toBe(true);
    });
  });

  describe("normalizeUrl", () => {
    test("should normalize standard URLs", () => {
      const url = "https://example.com";
      // URL constructor adds trailing slash to domain-only URLs
      expect(normalizeUrl(url)).toBe("https://example.com/");
    });

    test("should add protocol to URLs without one", () => {
      const result = normalizeUrl("example.com");
      expect(result).toBe("https://example.com/");
    });

    test("should handle URLs with Greek query parameters", () => {
      const url = "https://example.com?search=ελληνικά";
      const normalized = normalizeUrl(url);
      expect(normalized).toContain("example.com");
      expect(normalized).toContain("search=");
    });

    test("should handle empty or invalid inputs gracefully", () => {
      expect(normalizeUrl("")).toBe("");
      expect(normalizeUrl("   ")).toBe("   ");
    });

    test("should preserve paths and query strings", () => {
      const url = "https://example.com/path/to/page?param=value";
      expect(normalizeUrl(url)).toBe(url);
    });
  });

  describe("extractHostname", () => {
    test("should extract hostname from valid URLs", () => {
      expect(extractHostname("https://example.com/path")).toBe("example.com");
      expect(extractHostname("http://subdomain.example.com")).toBe(
        "subdomain.example.com"
      );
    });

    test("should handle URLs without protocol", () => {
      expect(extractHostname("example.com")).toBe("example.com");
    });

    test("should handle Greek domain names (IDN)", () => {
      // Greek IDN domains are encoded in punycode
      const hostname = extractHostname("https://παράδειγμα.com");
      expect(hostname).toBeTruthy();
    });

    test("should return empty string for invalid URLs", () => {
      expect(extractHostname("")).toBe("");
      expect(extractHostname("not a url")).toBe("");
    });
  });

  describe("generateSafeId", () => {
    test("should convert basic titles to safe IDs", () => {
      expect(generateSafeId("My Title")).toBe("my-title");
      expect(generateSafeId("Another Example")).toBe("another-example");
    });

    test("should handle Greek letters", () => {
      expect(generateSafeId("Ηλεκτρολόγος Βόλο")).toBe("ηλεκτρολόγος-βόλο");
      expect(generateSafeId("Τιμολόγια MyData")).toBe("τιμολόγια-mydata");
    });

    test("should replace forward slashes", () => {
      expect(generateSafeId("path/to/file")).toBe("path-to-file");
    });

    test("should handle special characters", () => {
      expect(generateSafeId("Title with @#$ special!")).toBe(
        "title-with-special"
      );
    });

    test("should handle multiple spaces and hyphens", () => {
      expect(generateSafeId("Title   with   spaces")).toBe(
        "title-with-spaces"
      );
      expect(generateSafeId("Title---with---hyphens")).toBe(
        "title-with-hyphens"
      );
    });

    test("should remove leading and trailing hyphens", () => {
      expect(generateSafeId("---Title---")).toBe("title");
      expect(generateSafeId("   Title   ")).toBe("title");
    });

    test("should handle empty strings", () => {
      expect(generateSafeId("")).toBe("");
      expect(generateSafeId("   ")).toBe("");
    });

    test("should preserve numbers and underscores", () => {
      expect(generateSafeId("Title_123")).toBe("title_123");
      expect(generateSafeId("Project 2024")).toBe("project-2024");
    });

    test("should match existing Greek letter paths from test data", () => {
      // From the existing test data
      const id1 = generateSafeId("ηλεκτρολογος βολο");
      expect(id1).toBe("ηλεκτρολογος-βολο");

      const id2 = generateSafeId("τιμολόγια mydata");
      expect(id2).toBe("τιμολόγια-mydata");
    });
  });

  describe("getFaviconUrl", () => {
    test("should generate favicon URL for valid domains", () => {
      const url = getFaviconUrl("https://example.com");
      expect(url).toBe(
        "https://www.google.com/s2/favicons?sz=128&domain=example.com"
      );
    });

    test("should handle custom sizes", () => {
      const url = getFaviconUrl("https://example.com", 64);
      expect(url).toBe(
        "https://www.google.com/s2/favicons?sz=64&domain=example.com"
      );
    });

    test("should extract hostname from full URLs", () => {
      const url = getFaviconUrl("https://example.com/path/to/page?query=value");
      expect(url).toContain("domain=example.com");
    });

    test("should handle URLs without protocol", () => {
      const url = getFaviconUrl("example.com");
      expect(url).toContain("domain=example.com");
    });

    test("should return empty string for invalid URLs", () => {
      expect(getFaviconUrl("")).toBe("");
      expect(getFaviconUrl("not a url")).toBe("");
    });

    test("should properly encode hostnames in favicon URL", () => {
      const url = getFaviconUrl("https://sub.example.com");
      expect(url).toContain("domain=sub.example.com");
    });
  });
});
