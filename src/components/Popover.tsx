import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

type PopoverProps = {
  triggerOpen?: number;
  Content: React.ElementType;
  children: React.ReactNode;
};

const Popover: React.FC<PopoverProps> = ({
  triggerOpen = 0,
  Content,
  children,
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

  useEffect(() => {
    if (isVisible) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsVisible(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    if (!triggerOpen || triggerOpen === 0) {
      return;
    }
    // trigger open when triggerOpen is true
    setIsVisible(true);
  }, [triggerOpen]);

  const popoverContent = (
    <div ref={popoverRef}>
      <Content onClose={togglePopover} />
    </div>
  );

  return (
    <div className="relative inline-block">
      {children}
      {isVisible && ReactDOM.createPortal(popoverContent, document.body)}
    </div>
  );
};

export default Popover;
