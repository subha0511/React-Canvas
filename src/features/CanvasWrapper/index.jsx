import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "./state/canvasStore";
import { sideLength } from "../../constants";
import CellColourPicker from "./CellColourPicker";

import Canvas from "./Canvas";
import { useGrid } from "../../context/GridContext";
import Loading from "./Loading";

function CanvasWrapper() {
  const canvasWrapperRef = useRef(null);
  const { isLoading } = useGrid();

  const { canvasPosition, crosshair, transitionDuration, isCellFocused } =
    useCanvasStore((state) => ({
      canvasPosition: state.canvasPosition,
      crosshair: state.crosshair,
      transitionDuration: state.transitionDuration,
      isCellFocused: state.isCellFocused,
    }));
  const { setMouseDown, onMouseDrag, onMouseScroll, setCanvasDimension } =
    useCanvasStore((state) => state.actions);

  const setDimension = () => {
    if (canvasWrapperRef && canvasWrapperRef.current) {
      setCanvasDimension(canvasWrapperRef.current.getBoundingClientRect());
    }
  };

  useLayoutEffect(() => {
    setDimension();
    window.addEventListener("resize", setDimension);
    return () => window.removeEventListener("resize", setDimension);
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", () => {
      setMouseDown(false);
    });
    window.addEventListener("mousedown", () => {
      setMouseDown(true);
    });
    window.addEventListener("mousemove", (e) => {
      onMouseDrag(e);
    });
    return () => {
      window.removeEventListener("mouseup", () => {
        setMouseDown(false);
      });
      window.removeEventListener("mousedown", () => {
        setMouseDown(true);
      });
      window.removeEventListener("mousemove", (e) => {
        onMouseDrag(e);
      });
    };
  }, []);

  return (
    <>
      {/* <div className="fixed top-1/2 left-1/2 z-10 border"></div> */}
      <div className={` relative h-screen w-full overflow-hidden bg-black`}>
        <div className="shadow-inset pointer-events-none absolute inset-0 z-10"></div>
        {/* <svg
            width="100%"
            height="100%"
            className="pointer-events-none fixed inset-0 isolate z-50
          opacity-70 mix-blend-soft-light"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="6"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg> */}
        {isLoading ? (
          <div className="grid h-full place-items-center ">
            <Loading />
          </div>
        ) : (
          <>
            <motion.div
              className={`relative m-0 h-fit w-fit origin-top-left p-0 duration-100 `}
              ref={canvasWrapperRef}
              animate={{
                x: canvasPosition.cx,
                y: canvasPosition.cy,
                scale: canvasPosition.scale,
              }}
              transition={{
                ease: "easeInOut",
                duration: transitionDuration,
              }}
              style={{
                imageRendering: `pixelated`,
              }}
              onWheel={onMouseScroll}
            >
              <motion.div
                className="pointer-events-none absolute bg-white opacity-70"
                animate={{
                  height: sideLength,
                  width: sideLength,
                  left: sideLength * crosshair.col,
                  top: sideLength * crosshair.row,
                }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
              ></motion.div>
              <Canvas />
            </motion.div>
            <AnimatePresence initial={false}>
              {isCellFocused && <CellColourPicker />}
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  );
}

export default CanvasWrapper;
