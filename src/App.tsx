import React from "react";
import Home from "./pages/Home";
import { Grid, PathNode } from "./Types";

export interface Refs {
  playbackSpeed: number;
  simGrids: Grid[];
  pathHead?: PathNode;
}

const initAppRefs: Refs = {
  playbackSpeed: 1,
  simGrids: []
}

export interface State {
  currTool: string;
  currAlgo: string;
  grid: Grid;
  gridBounds: [number, number, number, number]; // minRow, maxRow, minCol, maxCol
  isPlayingSim: boolean;
}

export const initAppState: State = {
  currTool: "boxSelect",
  currAlgo: "dijkstra",
  grid: {},
  gridBounds: [0, 0, 0, 0],
  isPlayingSim: false,
}

let tilesWide: number;
if (window.innerWidth > 1200) {
  tilesWide = 15;
} else if (window.innerWidth > 800) {
  tilesWide = 9;
} else if (window.innerWidth > 600) {
  tilesWide = 7;
} else { tilesWide = 5; }

let tilesTall: number;
if (window.innerHeight > 950) {
  tilesTall = 9;
} else if (window.innerHeight > 750) {
  tilesTall = 7;
} else if (window.innerHeight > 550) {
  tilesTall = 5;
} else {
  tilesTall = 3;
}

for (let r: number = 0; r < tilesTall; r++) {
  for (let c: number = 0; c < tilesWide; c++) {
    initAppState.grid[r+"x"+c] = {fill: "empty"};
  }
}
initAppState.grid["0x0"] = {fill: "start"};
initAppState.grid[(tilesTall-1) + "x" + (tilesWide-1)] = {fill: "target"};
initAppState.gridBounds = [0, tilesTall-1, 0, tilesWide-1];

export interface AppContextType {
  refs: Refs;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
}

export const AppContext = React.createContext<AppContextType>({refs: initAppRefs, state: initAppState, setState: () => {}});

export function App() {
  let { current: refs } = React.useRef<Refs>(initAppRefs);
  const [state, setState] = React.useState<State>(initAppState);
  return (
    <AppContext.Provider value={{refs, state, setState}}>
      <Home />
    </AppContext.Provider>
  );
}
