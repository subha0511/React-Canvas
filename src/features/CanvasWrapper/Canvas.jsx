import { useEffect, useRef } from "react";
import { useCanvasStore } from "./state/canvasState";
import { useGrid } from "./context/GridContext";
import { sideLength, squareCount, delta } from "../../constants";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";
import useKeyPress from "../../hooks/useKeyPress";

function Canvas() {
  const canvasRef = useRef();
  const mouseDownPosRef = useRef({});

  const focusPan = useCanvasStore((state) => state.focusPan);
  const setCellFocused = useCanvasStore((state) => state.setCellFocused);
  const onKeyboardTranslate = useCanvasStore(
    (state) => state.onKeyboardTranslate
  );
  const onKeyboardScale = useCanvasStore((state) => state.onKeyboardScale);
  const onKeyboardEnter = useCanvasStore((state) => state.onKeyboardEnter);

  useKeyPress("Enter", () => onKeyboardEnter());
  useKeyPress("Escape", () => setCellFocused(false));
  useKeyPress("ArrowRight", () => onKeyboardTranslate({ d_x: 1 }));
  useKeyPress("ArrowLeft", () => onKeyboardTranslate({ d_x: -1 }));
  useKeyPress("ArrowUp", () => onKeyboardTranslate({ d_y: -1 }));
  useKeyPress("ArrowDown", () => onKeyboardTranslate({ d_y: 1 }));
  useKeyPress("ArrowUp", () => onKeyboardScale({ d_y: -1 }), { ctrl: true });
  useKeyPress("ArrowDown", () => onKeyboardScale({ d_y: 1 }), {
    ctrl: true,
  });

  const { gridRef } = useGrid();

  const draw = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const imageData = new ImageData(gridRef.current, squareCount);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
  };

  useAnimationFrame(draw);

  const focusCell = (evt) => {
    const { pageX, pageY } = evt;
    if (
      mouseDownPosRef.current &&
      delta > Math.abs(pageX - mouseDownPosRef.current.x) &&
      delta > Math.abs(pageY - mouseDownPosRef.current.y)
    ) {
      focusPan(evt);
    }
    mouseDownPosRef.current = null;
  };

  const setMouseDownPos = (evt) =>
    (mouseDownPosRef.current = { x: evt.pageX, y: evt.pageY });

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;

    canvas.addEventListener("mousedown", setMouseDownPos);
    canvas.addEventListener("mouseup", focusCell);
    return () => {
      canvas.removeEventListener("mousedown", setMouseDownPos);
      canvas.removeEventListener("mouseup", focusCell);
    };
  }, []);

  useEffect(() => {
    draw();
  }, []);

  return (
    <div className="bg-white bg-opacity-10 text-3xl">
      <canvas
        ref={canvasRef}
        height={sideLength * squareCount}
        width={sideLength * squareCount}
      ></canvas>
    </div>
  );
}

export default Canvas;
