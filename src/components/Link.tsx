import { useState } from "react";
import { getFaviconUrl } from "../utils";

export type Link = {
  id: string;
  type: "link";
  title: string;
  path: string;
  url: string;

  icon_url?: string;

  dimentions?: {
    id: string;
    value: number;
  }[];
};

export default function Link(props: {
  data: Link;
  onClick: () => void;
  onEdit: () => void;
}) {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    const newTimer = setTimeout(() => {
      // Check the isPressed state within the timer logic
      props.onEdit(); // Trigger edit if held for 0.5s
      clearTimeout(newTimer); // Clear the timer after the edit is triggered
      setTimer(null);
    }, 500); // 500ms
    setTimer(newTimer);
  };

  const handleMouseUp = () => {
    if (timer) {
      props.onClick();
      clearTimeout(timer); // Clear the timer if the button is released before 0.5s
      setTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (timer) {
      clearTimeout(timer); // Clear the timer if the mouse leaves before 0.5s
    }
  };

  if (props.data.type !== "link") return <></>;
  const iconUrl = getFaviconUrl(props.data.url);

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onMouseLeave={handleMouseLeave} // In case the mouse leaves the button
      className="px-6 py-2 bg-green-500 text-white rounded-lg select-none flex items-center justify-center text-left hover:bg-green-600"
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={`${props.data.title} icon`}
          className="w-4 h-4 inline-block mr-2"
        />
      ) : null}
      {props.data.title}
    </button>
  );
}
