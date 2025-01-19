export type Folder = {
  type: "link-folder";
  title: string;
  path: string;
};

export default function Folder(props: { data: Folder; onClick: () => void }) {
  if (props.data.type !== "link-folder") return <></>;
  return (
    <button
      onClick={props.onClick}
      className="px-6 py-2 bg-blue-500 text-white rounded-lg"
    >
      {props.data.title}
    </button>
  );
}
