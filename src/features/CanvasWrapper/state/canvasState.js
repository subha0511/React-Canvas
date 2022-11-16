import create from "zustand";
import {
  sideLength,
  scaleRange,
  focusScaleRange,
  squareCount,
} from "../../../constants";

const clamp = (currentVal, minVal, maxVal) =>
  Math.min(maxVal, Math.max(minVal, currentVal));

const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      //   console.log("  applying", args);
      set(...args);
      //   console.log("  new state", get());
    },
    get,
    api
  );

export const useCanvasStore = create(
  log((set, get) => ({
    canvasDimension: {
      height: 0,
      width: 0,
    },
    canvasPosition: {
      cx: window.innerWidth / 2,
      cy: window.innerHeight / 2,
      scale: 1,
    },
    isMouseDown: false,
    crosshair: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      row: 0,
      col: 0,
    },
    isCellFocused: false,
    focusedCell: {
      row: 0,
      col: 0,
    },
    canvasRange: {
      x: [0, 0],
      y: [0, 0],
    },
    transitionDuration: 0.1,

    //Set Mouse Down
    setMouseDown: (value) => set({ isMouseDown: value }),

    //Set Cell Focused
    setCellFocused: (value) => set({ isCellFocused: value }),

    //calculate crosshair placement
    updateCrosshair: () => {
      const { cx, cy, scale } = get().canvasPosition;
      const x = window.innerWidth / 2 - cx;
      const y = window.innerHeight / 2 - cy;
      const currSideLength = sideLength * scale;

      set({
        crosshair: {
          x,
          y,
          row: Math.min(squareCount - 1, Math.floor(y / currSideLength)),
          col: Math.min(squareCount - 1, Math.floor(x / currSideLength)),
        },
      });
    },

    //Update the canvas translate extremities
    updateCanvasRange: () => {
      const { scale } = get().canvasPosition;
      const { width, height } = get().canvasDimension;
      const x = [-width * scale + window.innerWidth / 2, window.innerWidth / 2];
      const y = [
        -height * scale + window.innerHeight / 2,
        window.innerHeight / 2,
      ];
      set({
        canvasRange: {
          x,
          y,
        },
      });
    },

    //Update canvas dimension on mount and window resize
    setCanvasDimension: ({ width, height }) => {
      set({ canvasDimension: { width, height } });
      get().updateCanvasRange();
    },

    //Update new canvas position based on dx and dy
    translate: ({ dX, dY }) => {
      const { cx, cy } = get().canvasPosition;
      const { x, y } = get().canvasRange;

      const new_cx = clamp(cx + dX, x[0], x[1]);
      const new_cy = clamp(cy + dY, y[0], y[1]);

      set((state) => ({
        canvasPosition: {
          ...state.canvasPosition,
          cx: new_cx,
          cy: new_cy,
        },
      }));
    },

    //Translate the canvas based on mouse drag
    onMouseDrag: (event) => {
      const isMouseDown = get().isMouseDown;
      if (isMouseDown) {
        set({ transitionDuration: 0.1 });
        const { movementX: dX, movementY: dY } = event;

        get().translate({ dX, dY });
        get().updateCrosshair();
      }
    },

    //Scroll and pan effect on mouse wheel scroll
    onMouseScroll: (event) => {
      set({ transitionDuration: 0.2 });
      const { scale } = get().canvasPosition;
      const {
        nativeEvent: { offsetX, offsetY },
        deltaY,
      } = event;

      let new_scale = clamp(
        deltaY > 0 ? scale / 1.1 : scale * 1.1,
        scaleRange[0],
        scaleRange[1]
      );

      new_scale = Math.floor(new_scale * 10) / 10;

      set((state) => ({
        canvasPosition: { ...state.canvasPosition, scale: new_scale },
      }));
      get().updateCanvasRange();

      const dX = offsetX * (scale - new_scale);
      const dY = offsetY * (scale - new_scale);
      get().translate({ dX, dY });
      get().updateCrosshair();
    },

    //Focus and pan
    focusPan: (event) => {
      set({ transitionDuration: 0.7 });
      const { scale } = get().canvasPosition;
      const { offsetX, offsetY, clientX, clientY } = event;

      const new_scale = clamp(scale, focusScaleRange[0], focusScaleRange[1]);

      set((state) => ({
        canvasPosition: { ...state.canvasPosition, scale: new_scale },
      }));
      get().updateCanvasRange();

      const clientDiffX = clientX - window.innerWidth / 2;
      const clientDiffY = clientY - window.innerHeight / 2;

      const dX = offsetX * (scale - new_scale) - clientDiffX;
      const dY = offsetY * (scale - new_scale) - clientDiffY;

      get().translate({ dX, dY });
      get().updateCrosshair();
      get().setCellFocused(true);
    },

    //Keyboard navigation for transalting x and y coordinates
    onKeyboardTranslate: ({ d_x = 0, d_y = 0 }) => {
      set({ transitionDuration: 0.1 });
      const { scale } = get().canvasPosition;

      const dX = -d_x * sideLength * scale;
      const dY = -d_y * sideLength * scale;

      get().translate({ dX, dY });
      get().updateCrosshair();
    },

    //Keyboard navigation for scaling
    onKeyboardScale: ({ d_y }) => {
      set({ transitionDuration: 0.2 });
      const { cx, cy, scale } = get().canvasPosition;
      const new_scale = clamp(
        d_y > 0 ? scale / 1.1 : scale * 1.1,
        scaleRange[0],
        scaleRange[1]
      );

      set((state) => ({
        canvasPosition: { ...state.canvasPosition, scale: new_scale },
      }));
      get().updateCanvasRange();

      const dX = ((window.innerWidth / 2 - cx) * (scale - new_scale)) / scale;
      const dY = ((window.innerHeight / 2 - cy) * (scale - new_scale)) / scale;

      get().translate({ dX, dY });
      get().updateCrosshair();
    },
  }))
);
