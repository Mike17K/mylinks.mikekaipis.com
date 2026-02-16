import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Items
import FolderEl, { Folder } from "../../components/Folder";
import LinkEl, { Link } from "../../components/Link";
import { FaFolderPlus } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";
import { FaLevelUpAlt } from "react-icons/fa";
import { MdImportExport } from "react-icons/md";

import { PiFolderSimple } from "react-icons/pi";
import Popover from "../../components/Popover";
import AddItemPopupContent from "./components/AddItemPopupContent";
import ImportExportModal from "./components/ImportExportModal";
import { AiOutlineFileAdd, AiTwotoneCompass } from "react-icons/ai";
import { Item } from "../../components/index";
import SearchSidebar from "./components/SearchSidebar";
import { Dimention } from "../../components/Dimention";
import { filterData, getDataBasePathOnly } from "../../utils";
import { safeOpenUrl } from "../../utils/url";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dimentions, setDimentions] = useState<Dimention[]>([]);
  const [elements, setElements] = useState<Item[]>([]);

  const [defaultData, setDefaultData] = useState<Partial<Item>>({});
  const [isPopupOpen, setIsPopupOpen] = useState<number>(0);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const path = searchParams.get("path") ?? "";
    const data = JSON.parse(localStorage.getItem("data") ?? "[]") as Item[];
    const filterdData = filterData(data, path);
    setElements(filterdData);

    const dimentionsData = JSON.parse(
      localStorage.getItem("dimentions") ?? "[]",
    ) as Dimention[];
    setDimentions(dimentionsData);
  }, [searchParams]);

  function addElement(f: Item) {
    // add to local storage
    const data = (
      JSON.parse(localStorage.getItem("data") ?? "[]") as Item[]
    ).filter((d) => d.id !== f.id || d.type !== f.type);
    data.push(f as Item);
    localStorage.setItem("data", JSON.stringify(data));

    // filter and set elements
    const path = searchParams.get("path") ?? "";
    const filteredData = filterData(data, path);
    setElements(filteredData);
  }

  function onDeleteItem(id: string) {
    const data = (
      JSON.parse(localStorage.getItem("data") ?? "[]") as Item[]
    ).filter((d) => d.id !== id);
    localStorage.setItem("data", JSON.stringify(data));

    // filter and set elements
    const path = searchParams.get("path") ?? "";
    const filteredData = filterData(data, path);
    setElements(filteredData);
  }

  function addDimention(d: Dimention) {
    // add dimention if new
    const dimentionsData = (
      JSON.parse(localStorage.getItem("dimentions") ?? "[]") as Dimention[]
    ).filter((dim) => dim.id !== d.id);
    dimentionsData.push(d);
    localStorage.setItem("dimentions", JSON.stringify(dimentionsData));
    setDimentions(dimentionsData);
  }

  function deleteDimention(id: string) {
    // add dimention if new
    const dimentionsData = (
      JSON.parse(localStorage.getItem("dimentions") ?? "[]") as Dimention[]
    ).filter((d) => d.id !== id);
    localStorage.setItem("dimentions", JSON.stringify(dimentionsData));
    setDimentions(dimentionsData);

    const data = (JSON.parse(localStorage.getItem("data") ?? "[]") as Item[])
      .filter((d) => d.type !== "dimention")
      .map((d) => ({
        ...d,
        dimentions: [...(d.dimentions ?? []).filter((dim) => dim.id !== id)],
      }));
    localStorage.setItem("data", JSON.stringify(data));

    // filter and set elements
    const path = searchParams.get("path") ?? "";
    const filteredData = filterData(data, path);
    setElements(filteredData);
  }

  function handleImport(data: { items: Item[]; dimentions: Dimention[] }) {
    // Save imported data to localStorage
    localStorage.setItem("data", JSON.stringify(data.items));
    localStorage.setItem("dimentions", JSON.stringify(data.dimentions));

    // Refresh the view
    const path = searchParams.get("path") ?? "";
    const filteredData = filterData(data.items, path);
    setElements(filteredData);
    setDimentions(data.dimentions);
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto h-[100vh] text-white">
      {/* sidebar */}
      <SearchSidebar elements={elements} dimentions={dimentions} />

      {/* header */}
      <section
        className="w-full p-4 
      flex justify-between items-center relative"
      >
        <h1 className="select-none inline-block text-3xl font-semibold">
          My Links
        </h1>
        <h2
          className=" select-none
        text-xl text-gray-400 mt-2
        absolute top-[3rem] left-0
        flex justify-center items-center
        "
        >
          <span className="mx-4">
            Path:{" "}
            {searchParams.get("path") === "" || !searchParams.get("path")
              ? "/"
              : searchParams.get("path")}
          </span>

          {searchParams.get("path") &&
            searchParams.get("path") !== "" &&
            searchParams.get("path") !== "/" && (
              <button
                onClick={() =>
                  setSearchParams({
                    path: searchParams
                      .get("path")!
                      .split("/")
                      .slice(0, -1)
                      .join("/"),
                  })
                }
                className="bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-all"
              >
                <FaLevelUpAlt size={14 * 1.5} />
              </button>
            )}
        </h2>

        {/* add buttons */}
        <div className="flex justify-center items-center gap-2">
          {/* Import/Export button */}
          <button
            onClick={() => setIsImportExportModalOpen(true)}
            className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-all flex justify-center items-center"
            title="Import/Export Data"
          >
            <MdImportExport className="text-xl" />
          </button>
          
          {/* add dimention popup */}
          <Popover
            triggerOpen={
              isPopupOpen !== 0 && defaultData.type === "dimention"
                ? isPopupOpen
                : 0
            }
            Content={({ onClose }) => (
              <AddItemPopupContent
                dimentions={dimentions}
                onDelete={(id) => {
                  deleteDimention(id);
                  onClose();
                }}
                defaultData={
                  {
                    ...defaultData,
                    type: "dimention",
                  } as Partial<Dimention>
                }
                onAdd={(f) => {
                  addDimention(f as Dimention);
                  setDefaultData({});
                  setIsPopupOpen(0);
                  onClose();
                }}
              />
            )}
          >
            <button
              onClick={() => {
                setDefaultData({ type: "dimention" });
                setTimeout(() => setIsPopupOpen((prev) => prev + 1), 50);
              }}
              className="bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-700 transition-all flex justify-center items-center"
            >
              <AiTwotoneCompass className="text-xl" />
            </button>
          </Popover>
          {/* add folder */}
          <Popover
            triggerOpen={
              isPopupOpen !== 0 && defaultData.type === "link-folder"
                ? isPopupOpen
                : 0
            }
            Content={({ onClose }) => (
              <AddItemPopupContent
                dimentions={dimentions}
                onDelete={(id) => {
                  onDeleteItem(id);
                  onClose();
                }}
                defaultData={
                  {
                    ...defaultData,
                    type: "link-folder",
                    path:
                      searchParams.get("path") === "" ||
                      !searchParams.get("path")
                        ? "/"
                        : searchParams.get("path"),
                  } as Partial<Folder>
                }
                onAdd={(f) => {
                  addElement(f);
                  setDefaultData({});
                  setIsPopupOpen(0);
                  onClose();
                }}
              />
            )}
          >
            <button
              onClick={() => {
                setDefaultData({ type: "link-folder" });
                setTimeout(() => setIsPopupOpen((prev) => prev + 1), 50);
              }}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all flex justify-center items-center"
            >
              <FaFolderPlus className="text-xl" />
            </button>
          </Popover>
          {/* add link */}
          <Popover
            triggerOpen={
              isPopupOpen !== 0 && defaultData.type === "link" ? isPopupOpen : 0
            }
            Content={({ onClose }) => (
              <AddItemPopupContent
                dimentions={dimentions}
                onDelete={(id) => {
                  onDeleteItem(id);
                  onClose();
                }}
                defaultData={
                  {
                    ...defaultData,
                    path:
                      searchParams.get("path") === "" ||
                      !searchParams.get("path")
                        ? "/"
                        : searchParams.get("path"),
                    type: "link",
                  } as Partial<Link>
                }
                onAdd={(f) => {
                  addElement(f);
                  setDefaultData({});
                  setIsPopupOpen(0);
                  onClose();
                }}
              />
            )}
          >
            <button
              onClick={() => {
                setDefaultData({ type: "link" });
                setTimeout(() => setIsPopupOpen((prev) => prev + 1), 50);
              }}
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-all flex justify-center items-center"
            >
              <AiOutlineFileAdd className="text-xl" />
            </button>
          </Popover>
        </div>
      </section>

      {/* folders list */}
      <section className="w-full mt-5 p-4 flex flex-wrap gap-4">
        <PiFolderSimple size={14 * 2.5} />
        {getDataBasePathOnly(elements)
          .filter((e) => e.type === "link-folder")
          .map((e) => (
            <FolderEl
              key={e.path + e.title}
              data={e}
              onClick={() => {
                const urlparams = new URLSearchParams(searchParams);
                urlparams.set("path", e.path);
                setSearchParams(urlparams);
              }}
              onEdit={() => {
                setDefaultData(e);
                setIsPopupOpen((prev) => prev + 1);
              }}
            />
          ))}
      </section>

      {/* files list */}
      <div className="w-full p-4 flex flex-wrap gap-4">
        <IoIosLink size={14 * 2.5} />
        {getDataBasePathOnly(elements)
          .filter((e) => e.type === "link")
          .map((e) => (
            <LinkEl
              key={e.path + e.title}
              data={e}
              onClick={() => safeOpenUrl(e.url)}
              onEdit={() => {
                setDefaultData(e);
                setIsPopupOpen((prev) => prev + 1);
              }}
            />
          ))}
      </div>

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onImport={handleImport}
        currentData={{
          items: JSON.parse(localStorage.getItem("data") ?? "[]"),
          dimentions: JSON.parse(localStorage.getItem("dimentions") ?? "[]"),
        }}
      />
    </div>
  );
}
