import { Refs } from "../App";
import { Grid, PathNode } from "../Types";
import { Helpers } from "./Helpers";

class SearchTile {
  public tileKey: string;
  public prevTileKey: string | undefined;
  public fScore: number;
  public gScore: number = Number.MAX_SAFE_INTEGER;
  public hScore: number;
  public heap: SearchTileHeap;
  public heapIndex: number = -1;

  constructor(grid: Grid, tileKey: string, heap: SearchTileHeap) {
    if (!(tileKey in grid)) throw new Error("tileKey: " + tileKey + " not in grid provided");
    this.tileKey = tileKey;
    this.heap = heap;
    // calculate scores
    if (grid[tileKey].fill === "start") {
      this.gScore = 0;
    }
    if (grid[tileKey].fill === "target") {
      this.hScore = 0;
    } else {
      const [ r0, c0 ]: [number, number]  = tileKey.split("x").map(v => +v) as [number, number];
      let bestHScore: number = Number.MAX_SAFE_INTEGER;
      for (const [ tileKey, { fill } ] of Object.entries(grid)) {
        if (fill === "target") {
          const [ r1, c1 ]: [number, number] = tileKey.split("x").map(v => +v) as [number, number];
          const currHScore: number = Math.abs(r0 - r1) + Math.abs(c0 - c1);
          bestHScore = Math.min(currHScore, bestHScore);
        }
      }
      this.hScore = bestHScore;
    }
    this.fScore = this.gScore + this.hScore;
    heap.insert(this);
  }

  updateTile(from: SearchTile): void {
    // update gScore && fScore
    if (from.gScore + 1 < this.gScore) {
      this.gScore = from.gScore;
      this.prevTileKey = from.tileKey;
      this.fScore = this.gScore + this.hScore;
    }
    // update heap position (sift up)
    // no need to pop out bc tile's fScore is guarunteed to decrease or stay the same
    this.heap.siftUp(this.heapIndex);
  }
}

class SearchTileHeap {
  // sorted in heap form from lowest to highest fScore
  public stack: SearchTile[] = [];

  insert(tile: SearchTile): void {
    this.stack.push(tile);
    tile.heapIndex = this.stack.length - 1;
    this.siftUp(this.stack.length - 1);
  }

  siftDown(idx: number): void {
    if (!(idx in this.stack)) return;
    let childIdx: number = 2*idx + 1;
    if (!(childIdx in this.stack)) return;
    if (childIdx + 1 in this.stack && this.stack[childIdx].fScore > this.stack[childIdx+1].fScore) {
      childIdx++;
    }
    if (this.stack[idx].fScore > this.stack[childIdx].fScore) {
      const temp: SearchTile = this.stack[idx];
      this.stack[idx] = this.stack[childIdx];
      this.stack[idx].heapIndex = idx;
      this.stack[childIdx] = temp;
      this.stack[childIdx].heapIndex = childIdx;
      this.siftDown(childIdx);
    }
  }

  siftUp(idx: number): void {
    if (idx === 0) return;
    const parIdx: number = Math.floor((idx - 1) / 2);
    if (this.stack[parIdx].fScore > this.stack[idx].fScore) {
      const temp: SearchTile = this.stack[idx];
      this.stack[idx] = this.stack[parIdx];
      this.stack[idx].heapIndex = idx;
      this.stack[parIdx] = temp;
      this.stack[parIdx].heapIndex = parIdx;
      this.siftUp(parIdx);
    }
  }

  pop(): SearchTile | null {
    if (!this.stack.length) return null;
    // store first idx as rtn
    const rtn: SearchTile = this.stack[0];
    // swap first and last idx
    this.stack[0] = this.stack[this.stack.length-1];
    this.stack[this.stack.length-1] = rtn; // rtn is also used as a typical "temp" value here
    // remove new last idx
    this.stack.pop();
    // sift down new first idx
    this.siftDown(0);
    rtn.heapIndex = -1;
    return rtn;
  }
}

