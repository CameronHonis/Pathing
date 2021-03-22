import { Refs } from "../App";
import { Grid } from "../Types";

export const depthFirstSearch = (appRefs: Refs): boolean => {
  console.log("depthFirstSim()");
  if (!appRefs.simGrids.length) { console.warn("appRefs.simGrids.length === 0 | depthFirstSim cancelled"); return false; }
  appRefs.simGrids = [appRefs.simGrids[0]];
  appRefs.pathHead = undefined;
  const depthFirstRecursive = (tileKeys: string[]): boolean => {
    const lastKey: string = tileKeys[tileKeys.length - 1] || "";
    const lastGrid: Grid = appRefs.simGrids[appRefs.simGrids.length - 1];
    if (!(lastKey in lastGrid)) { return false; }
    if (lastGrid[lastKey].fill === "target") {
      appRefs.pathHead = {tileKey: lastKey};
      let i: number = tileKeys.length - 2;
      while (i > -1) {
        appRefs.pathHead.prev = {tileKey: tileKeys[i], next: appRefs.pathHead};
        appRefs.pathHead = appRefs.pathHead?.prev;
        i--;
      }
      return true;
    }
    if (lastGrid[lastKey].fill === "wall" || lastGrid[lastKey].fill === "visited") { return false; }
    const newGrid: Grid = {};
    for (const [ tileKey, tileValue ] of Object.entries(lastGrid)) {
      newGrid[tileKey] = {...tileValue};
    }
    newGrid[lastKey].fill = "visited";
    appRefs.simGrids.push(newGrid);
    const tileRC: [number, number] = [parseInt(lastKey.split("x")[0]), parseInt(lastKey.split("x")[1])];
    const rightTileKey: string = tileRC[0] + "x" + (tileRC[1] + 1);
    if (depthFirstRecursive([...tileKeys, rightTileKey])) { return true; }
    const downTileKey: string = (tileRC[0] + 1) + "x" + tileRC[1];
    if (depthFirstRecursive([...tileKeys, downTileKey])) { return true; }
    const leftTileKey: string = tileRC[0] + "x" + (tileRC[1] - 1);
    if (depthFirstRecursive([...tileKeys, leftTileKey])) { return true; }
    const upTileKey: string = (tileRC[0] - 1) + "x" + tileRC[1];
    if (depthFirstRecursive([...tileKeys, upTileKey])) { return true; }
    return false;
  }
  for (const [ tileKey, tileValue ] of Object.entries(appRefs.simGrids[0])) {
    if (tileValue.fill === "start") {
      if (depthFirstRecursive([tileKey])) { return true; }
    }
  }
  return false;
}