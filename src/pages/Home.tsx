import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Items
import FolderEl, { Folder } from "../components/Folder";
import LinkEl, { Link } from "../components/Link";
import { FaFolderPlus } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";
import { FaLevelUpAlt } from "react-icons/fa";

import { PiFolderSimple } from "react-icons/pi";
import Popover from "../components/Popover";
import AddItemPopupContent from "./components/AddItemPopupContent";
import { AiOutlineFileAdd } from "react-icons/ai";
import { Item } from "../components/index";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [elements, setElements] = useState<Item[]>([]);

  const [defaultData, setDefaultData] = useState<Partial<Item>>({});
  const [isPopupOpen, setIsPopupOpen] = useState<number>(0);

  function filterData(data: Item[], path: string) {
    return data.filter((d) => {
      const pathParts = d.path.split("/");
      const searchPathParts = path.split("/");

      // keep the parts that are folders and have number of parts == searchPathParts + 1
      // keep the parts that are files and have number of parts == searchPathParts
      if (d.type === "link-folder") {
        return (
          pathParts.length === searchPathParts.length + 1 &&
          pathParts.join("/").startsWith(searchPathParts.join("/"))
        );
      } else if (d.type === "link") {
        return (
          pathParts.length === searchPathParts.length + 1 &&
          pathParts.join("/").startsWith(searchPathParts.join("/"))
        );
      }
      return false;
    });
  }

  useEffect(() => {
    const path = searchParams.get("path") ?? "";
    const data = JSON.parse(localStorage.getItem("data") ?? "[]") as Item[];
    const filterdData = filterData(data, path);
    setElements(filterdData);
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

  return (
    <div className="w-full max-w-screen-lg mx-auto h-[100vh] text-white">
      {/* header */}
      <section
        className="w-full p-4 
      flex justify-between items-center relative"
      >
        <h1 className="inline-block text-3xl font-semibold">My Links</h1>
        <h2
          className="
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
          <Popover
            triggerOpen={
              isPopupOpen !== 0 && defaultData.type === "link-folder"
                ? isPopupOpen
                : 0
            }
            Content={({ onClose }) => (
              <AddItemPopupContent
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
          <Popover
            triggerOpen={
              isPopupOpen !== 0 && defaultData.type === "link" ? isPopupOpen : 0
            }
            Content={({ onClose }) => (
              <AddItemPopupContent
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
        {elements
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
        {elements
          .filter((e) => e.type === "link")
          .map((e) => (
            <LinkEl
              key={e.path + e.title}
              data={e}
              onClick={() => window.open(e.url)}
              onEdit={() => {
                setDefaultData(e);
                setIsPopupOpen((prev) => prev + 1);
              }}
            />
          ))}
      </div>
    </div>
  );
}
