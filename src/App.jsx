import { GridContextProvider } from "./context/GridContext";
import CanvasWrapper from "./features/CanvasWrapper";

function App() {
  return (
    <div className="">
      <GridContextProvider>
        <CanvasWrapper />
      </GridContextProvider>
    </div>
  );
}

export default App;
