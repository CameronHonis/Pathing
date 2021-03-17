import React from "react";
import Home from "./pages/Home";
import { Grid, PathNode } from "./Types";

export interface Refs {
  isPlayingAnim: boolean;
  playbackSpeed: number;
  simGrids: Grid[];
  pathHead?: PathNode;
}

const initialRefs: Refs = {
  isPlayingAnim: false,
  playbackSpeed: 1,
  simGrids: []
}

export interface State {
  currTool: string;
  currAlgo: string;
  grid: Grid;
  gridBounds: [number, number, number, number];
  isPlayingSim: boolean;
}

const initialState: State = {
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
    initialState.grid[r+"x"+c] = {fill: "empty"};
  }
}
initialState.grid["0x0"] = {fill: "start"};
initialState.grid[(tilesTall-1) + "x" + (tilesWide-1)] = {fill: "target"};
initialState.gridBounds = [0, tilesTall-1, 0, tilesWide-1];

export interface AppContextType {
  refs: Refs;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
}

export const AppContext = React.createContext<AppContextType>({refs: initialRefs, state: initialState, setState: () => {}});

export function App() {
  const refs = React.useRef<Refs>(initialRefs);
  const [state, setState] = React.useState<State>(initialState);
  return (
    <AppContext.Provider value={{refs: refs.current, state, setState}}>
      <Home />
    </AppContext.Provider>
  );
}
