import { useState } from "react";
import { MdFileDownload, MdFileUpload, MdClose } from "react-icons/md";
import { Item } from "../../../components/index";
import { Dimention } from "../../../components/Dimention";

type ImportExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { items: Item[]; dimentions: Dimention[] }) => void;
  currentData: {
    items: Item[];
    dimentions: Dimention[];
  };
};

export default function ImportExportModal({
  isOpen,
  onClose,
  onImport,
  currentData,
}: ImportExportModalProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
          items: currentData.items,
          dimentions: currentData.dimentions,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `mylinks-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      setImportError("Failed to export data. Please try again.");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate the imported data structure
        if (!importData.data || !Array.isArray(importData.data.items)) {
          throw new Error("Invalid data format. Missing items array.");
        }

        if (!Array.isArray(importData.data.dimentions)) {
          throw new Error("Invalid data format. Missing dimentions array.");
        }

        // Validate each item has required fields
        const validItems = importData.data.items.every((item: any) => {
          return item.id && item.type && item.title;
        });

        if (!validItems) {
          throw new Error("Invalid data format. Items missing required fields.");
        }

        // Success - import the data
        onImport({
          items: importData.data.items,
          dimentions: importData.data.dimentions,
        });

        setImportSuccess(true);
        setImportError(null);
        
        setTimeout(() => {
          setImportSuccess(false);
          onClose();
        }, 2000);
      } catch (error) {
        console.error("Error importing data:", error);
        setImportError(
          error instanceof Error
            ? error.message
            : "Failed to import data. Please check the file format."
        );
        setImportSuccess(false);
      }
    };

    reader.onerror = () => {
      setImportError("Failed to read file. Please try again.");
      setImportSuccess(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MdClose size={24} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Import / Export Data
        </h2>

        {/* Export Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <MdFileDownload className="mr-2" size={20} />
            Export Data
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Download all your links, folders, and dimensions as a JSON file.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <MdFileDownload className="mr-2" size={20} />
            Export to JSON
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-6"></div>

        {/* Import Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <MdFileUpload className="mr-2" size={20} />
            Import Data
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Upload a JSON file to restore your data. This will replace all existing data.
          </p>
          
          <label
            htmlFor="import-file"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            <MdFileUpload className="mr-2" size={20} />
            Choose File to Import
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Success Message */}
        {importSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✓ Data imported successfully!
          </div>
        )}

        {/* Error Message */}
        {importError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {importError}
          </div>
        )}

        {/* Warning */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Warning:</strong> Importing data will replace all your current links and folders. Make sure to export your current data first if you want to keep it.
          </p>
        </div>
      </div>
    </div>
  );
}
