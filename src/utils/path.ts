import { Item } from "../components";

export function getDepth(path: string, type: Item["type"]) {
  if (path === "") return 0;
  if (type === "link") return path.split("/").length - 2;
  if (type === "link-folder") return Math.min(0, path.split("/").length - 2);
  return 0;
}

export function getPathInDepth(path: string, depth: number): string | null {
  if (path === "") return null;
  return path.split("/").slice(0, depth + 1).join("/") || null;
}
