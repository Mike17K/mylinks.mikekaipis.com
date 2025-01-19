import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

type PopoverProps = {
  Content: React.ElementType;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

const Popover: React.FC<PopoverProps> = ({
  Content,
  children,
  position = "bottom",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const togglePopover = () => {
    setIsVisible(!isVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node) &&
      !buttonRef.current?.contains(event.target as Node)
    ) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const popoverContent = (
    <div
      ref={popoverRef}
      className={`absolute bg-white border rounded shadow-lg p-4 z-50 ${
        position === "top" ? "bottom-full mb-2" : ""
      } ${position === "bottom" ? "top-full mt-2" : ""} ${
        position === "left" ? "right-full mr-2" : ""
      } ${position === "right" ? "left-full ml-2" : ""}`}
    >
      <Content onClose={togglePopover} />
    </div>
  );

  return (
    <div className="relative inline-block">
      <button ref={buttonRef} onClick={togglePopover}>
        {children}
      </button>
      {isVisible && ReactDOM.createPortal(popoverContent, document.body)}
    </div>
  );
};

export default Popover;
