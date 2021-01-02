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
  currAlgo: "djikstra",
  grid: {
    "0x0": {fill: "start"}, "1x0": {fill: "empty"}, "2x0": {fill: "empty"}, "3x0": {fill: "empty"},
    "4x0": {fill: "empty"}, "0x1": {fill: "empty"}, "1x1": {fill: "empty"}, "2x1": {fill: "empty"},
    "3x1": {fill: "empty"}, "4x1": {fill: "empty"}, "0x2": {fill: "empty"}, "1x2": {fill: "empty"},
    "2x2": {fill: "empty"}, "3x2": {fill: "empty"}, "4x2": {fill: "empty"}, "0x3": {fill: "empty"},
    "1x3": {fill: "empty"}, "2x3": {fill: "empty"}, "3x3": {fill: "empty"}, "4x3": {fill: "empty"},
    "0x4": {fill: "empty"}, "1x4": {fill: "empty"}, "2x4": {fill: "empty"}, "3x4": {fill: "empty"},
    "4x4": {fill: "target"},
  },
  gridBounds: [0, 4, 0, 4],
  isPlayingSim: false,
}

export interface AppContextType {
  refs: Refs,
  state: State,
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
