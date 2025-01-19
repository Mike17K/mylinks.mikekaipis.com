import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Items
import FolderEl, { Folder } from "../components/Folder";
import LinkEl, { Link } from "../components/Link";
import { FaFolderPlus } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";
import { MdOutlineArrowBackIosNew } from "react-icons/md";

import { PiFolderSimple } from "react-icons/pi";
import Popover from "../components/Popover";
import AddItemPopupContent from "./components/AddItemPopupContent";
import { AiOutlineFileAdd } from "react-icons/ai";
import { Item } from "../components";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [elements, setElements] = useState<Item[]>([]);

  useEffect(() => {
    const path = searchParams.get("path") ?? "";

    // get stored data from localstorage
    const data = JSON.parse(localStorage.getItem("data") ?? "[]") as Item[];
    setElements(
      data.filter(
        (d) =>
          (d.type === "link-folder" &&
            d.path.includes(path) &&
            d.path !== path) ||
          (d.type === "link" && d.path.includes(path))
      )
    );
  }, [searchParams]);

  function addElement(f: Item) {
    // add to local storage
    const data = JSON.parse(localStorage.getItem("data") ?? "[]") as Item[];
    data.push(f as Item);
    localStorage.setItem("data", JSON.stringify(data));
    setElements(data);
  }

  return (
    <div className="w-full h-[100vh] bg-[#242424] text-white">
      {/* header */}
      <section className="max-w-screen-md mx-auto p-4 flex justify-between items-center">
        <h1 className="text-3xl font-semibold">My Links</h1>
        <h2 className="text-xl text-gray-400 mt-2">
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
              >
                <MdOutlineArrowBackIosNew size={14 * 1.5} />
              </button>
            )}
          <span className="mx-4">Path: {searchParams.get("path") ?? "/"}</span>
        </h2>

        {/* add buttons */}
        <div className="flex justify-end space-x-4 mt-4">
          <Popover
            Content={({ onClose }) => (
              <AddItemPopupContent
                defaultData={
                  {
                    type: "link-folder",
                    path: searchParams.get("path") ?? "/",
                  } as Partial<Folder>
                }
                onAdd={(f) => {
                  addElement(f);
                  onClose();
                }}
              />
            )}
            position="top"
          >
            <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all">
              <FaFolderPlus className="text-xl" />
            </button>
          </Popover>
          <Popover
            Content={({ onClose }) => (
              <AddItemPopupContent
                defaultData={
                  {
                    path: searchParams.get("path") ?? "/",
                    type: "link",
                  } as Partial<Link>
                }
                onAdd={(f) => {
                  addElement(f);
                  onClose();
                }}
              />
            )}
            position="top"
          >
            <button className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-all">
              <AiOutlineFileAdd className="text-xl" />
            </button>
          </Popover>
        </div>
      </section>

      {/* folders list */}
      <div className="max-w-screen-md mx-auto p-4 flex flex-wrap gap-4">
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
            />
          ))}
      </div>

      {/* files list */}
      <div className="max-w-screen-md mx-auto p-4 flex flex-wrap gap-4">
        <IoIosLink size={14 * 2.5} />
        {elements
          .filter((e) => e.type === "link")
          .map((e) => (
            <LinkEl
              key={e.path + e.title}
              data={e}
              onClick={() => window.open(e.url)}
            />
          ))}
      </div>
    </div>
  );
}
