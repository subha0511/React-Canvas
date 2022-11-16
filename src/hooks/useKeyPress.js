import { useEffect } from "react";

const useKeyPress = (keyCode, callback, options = { ctrl: false }) => {
  const { ctrl } = options;
  const keyDownEvent = (evt) => {
    const { code, ctrlKey } = evt;
    if ((code === keyCode) & (ctrlKey === ctrl)) {
      callback();
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", keyDownEvent);
    return () => window.removeEventListener("keydown", keyDownEvent);
  });
};

export default useKeyPress;