export const aStarSearch2 = (appRefs: Refs): boolean => {
  console.log("aStarSearch2()");
  const tileHeap: SearchTileHeap = new SearchTileHeap();
  const tileHash: {[index: string]: SearchTile} = {};
  for (const tileKey of Object.keys(appRefs.simGrids[0])) {
    if (appRefs.simGrids[0][tileKey].fill !== "wall") {
      tileHash[tileKey] = new SearchTile(appRefs.simGrids[0], tileKey, tileHeap);
    }
  }
  while (tileHeap.stack.length) {
    const currTile: SearchTile | null = tileHeap.pop();
    if (!currTile) return false;
    const newGrid: Grid = Helpers.deepCopy(appRefs.simGrids[appRefs.simGrids.length-1]);
    newGrid[currTile.tileKey] = {fill: "visited"};
    appRefs.simGrids.push(newGrid);
    if (appRefs.simGrids[0][currTile.tileKey].fill === "target") {
      // create "path" doubly linked list
      appRefs.pathHead = {tileKey: currTile.tileKey};
      while (appRefs.pathHead.tileKey in tileHash) {
        const newPathTileKey: string | undefined = tileHash[appRefs.pathHead.tileKey].prevTileKey;
        if (!newPathTileKey) break;
        const newPathNode: PathNode = {tileKey: newPathTileKey, next: appRefs.pathHead};
        appRefs.pathHead.prev = newPathNode;
        appRefs.pathHead = newPathNode;
      }
      console.log("found path:\n  " + appRefs.pathHead.tileKey);
      let pathPointer = appRefs.pathHead;
      while (pathPointer.next) {
        pathPointer = pathPointer.next;
        console.log("  " + pathPointer.tileKey);
      }
      return true;
    } else {
      // update adj tiles from currTile
      const [ r, c ]: [number, number] = currTile.tileKey.split("x").map(v => +v) as [number, number];
      const leftTileKey: string = r + "x" + (c-1);
      if (leftTileKey in tileHash && tileHash[leftTileKey].heapIndex >= 0) {
        tileHash[leftTileKey].updateTile(currTile);
      }
      const rightTileKey: string = r + "x" + (c+1);
      if (rightTileKey in tileHash && tileHash[rightTileKey].heapIndex >= 0) {
        tileHash[rightTileKey].updateTile(currTile);
      }
      const upTileKey: string = (r-1) + "x" + c;
      if (upTileKey in tileHash && tileHash[upTileKey].heapIndex >= 0) {
        tileHash[upTileKey].updateTile(currTile);
      }
      const downTileKey: string = (r+1) + "x" + c;
      if (downTileKey in tileHash && tileHash[downTileKey].heapIndex >= 0) {
        tileHash[downTileKey].updateTile(currTile);
      }
    }
  }
  return false;
}

