export const sideLength = 1;
export const squareCount = 100;
export const delta = 5;
export const baseScale = 10;
export const scaleRange = [0.1, 40];
export const focusScaleRange = [20, 40];

export const colors = [
  // "bg-slate-50",
  "",
  "bg-red-600",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-purple-500",
  "bg-slate-50",
];

export const colorArr = [
  new Uint8ClampedArray([0, 0, 0, 0]),
  // new Uint8ClampedArray([248, 250, 252, 255]),
  new Uint8ClampedArray([220, 38, 38, 255]),
  new Uint8ClampedArray([234, 179, 8, 255]),
  new Uint8ClampedArray([249, 115, 22, 255]),
  new Uint8ClampedArray([34, 197, 94, 255]),
  new Uint8ClampedArray([20, 184, 166, 255]),
  new Uint8ClampedArray([14, 165, 233, 255]),
  new Uint8ClampedArray([147, 51, 234, 255]),
  new Uint8ClampedArray([248, 250, 252, 255]),
];

// function hexToRgb(hex) {
//   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return result
//     ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16),
//       }
//     : null;
// }
