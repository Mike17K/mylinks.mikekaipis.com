export type Link = {
  type: "link";
  title: string;
  path: string;
  url: string;
};

export default function Link(props: { data: Link; onClick: () => void }) {
  if (props.data.type !== "link") return <></>;
  return (
    <button
      onClick={props.onClick}
      className="px-6 py-2 bg-green-500 text-white rounded-lg"
    >
      {props.data.title}
    </button>
  );
}
