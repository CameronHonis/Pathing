import { State } from "../App";
import { Tile } from "../Types";

export const clearGrid = (appState: State, setAppState: React.Dispatch<React.SetStateAction<State>>): void => {
  const gridCopy: {[x: string]: Tile} = {...appState.grid};
  for (const gridVal of Object.values(gridCopy)) {
    if (gridVal.fill === "start" || gridVal.fill === "target") { continue; }
    gridVal.fill = "empty";
  }
  setAppState({...appState, grid: gridCopy});
}