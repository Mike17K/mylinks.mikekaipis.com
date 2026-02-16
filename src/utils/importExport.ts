import { Item } from "../components";
import { Dimention } from "../components/Dimention";

export interface ExportData {
  version: string;
  exportDate: string;
  data: {
    items: Item[];
    dimentions: Dimention[];
  };
}

/**
 * Exports all data (items and dimensions) to a JSON file
 * @returns The export data object
 */
export function exportAllData(): ExportData {
  const items = JSON.parse(localStorage.getItem("data") ?? "[]") as Item[];
  const dimentions = JSON.parse(
    localStorage.getItem("dimentions") ?? "[]"
  ) as Dimention[];

  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    data: {
      items,
      dimentions,
    },
  };
}

/**
 * Imports data from an export object and saves to localStorage
 * @param exportData The data to import
 * @returns Success status
 */
export function importAllData(exportData: ExportData): boolean {
  try {
    // Validate data structure
    if (!exportData.data || !Array.isArray(exportData.data.items)) {
      throw new Error("Invalid data format");
    }

    // Save to localStorage
    localStorage.setItem("data", JSON.stringify(exportData.data.items));
    localStorage.setItem(
      "dimentions",
      JSON.stringify(exportData.data.dimentions ?? [])
    );

    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
}

/**
 * Downloads data as a JSON file
 * @param data The data to download
 * @param filename The filename for the download
 */
export function downloadJSON(data: any, filename: string): void {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a backup of current data before importing
 * @returns The backup data
 */
export function createBackup(): ExportData {
  return exportAllData();
}

/**
 * Validates imported data structure
 * @param data The data to validate
 * @returns Validation result with error message if invalid
 */
export function validateImportData(data: any): {
  valid: boolean;
  error?: string;
} {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid data format" };
  }

  if (!data.data || typeof data.data !== "object") {
    return { valid: false, error: "Missing data object" };
  }

  if (!Array.isArray(data.data.items)) {
    return { valid: false, error: "Items must be an array" };
  }

  if (!Array.isArray(data.data.dimentions)) {
    return { valid: false, error: "Dimentions must be an array" };
  }

  // Validate each item has required fields
  const validItems = data.data.items.every((item: any) => {
    return (
      item &&
      typeof item === "object" &&
      item.id &&
      item.type &&
      item.title
    );
  });

  if (!validItems) {
    return {
      valid: false,
      error: "Some items are missing required fields (id, type, title)",
    };
  }

  // Validate each dimension has required fields
  const validDimentions = data.data.dimentions.every((dim: any) => {
    return (
      dim &&
      typeof dim === "object" &&
      dim.id &&
      dim.type === "dimention" &&
      dim.title
    );
  });

  if (!validDimentions) {
    return {
      valid: false,
      error: "Some dimensions are missing required fields",
    };
  }

  return { valid: true };
}
