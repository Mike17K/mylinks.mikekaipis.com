import { useState } from "react";

export type Link = {
  id: string;
  type: "link";
  title: string;
  path: string;
  url: string;
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

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave} // In case the mouse leaves the button
      className="px-6 py-2 bg-green-500 text-white rounded-lg select-none"
    >
      {props.data.title}
    </button>
  );
}
