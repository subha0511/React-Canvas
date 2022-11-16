import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "./state/canvasState";
import { GridContextProvider } from "./context/GridContext";
import { sideLength } from "../../constants";
import CellColourPicker from "./CellColourPicker";

import Canvas from "./Canvas";

function CanvasWrapper() {
  const canvasWrapperRef = useRef(null);

  const canvasStore = useCanvasStore();

  const setDimension = () => {
    if (canvasWrapperRef && canvasWrapperRef.current) {
      canvasStore.setCanvasDimension(
        canvasWrapperRef.current.getBoundingClientRect()
      );
    }
  };

  useLayoutEffect(() => {
    setDimension();
    window.addEventListener("resize", setDimension);
    return () => window.removeEventListener("resize", setDimension);
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", () => {
      canvasStore.setMouseDown(false);
    });
    window.addEventListener("mousedown", () => {
      canvasStore.setMouseDown(true);
    });
    window.addEventListener("mousemove", (e) => {
      canvasStore.onMouseDrag(e);
    });
    return () => {
      window.removeEventListener("mouseup", () => {
        canvasStore.setMouseDown(false);
      });
      window.removeEventListener("mousedown", () => {
        canvasStore.setMouseDown(true);
      });
      window.removeEventListener("mousemove", (e) => {
        canvasStore.onMouseDrag(e);
      });
    };
  }, []);

  return (
    <>
      <GridContextProvider>
        <div className="fixed top-1/2 left-1/2 z-10 border"></div>
        <div className={`h-screen w-full overflow-hidden bg-black `}>
          <motion.div
            className={`relative m-0 h-fit w-fit origin-top-left p-0 duration-100 `}
            ref={canvasWrapperRef}
            animate={{
              x: canvasStore.canvasPosition.cx,
              y: canvasStore.canvasPosition.cy,
              scale: canvasStore.canvasPosition.scale,
            }}
            transition={{
              ease: "easeInOut",
              duration: canvasStore.transitionDuration,
            }}
            style={{
              imageRendering: `pixelated`,
            }}
            onWheel={canvasStore.onMouseScroll}
          >
            <motion.div
              className="pointer-events-none absolute bg-white opacity-70"
              animate={{
                height: sideLength,
                width: sideLength,
                left: sideLength * canvasStore.crosshair.col,
                top: sideLength * canvasStore.crosshair.row,
              }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
            ></motion.div>
            <Canvas />
          </motion.div>
          <AnimatePresence initial={false}>
            {canvasStore.isCellFocused && <CellColourPicker />}
          </AnimatePresence>
        </div>
      </GridContextProvider>
    </>
  );
}

export default CanvasWrapper;
