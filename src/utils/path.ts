import { Item } from "../components";

export function getDepth(path: string) {
  const clearedPath = path === "" ? "/" : path;  
  return clearedPath.split("/").length - 2;
}

export function getPathInDepth(path: string, depth: number): string | null {
  if (path === "") return null;
  return (
    path
      .split("/")
      .slice(0, depth + 1)
      .join("/") || null
  );
}

export function getDataBasePathOnly(data: Item[]): Item[] {
  if (data.length === 0) return [];

  let minDepth = 1000;
  let shorterPath = "";
  data.forEach((d) => {
    if (d.type === "dimention") return;
    const depth = getDepth(d.path);
    if (depth < minDepth) {
      minDepth = depth;
      shorterPath = getPathInDepth(d.path, minDepth) ?? "/";
    }
  });

  console.log("shorterPath", shorterPath, minDepth);

  return data.filter((d) => {
    if (d.type === "dimention") return false;

    return (
      d.path.startsWith(shorterPath ?? "/") &&
      getDepth(d.path) === minDepth
    );
  });
}

export function filterData(data: Item[], path: string): Item[] {
  return data.filter(
    (d) =>
      (d.type === "link-folder" &&
        d.path.startsWith(path === "" ? "/" : path + "/")) ||
      (d.type === "link" && d.path.startsWith(path || "/"))
  );
}
