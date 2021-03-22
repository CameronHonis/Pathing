import { Refs } from "../App";
import { Grid, Tile } from "../Types";

// iterative approach
export const breadthFirstSearch = (appRefs: Refs): boolean => {
  console.log("breadthFirstSim()");
  if (!appRefs.simGrids.length) { console.warn("appRefs.simGrids.length === 0 | breadthFirstSim cancelled"); return false; }
  appRefs.simGrids = [appRefs.simGrids[0]];
  appRefs.pathHead = undefined;
  // sort tiles by distance from start
  const sortedTiles: [tileKey: string, tile: Tile, dis: number][] = [];
  const binarySearchInsert = (tileKey: string, tile: Tile, dis: number): void => {
    const binarySearchInsertRecur = (lo: number, hi: number): void => {
      if (lo > hi) {
        sortedTiles.splice(lo, 0, [tileKey, tile, dis]);
        return;
      }
      const mid: number = Math.floor((lo + hi)/2);
      if (sortedTiles[mid][2] === dis) {
        lo = mid + 1;
        hi = mid;
      } else if (sortedTiles[mid][2] < dis) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }; binarySearchInsertRecur(0, sortedTiles.length-1);
  }
  // find start pos
  let startPos: [number, number] | undefined = undefined;
  for (const [ tileKey, { fill } ] of Object.entries(appRefs.simGrids[0])) {
    if (fill === "start") {
      startPos = tileKey.split("x").map(v => +v) as [number, number];
      break;
    }
  }
  if (!startPos) throw new Error("couldnt find start pos in appRefs.simGrids[0]");
  // insert into sortedTiles
  for (const [ tileKey, tile ] of Object.entries(appRefs.simGrids[0])) {
    if (tile.fill === "wall") continue;
    const [ r, c ]: [number, number] = tileKey.split("x").map(v => +v) as [number, number];
    const dis: number = Math.abs(r - startPos[0]) + Math.abs(c - startPos[1]);
    binarySearchInsert(tileKey, tile, dis);
  }
  // iterate sortedTiles && increment simGrids
  let foundRoute: boolean = false;
  for (const [ tileKey, tile, ] of sortedTiles) {
    if (tile.fill === "target") {
      foundRoute = true;
      // create doublely-linked list of path
      
    } else {
      const nextSimGrid: Grid = {...appRefs.simGrids[appRefs.simGrids.length-1]};
      nextSimGrid[tileKey] = {fill: "visited"};
      appRefs.simGrids.push(nextSimGrid);
    }
  }
  return foundRoute;
}