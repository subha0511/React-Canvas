import create from "zustand";
import {
  sideLength,
  scaleRange,
  focusScaleRange,
  squareCount,
} from "../../../constants";

const clamp = (currentVal, minVal, maxVal) =>
  Math.min(maxVal, Math.max(minVal, currentVal));

// Zustand middleware which logs arguments before and after updating values in store
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

//Canvas store contains all the parameters and functions
//that is used to translate and scale the canvas

export const useCanvasStore = create(
  log((set, get) => ({
    //Stores the canvas dimension
    //used to calculate the maximum and minimum translate dimension of the canvas element
    canvasDimension: {
      height: 0,
      width: 0,
    },

    //cx (canvas x) = translateX value in pixels used by canvas element for panning
    //cy (canvas y)= translateY value in pixels used by canvas element for panning
    //scale = current scale of the canvas
    canvasPosition: {
      cx: window.innerWidth / 2,
      cy: window.innerHeight / 2,
      scale: 1,
    },

    //boolean to check whether the mouse pointer is down on the canvas
    isMouseDown: false,

    //crosshair overlay on the canvas
    //x = horizontal pixel value relative to the canvas element from left edge
    //y = vertical pixel value relative to the canvas element from top edge
    crosshair: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      row: 0,
      col: 0,
    },

    //check whether a cell is focused or not
    //conditionally render the cell colour picker modal when isCellFocused === true
    isCellFocused: false,

    //Coordinate of the focusedCell
    focusedCell: {
      row: 0,
      col: 0,
    },

    //Stores the min and max translation range of the canvas element
    canvasRange: {
      x: [0, 0],
      y: [0, 0],
    },

    //Transition duration of the canvas element
    //Varies for
    transitionDuration: 0.1,

    //Set Mouse Down
    setMouseDown: (value) => set({ isMouseDown: value }),

    //Set Cell Focused
    setCellFocused: (value) => set({ isCellFocused: value }),

    //calculate crosshair placement
    //crosshair overlays the cell at the center of the viewport
    //x = distance between the left edge of the canvas and the center of the viewport
    //y = distance between the top edge of the canvas and the center of the viewport
    //row,col is the coordinate of the cell which has the crosshair overlay
    updateCrosshair: () => {
      const { cx, cy, scale } = get().canvasPosition;
      const x = window.innerWidth / 2 - cx;
      const y = window.innerHeight / 2 - cy;
      const currSideLength = sideLength * scale;

      set({
        crosshair: {
          x,
          y,
          row: clamp(Math.floor(y / currSideLength), 0, squareCount - 1),
          col: clamp(Math.floor(x / currSideLength), 0, squareCount - 1),
        },
      });
    },

    //Update the canvas translate extremities
    //The center point of viewport always stays within the canvas element
    //minimum x = the right edge of the canvas coincides the the center of the canvas
    //maximum x = the left edge of the canvas coincides the the center of the canvas
    //minimum y = the bottom edge of the canvas coincides the the center of the canvas
    //maximum y = the top edge of the canvas coincides the the center of the canvas
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
    //Get the net change in x and y as dX and dY respectively
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
        const transitionDuration = get().transitionDuration;
        if (transitionDuration !== 0.1) {
          set({ transitionDuration: 0.1 });
        }
        const { movementX: dX, movementY: dY } = event;

        get().translate({ dX, dY });
        get().updateCrosshair();
      }
    },

    //Scroll and pan effect on mouse wheel scroll
    //scale increases/decreases by 1.1 times on mouse scroll. Rounded to one decimal point.
    //offsetX = the distance between the mouse event on canvas from the left edge of the canvas
    //offsetY = the distance between the mouse event on canvas from the top edge of the canvas
    onMouseScroll: (event) => {
      const transitionDuration = get().transitionDuration;
      if (transitionDuration !== 0.2) {
        set({ transitionDuration: 0.2 });
      }

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
    //triggered on mouse click event on canvas
    //scale is clamped between [20,40] (focusScaleRange)
    //clientX, clientY is the horizontal and vertical distance from left and top edge of viewport
    focusPan: (event) => {
      const transitionDuration = get().transitionDuration;
      if (transitionDuration !== 0.7) {
        set({ transitionDuration: 0.7 });
      }

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
    //traverses one cell on the given direction on each trigger
    onKeyboardTranslate: ({ d_x = 0, d_y = 0 }) => {
      const transitionDuration = get().transitionDuration;
      if (transitionDuration !== 0.1) {
        set({ transitionDuration: 0.1 });
      }

      const { scale } = get().canvasPosition;

      const dX = -d_x * sideLength * scale;
      const dY = -d_y * sideLength * scale;

      get().translate({ dX, dY });
      get().updateCrosshair();
    },

    //Keyboard navigation for scaling
    onKeyboardScale: ({ d_y }) => {
      const transitionDuration = get().transitionDuration;
      if (transitionDuration !== 0.2) {
        set({ transitionDuration: 0.2 });
      }

      const { cx, cy, scale } = get().canvasPosition;
      let new_scale = clamp(
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

    //Keyboard focus event
    //focus on the cell having the crosshair
    onKeyboardEnter: () => {
      const transitionDuration = get().transitionDuration;
      if (transitionDuration !== 0.4) {
        set({ transitionDuration: 0.4 });
      }

      const { cx, cy, scale } = get().canvasPosition;
      let new_scale = clamp(scale, focusScaleRange[0], focusScaleRange[1]);

      set((state) => ({
        canvasPosition: { ...state.canvasPosition, scale: new_scale },
      }));
      get().updateCanvasRange();

      const dX = ((window.innerWidth / 2 - cx) * (scale - new_scale)) / scale;
      const dY = ((window.innerHeight / 2 - cy) * (scale - new_scale)) / scale;

      get().translate({ dX, dY });
      get().setCellFocused(true);
      get().updateCrosshair();
    },
  }))
);
