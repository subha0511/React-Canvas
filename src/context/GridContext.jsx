import { createContext, useContext, useRef, useState, useEffect } from "react";
import { colorArr, squareCount } from "../constants";
import { io } from "socket.io-client";
import useSWR from "swr";

const fetcher = () =>
  fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/getboard`).then((res) =>
    res.arrayBuffer()
  );

export const GridContext = createContext();

export const GridContextProvider = ({ children }) => {
  const gridRef = useRef(
    new Uint8ClampedArray(Array(4 * squareCount * squareCount).fill(0))
  );

  const { data, error, isLoading } = useSWR("getBoard", fetcher, {
    refreshInterval: 0, // not refresh is 0
    errorRetryCount: 1,
  });

  const [socket, setSocket] = useState();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_REACT_APP_BACKEND_WS, {
      transports: ["websocket", "polling"],
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (data) {
      gridRef.current = convertBufferToUnit8ClampedArray(data);
    }
  }, [data]);

  useEffect(() => {
    if (socket) {
      socket.on("getCell", (payload) => {
        const { row, col, color } = payload;
        const value = colorArr[color];
        let index = 4 * (row * squareCount + col);
        for (let i = 0; i < 4; i++) {
          gridRef.current[index + i] = value[i];
        }
      });
    }
  }, [socket]);

  return (
    <GridContext.Provider value={{ gridRef, socket, isLoading, error }}>
      {children}
    </GridContext.Provider>
  );
};

export const useGrid = () => {
  const { gridRef, socket, isLoading, error } = useContext(GridContext);

  const updateGridCell = (row, col, colorArrIdx) => {
    let offset = 4 * (row * squareCount + col);
    for (let i = 0; i < 4; i++) {
      gridRef.current[offset + i] = colorArr[colorArrIdx][i];
    }
    socket.emit("setCell", { row, col, offset, color: colorArrIdx });
  };

  return { gridRef, updateGridCell, isLoading, error };
};

//Get bit string buffer from backend
//Convert buffer to Unit8Clamped Array where every 4 bit represents a color
//Create new unpacked array
const convertBufferToUnit8ClampedArray = (buffer) => {
  const newData = new Uint8ClampedArray(buffer);
  const unpackedData = new Uint8ClampedArray(squareCount * squareCount * 4);
  newData?.forEach((value, idx) => {
    const prefIdx = (value >> 4) % 8;
    const suffIdx = (value % (1 << 4)) % 8;
    let offset = idx * 8;
    for (let i = 0; i < 4; i++) {
      unpackedData[offset + i] = colorArr[prefIdx][i];
    }
    for (let i = 0; i < 4; i++) {
      unpackedData[offset + 4 + i] = colorArr[suffIdx][i];
    }
  });
  return unpackedData;
};
