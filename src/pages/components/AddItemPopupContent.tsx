import { useState } from "react";
import { Item } from "../../components";
import { Link } from "../../components/Link";

type AddItemPopupContentProps = {
  defaultData?: Partial<Item>;
  onAdd: (item: Item) => void;
};

export default function AddItemPopupContent({
  defaultData,
  onAdd,
}: AddItemPopupContentProps) {
  const [data, setData] = useState<Partial<Item>>(defaultData ?? {});
  const [error, setError] = useState<string | null>(null);

  function handleInputChange<T extends Item>(field: keyof T, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error on new input
  }

  const handleAdd = () => {
    if (!data.title) {
      setError("Title is required.");
      return;
    }
    if (!data.path) {
      setError("Path is required.");
      return;
    }

    if (data.type === "link" && !data.url) {
      setError("URL is required for link type.");
      return;
    }

    const id = data.title
      .replaceAll("/", "-")
      .replaceAll(" ", "-")
      .toLowerCase();

    const newPath = (data.path === "/" ? "/" : data.path + "/") + id;

    onAdd({ ...data, path: newPath } as Item);
    setData({}); // Clear form after successful addition
  };

  return (
    <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-96">
      <h1 className="text-lg font-bold mb-4">Add Item</h1>

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={data?.title ?? ""}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="path"
          className="block text-sm font-medium text-gray-700"
        >
          Path
        </label>
        <input
          id="path"
          type="text"
          disabled={true}
          value={data?.path ?? ""}
          // onChange={(e) => handleInputChange("path", e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {data.type === "link" && (
        <div className="mb-4">
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            URL
          </label>
          <input
            id="url"
            type="text"
            value={data?.url ?? ""}
            onChange={(e) =>
              data.type === "link" &&
              handleInputChange<Link>("url", e.target.value)
            }
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
      >
        Add Item
      </button>
    </div>
  );
}
