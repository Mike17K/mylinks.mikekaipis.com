import { MdDelete } from "react-icons/md";
import { useEffect, useState } from "react";
import { Item } from "../../../components/index";
import { Link } from "../../../components/Link";
import { Dimention } from "../../../components/Dimention";

type AddItemPopupContentProps = {
  dimentions: Dimention[];
  defaultData?: Partial<Item>;
  onAdd: (item: Item) => void;
  onDelete: (id: string) => void;
};

export default function AddItemPopupContent({
  dimentions,
  defaultData,
  onAdd,
  onDelete,
}: AddItemPopupContentProps) {
  const [data, setData] = useState<Partial<Item>>(defaultData ?? {});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(defaultData ?? {});
  }, [defaultData]);

  function handleInputChange<T extends Item>(field: keyof T, value: string) {
    setData((prev: Partial<Item>) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error on new input
  }

  function handleDimentionChange(dimentionId: string, value: string) {
    setData((prev) => {
      // @ts-ignore
      const currentDimentions = (prev.dimentions as Link["dimentions"]) || [];
      const existingDimentionIndex = currentDimentions.findIndex(
        (d) => d.id === dimentionId
      );
      const newValue = Number(value);

      if (!isNaN(newValue)) {
        if (existingDimentionIndex !== -1) {
          const updatedDimentions = [...currentDimentions];
          updatedDimentions[existingDimentionIndex] = {
            id: dimentionId,
            value: newValue,
          };
          return { ...prev, dimentions: updatedDimentions };
        } else {
          return {
            ...prev,
            dimentions: [
              ...currentDimentions,
              { id: dimentionId, value: newValue },
            ],
          };
        }
      }
      return prev;
    });
  }

  const handleAdd = () => {
    if (!data.title) {
      setError("Title is required.");
      return;
    }
    if (data.type !== "dimention" && !Object.keys(data).includes("path")) {
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

    let newPath = "/";
    if (data.id && data.type === "link-folder") {
      // update operation
      newPath = data.path!;
    } else {
      // create operation
      if (Object.keys(data).includes("path")) {
        // @ts-ignore
        newPath = (data.path === "/" ? "/" : data.path + "/") + id;
      }
    }

    onAdd({ ...data, id: data.id ?? id, path: newPath } as Item);
    setData({}); // Clear form after successful addition
  };

  return (
    <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-96">
      {/* header */}
      <div className="select-none flex justify-between items-center mb-4">
        <h1
          className="text-lg font-bold flex items-center justify-center
        "
        >
          {`Add ${
            (
              {
                link: "Link",
                "link-folder": "Folder",
                dimention: "Dimention",
              } as { [key in Item["type"]]: string }
            )[data.type!]
          }`}
        </h1>
        {defaultData?.id && (
          <button
            onClick={() => {
              if (defaultData?.id) {
                onDelete(defaultData.id);
                setData({});
              }
            }}
            className="text-sm text-gray-500 flex items-center justify-center"
          >
            <MdDelete size={28} />
          </button>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="title"
          className="select-none block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={data?.title ?? ""}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="px-4 py-1 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {data.type !== "dimention" && (
        <div className="mb-4">
          <label
            htmlFor="path"
            className="select-none block text-sm font-medium text-gray-700"
          >
            Path
          </label>
          <input
            id="path"
            type="text"
            disabled={true}
            value={
              //@ts-ignore
              data?.path ?? ""
            }
            className="px-4 py-1 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      )}
      {data.type === "link" && (
        <>
          <div className="mb-4">
            <label
              htmlFor="url"
              className="select-none block text-sm font-medium text-gray-700"
            >
              URL
            </label>
            <input
              id="url"
              type="url"
              value={data?.url ?? ""}
              onChange={(e) =>
                data.type === "link" &&
                handleInputChange<Link>("url", e.target.value)
              }
              className="px-4 py-1 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Dimentions Input */}
          {dimentions.map((dimention) => (
            <div key={dimention.id} className="mb-4">
              <label
                htmlFor={`dimention-${dimention.id}`}
                className="select-none block text-sm font-medium text-gray-700"
              >
                {dimention.title}
              </label>
              <input
                id={`dimention-${dimention.id}`}
                type="number"
                step="0.01"
                placeholder="Enter value"
                value={(
                  data.dimentions?.find((dim) => dim.id === dimention.id)
                    ?.value ?? ""
                ).toString()}
                onChange={(e) =>
                  handleDimentionChange(dimention.id, e.target.value)
                }
                className="px-4 py-1 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          ))}
        </>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        onClick={handleAdd}
        className="select-none bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
      >
        {defaultData?.id ? "Update" : "Add"}
      </button>
    </div>
  );
}
