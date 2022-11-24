import React from "react";
import { motion } from "framer-motion";

const circleVariant = {
  start: {
    height: "1rem",
  },
  end: {
    height: "2.5rem",
  },
};

const circleTransition = {
  duration: 0.5,
  yoyo: Infinity,
  ease: "easeIn",
};

function Loading() {
  return (
    <div className="flex animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-3xl font-black text-transparent">
      {/* Loading */}
      <motion.div
        className="flex items-center gap-1"
        // variants={containerVariant}
        initial="start"
        animate="end"
      >
        <motion.div
          className="w-1.5 rounded-[3px] bg-red-400"
          variants={circleVariant}
          transition={{ ...circleTransition, delay: 0.3 }}
        ></motion.div>
        <motion.div
          className="w-1.5 rounded-[3px] bg-red-400"
          variants={circleVariant}
          transition={{ ...circleTransition, delay: 0.15 }}
        ></motion.div>
        <motion.div
          className="w-1.5 rounded-[3px] bg-red-400"
          variants={circleVariant}
          transition={circleTransition}
        ></motion.div>
        <motion.div
          className="w-1.5 rounded-[3px] bg-red-400"
          variants={circleVariant}
          transition={{ ...circleTransition, delay: 0.15 }}
        ></motion.div>
        <motion.div
          className="w-1.5 rounded-[3px] bg-red-400"
          variants={circleVariant}
          transition={{ ...circleTransition, delay: 0.3 }}
        ></motion.div>
      </motion.div>
    </div>
  );
}

export default Loading;
