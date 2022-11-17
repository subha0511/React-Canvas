import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGrid } from "./context/GridContext";
import { useCanvasStore } from "./state/canvasState";
import { colors } from "../../constants";
import { BsCheck2 } from "react-icons/bs";

const CellColourPicker = () => {
  const { updateGridCell } = useGrid();
  const [currActiveColor, setCurrActiveColor] = useState(-1);
  const setCellFocused = useCanvasStore((state) => state.setCellFocused);
  const { row, col } = useCanvasStore((state) => state.crosshair);

  const setColorInBoard = () => {
    updateGridCell(row, col, currActiveColor + 1);
    setCellFocused(false);
  };

  return (
    <motion.div
      className="fixed left-1/2 z-10 flex -translate-x-1/2 overflow-hidden rounded-xl bg-gray-500 py-2 px-2"
      key="colour-picker"
      initial="closed"
      animate="open"
      exit="closed"
      variants={containerVariant}
    >
      {colors.slice(1).map((color, idx) => (
        <motion.div
          key={idx}
          className={`h-8 w-8 ${color} mx-1.5 grid place-items-center first:ml-0.5`}
          variants={colorVariant}
          initial={{ borderRadius: "50%", opacity: 0 }}
          whileHover={{ scale: 1.2, borderRadius: "8px" }}
          onClick={() => {
            idx === currActiveColor
              ? setColorInBoard()
              : setCurrActiveColor(idx);
          }}
        >
          <AnimatePresence>
            {idx === currActiveColor && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <BsCheck2 size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
      <motion.div
        className={`group ml-1.5 mr-0.5 grid cursor-pointer place-items-center rounded-md bg-red-500 px-2.5 text-sm text-white`}
        variants={colorVariant}
        onClick={() => setCellFocused(false)}
      >
        Esc
      </motion.div>
    </motion.div>
  );
};

export default CellColourPicker;

const containerVariant = {
  open: {
    clipPath: "inset(0% 0% 0% 0% round 10px)",
    bottom: "5vh",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.7,
      delayChildren: 0.1,
      staggerChildren: 0.05,
      when: "beforeChildren",
    },
  },
  closed: {
    clipPath: "inset(10% 50% 90% 50% round 10px)",
    bottom: "0vh",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.4,
      staggerChildren: 0.02,
      staggerDirection: -1,
      when: "afterChildren",
    },
  },
};

const colorVariant = {
  open: {
    clipPath: "circle(2rem at 1rem 1rem)",
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  closed: {
    clipPath: "circle(0 at 1rem 1rem)",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};