export const aStarSearch = (appRefs: Refs): boolean => {
  console.log("aStarSim()");
  if (!appRefs.simGrids.length) { console.warn("appRefs.simGrids.length === 0 | aStarSim cancelled"); return false; }
  appRefs.simGrids = [appRefs.simGrids[0]];
  appRefs.pathHead = undefined;
  interface aStarSimGrid {
    [index: string]: Partial<{
      pointerTile: string,
      distanceFromStart: number,
      visited: boolean,
      fill: string, //todo: replace string type with TileFill enum type
      gScore: number
    }>
  }
  const targetKeys: string[] = [];
  const currSimmedGrid: aStarSimGrid = {};
  const nextTileKeys: Set<string> = new Set();
  // initialize targetKeys, currSimmedGrid based on initialGrid (func param) and populate nextTileKeys
  for (const [ tileKey, tileValue ] of Object.entries(appRefs.simGrids[0])) {
    if (!(tileKey in currSimmedGrid)) { currSimmedGrid[tileKey] = {visited: false, distanceFromStart: Number.MAX_SAFE_INTEGER}; }
    currSimmedGrid[tileKey].fill = tileValue.fill;
    if (tileValue.fill === "start") {
      const rc: [ number, number ] = [parseInt(tileKey.split("x")[0]), parseInt(tileKey.split("x")[1])]
      const tileKeyRight: string = rc[0] + "x" + (rc[1] + 1);
      if (tileKeyRight in appRefs.simGrids[0] && appRefs.simGrids[0][tileKeyRight].fill === "empty") {
        if (!(tileKeyRight in currSimmedGrid)) { currSimmedGrid[tileKeyRight] = {visited: false, distanceFromStart: Number.MAX_SAFE_INTEGER}; }
        currSimmedGrid[tileKeyRight] = {...currSimmedGrid[tileKeyRight], distanceFromStart: 1, pointerTile: tileKey};
        nextTileKeys.add(tileKeyRight);
      }
      const tileKeyLeft: string = rc[0] + "x" + (rc[1] - 1);
      if (tileKeyLeft in appRefs.simGrids[0] && appRefs.simGrids[0][tileKeyLeft].fill === "empty") {
        if (!(tileKeyLeft in currSimmedGrid)) { currSimmedGrid[tileKeyLeft] = {visited: false, distanceFromStart: Number.MAX_SAFE_INTEGER}; }
        currSimmedGrid[tileKeyLeft] = {...currSimmedGrid[tileKeyLeft], distanceFromStart: 1, pointerTile: tileKey};
        nextTileKeys.add(tileKeyLeft);
      }
      const tileKeyUp: string = (rc[0] - 1) + "x" + rc[1];
      if (tileKeyUp in appRefs.simGrids[0] && appRefs.simGrids[0][tileKeyUp].fill === "empty") {
        if (!(tileKeyUp in currSimmedGrid)) { currSimmedGrid[tileKeyUp] = {visited: false, distanceFromStart: Number.MAX_SAFE_INTEGER}; }
        currSimmedGrid[tileKeyUp] = {...currSimmedGrid[tileKeyUp], distanceFromStart: 1, pointerTile: tileKey};
        nextTileKeys.add(tileKeyUp);
      }
      const tileKeyDown: string = (rc[0] + 1) + "x" + rc[1];
      if (tileKeyDown in appRefs.simGrids[0] && appRefs.simGrids[0][tileKeyDown].fill === "empty") {
        if (!(tileKeyDown in currSimmedGrid)) { currSimmedGrid[tileKeyDown] = {visited: false, distanceFromStart: Number.MAX_SAFE_INTEGER}; }
        currSimmedGrid[tileKeyDown] = {...currSimmedGrid[tileKeyDown], distanceFromStart: 1, pointerTile: tileKey};
        nextTileKeys.add(tileKeyDown);
      }
    } else if (tileValue.fill === "target") {
      targetKeys.push(tileKey);
    }
  }
  while (nextTileKeys.size > 0) {
    const newGrid: Grid = {};
    //copy and add last grid to newGrid
    for (const [tileKey, tileValue] of Object.entries(appRefs.simGrids[appRefs.simGrids.length - 1])) {
      newGrid[tileKey] = {...tileValue};
    }
    appRefs.simGrids.push(newGrid);
    let nextBestTile: [tileName: string, fScore: number] = ["", Number.MAX_SAFE_INTEGER];
    for (const nextTileKey of nextTileKeys) {
      const nextRC: [number, number] = [parseInt(nextTileKey.split("x")[0]), parseInt(nextTileKey.split("x")[1])];
      if (!currSimmedGrid[nextTileKey].gScore) {
        for (let targetKey of targetKeys) {
          const targetRC: [number, number] = [parseInt(targetKey.split("x")[0]), parseInt(targetKey.split("x")[1])];
          currSimmedGrid[nextTileKey].gScore = Math.min(
            (currSimmedGrid[nextTileKey].gScore || Number.MAX_SAFE_INTEGER), 
            Math.abs(nextRC[0] - targetRC[0]) + Math.abs(nextRC[1] - targetRC[1]));
        }
      }
      const fScore: number = (currSimmedGrid[nextTileKey].distanceFromStart || 0) + (currSimmedGrid[nextTileKey].gScore || 0);
      if (nextBestTile[1] > fScore || (nextBestTile[1] === fScore && (currSimmedGrid[nextTileKey].gScore || 0) < (currSimmedGrid[nextBestTile[0]].gScore || 0))) {
        nextBestTile = [nextTileKey, fScore];
      }
    }
    if (newGrid[nextBestTile[0]].fill === "target") {
      // create "path" doubly linked list
      appRefs.pathHead = {tileKey: nextBestTile[0]};
      while (appRefs.pathHead.tileKey in currSimmedGrid) {
        const newPathTileKey: string | undefined = currSimmedGrid[appRefs.pathHead.tileKey].pointerTile;
        if (!newPathTileKey) { break; }
        const newPathNode: PathNode = {tileKey: newPathTileKey, next: appRefs.pathHead};
        appRefs.pathHead.prev = newPathNode;
        appRefs.pathHead = newPathNode;
      }
      console.log("found path:\n  " + appRefs.pathHead.tileKey);
      let pathPointer = appRefs.pathHead;
      while (pathPointer.next) {
        pathPointer = pathPointer.next;
        console.log("  " + pathPointer.tileKey);
      }
      return true;
    }
    newGrid[nextBestTile[0]].fill = "visited";
    currSimmedGrid[nextBestTile[0]].visited = true;
    nextTileKeys.delete(nextBestTile[0]);
    const updateTile: (tileName: string) => void = (tileKey) => {
      if (tileKey in currSimmedGrid && (currSimmedGrid[tileKey].fill === "empty" || currSimmedGrid[tileKey].fill === "target") && 
      (currSimmedGrid[nextBestTile[0]].distanceFromStart || 0) + 1 < (currSimmedGrid[tileKey].distanceFromStart || Number.MAX_SAFE_INTEGER)) {
        nextTileKeys.add(tileKey);
        currSimmedGrid[tileKey] = {
          ...currSimmedGrid[tileKey],
          distanceFromStart: (currSimmedGrid[nextBestTile[0]].distanceFromStart || 0) + 1,
          pointerTile: nextBestTile[0]};
      }
    }
    const bestRC: [number, number] = [parseInt(nextBestTile[0].split("x")[0]), parseInt(nextBestTile[0].split("x")[1])];
    updateTile(bestRC[0] + "x" + (bestRC[1] + 1));
    updateTile(bestRC[0] + "x" + (bestRC[1] - 1));
    updateTile((bestRC[0] + 1) + "x" + bestRC[1]);
    updateTile((bestRC[0] - 1) + "x" + bestRC[1]);
  }
  return false;
}