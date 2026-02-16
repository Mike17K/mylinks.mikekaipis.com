import { useEffect, useState } from "react";
import { Item } from "../../../components";
import { Dimention } from "../../../components/Dimention";
import LinkEl from "../../../components/Link";
import { safeOpenUrl } from "../../../utils/url";

type SearchSidebarProps = {
  elements: Item[];
  dimentions: Dimention[];
};

type Limit = {
  min: number;
  max: number;
};

export default function SearchSidebar(props: SearchSidebarProps) {
  const [visible, setVisible] = useState(false);
  const [results, setResults] = useState<Item[]>(props.elements);
  const [filters, setFilters] = useState<{
    [key: Dimention["id"]]: Limit;
  }>({});

  // Initialize filters based on available dimensions in elements
  useEffect(() => {
    const elementDimensionIds = props.elements
      .filter((e) => e.type !== "dimention")
      .flatMap((e) => e.dimentions?.map((d) => d.id))
      .filter((id): id is string => !!id);

    const initialFilters: { [key: Dimention["id"]]: Limit } = {};
    elementDimensionIds.forEach((id) => {
      initialFilters[id] = { min: 0, max: 1 }; // Default range
    });

    setFilters(initialFilters);
  }, [props.elements]);

  // Filter results when filter values change
  useEffect(() => {
    const filteredResults: Item[] = props.elements.filter((element) => {
      if (element.type === "dimention") return false; // Don't include dimension items

      return (
        element.dimentions?.every((dimension) => {
          const filter = filters[dimension.id];
          return filter
            ? dimension.value >= filter.min && dimension.value <= filter.max
            : true;
        }) ?? false
      );
    });
    setResults(filteredResults);
  }, [filters, props.elements]);

  return (
    <aside
      className={`fixed top-5 right-10 rounded-lg shadow-md bg-white text-gray-800 transition-all duration-300 ease-in-out ${
        visible ? "w-96 p-6" : "w-12 p-2"
      }`}
    >
      {/* Header */}
      <button
        className="absolute top-2 left-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? <>&times;</> : <>&raquo;</>}
      </button>

      {visible && (
        <div className="mt-6">
          {/* Filters */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Filters
            </h2>
            {Object.keys(filters).map((dimensionId) => {
              const dimension = props.dimentions.find(
                (d) => d.id === dimensionId,
              );
              const dimensionTitle = dimension?.title ?? "Dimension Not Found";
              const filter = filters[dimensionId];

              if (!filter) return null;

              return (
                <div key={dimensionId} className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">{dimensionTitle}</p>
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor={`${dimensionId}-min`}
                      className="text-xs text-gray-500"
                    >
                      Min: {filter.min}
                    </label>
                    <input
                      type="range"
                      id={`${dimensionId}-min`}
                      className="flex-grow h-1 rounded-lg appearance-none bg-gray-300 cursor-pointer"
                      min={0}
                      max={1}
                      step={0.01}
                      value={filter.min}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [dimensionId]: {
                            ...filter,
                            min: Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <label
                      htmlFor={`${dimensionId}-max`}
                      className="text-xs text-gray-500"
                    >
                      Max: {filter.max}
                    </label>
                    <input
                      type="range"
                      id={`${dimensionId}-max`}
                      className="flex-grow h-1 rounded-lg appearance-none bg-gray-300 cursor-pointer"
                      min={0}
                      max={1}
                      step={0.01}
                      value={filter.max}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [dimensionId]: {
                            ...filter,
                            max: Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Results ({results.filter((e) => e.type === "link").length})
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {results
                .filter((e) => e.type === "link")
                .map((linkItem) => (
                  <LinkEl
                    key={linkItem.path + linkItem.title}
                    data={linkItem}
                    onClick={() => safeOpenUrl(linkItem.url)}
                    onEdit={() => {}}
                  ></LinkEl>
                ))}
              {results.filter((e) => e.type === "link").length === 0 && (
                <p className="text-sm text-gray-500">
                  No results match your filters.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
