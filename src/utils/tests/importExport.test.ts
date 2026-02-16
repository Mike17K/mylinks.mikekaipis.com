import {
  exportAllData,
  importAllData,
  validateImportData,
  downloadJSON,
} from "../importExport";
import { Item } from "../../components";
import { Dimention } from "../../components/Dimention";

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// @ts-ignore
global.localStorage = localStorageMock;

describe("Import/Export Utilities", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("exportAllData", () => {
    test("should export empty data when localStorage is empty", () => {
      const result = exportAllData();
      expect(result.version).toBe("1.0");
      expect(result.data.items).toEqual([]);
      expect(result.data.dimentions).toEqual([]);
      expect(result.exportDate).toBeTruthy();
    });

    test("should export data from localStorage", () => {
      const testItems: Item[] = [
        {
          id: "test-link",
          type: "link",
          title: "Test Link",
          path: "/test-link",
          url: "https://example.com",
        },
      ];

      const testDimentions: Dimention[] = [
        {
          id: "test-dim",
          type: "dimention",
          title: "Test Dimension",
        },
      ];

      localStorage.setItem("data", JSON.stringify(testItems));
      localStorage.setItem("dimentions", JSON.stringify(testDimentions));

      const result = exportAllData();
      expect(result.data.items).toEqual(testItems);
      expect(result.data.dimentions).toEqual(testDimentions);
    });

    test("should include export date in ISO format", () => {
      const result = exportAllData();
      const date = new Date(result.exportDate);
      expect(date.toISOString()).toBe(result.exportDate);
    });
  });

  describe("importAllData", () => {
    test("should import valid data to localStorage", () => {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          items: [
            {
              id: "imported-link",
              type: "link" as const,
              title: "Imported Link",
              path: "/imported",
              url: "https://imported.com",
            },
          ],
          dimentions: [],
        },
      };

      const result = importAllData(exportData);
      expect(result).toBe(true);

      const storedItems = JSON.parse(localStorage.getItem("data") ?? "[]");
      expect(storedItems).toEqual(exportData.data.items);
    });

    test("should handle invalid data format", () => {
      const invalidData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          items: "not an array",
          dimentions: [],
        },
      };

      // @ts-ignore - testing invalid data
      const result = importAllData(invalidData);
      expect(result).toBe(false);
    });

    test("should handle Greek characters in imported data", () => {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          items: [
            {
              id: "greek-link",
              type: "link" as const,
              title: "Ελληνικός Σύνδεσμος",
              path: "/ελληνικός-σύνδεσμος",
              url: "https://example.gr",
            },
          ],
          dimentions: [],
        },
      };

      const result = importAllData(exportData);
      expect(result).toBe(true);

      const storedItems = JSON.parse(localStorage.getItem("data") ?? "[]");
      expect(storedItems[0].title).toBe("Ελληνικός Σύνδεσμος");
    });
  });

  describe("validateImportData", () => {
    test("should validate correct data structure", () => {
      const validData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          items: [
            {
              id: "test",
              type: "link",
              title: "Test",
              path: "/test",
              url: "https://test.com",
            },
          ],
          dimentions: [],
        },
      };

      const result = validateImportData(validData);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test("should reject data without items array", () => {
      const invalidData = {
        version: "1.0",
        data: {
          items: "not an array",
          dimentions: [],
        },
      };

      const result = validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("should reject items missing required fields", () => {
      const invalidData = {
        version: "1.0",
        data: {
          items: [
            {
              id: "test",
              // missing type and title
            },
          ],
          dimentions: [],
        },
      };

      const result = validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("required fields");
    });

    test("should reject data without dimentions array", () => {
      const invalidData = {
        version: "1.0",
        data: {
          items: [],
          dimentions: "not an array",
        },
      };

      const result = validateImportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Dimentions must be an array");
    });

    test("should validate dimensions structure", () => {
      const validData = {
        version: "1.0",
        data: {
          items: [],
          dimentions: [
            {
              id: "dim1",
              type: "dimention",
              title: "Dimension 1",
            },
          ],
        },
      };

      const result = validateImportData(validData);
      expect(result.valid).toBe(true);
    });
  });
});
