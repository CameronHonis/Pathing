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
  public probed: boolean = false;

  constructor(grid: Grid, tileKey: string, heap: SearchTileHeap) {
    if (!(tileKey in grid)) throw new Error("tileKey: " + tileKey + " not in grid provided");
    this.tileKey = tileKey;
    this.heap = heap;
    // calculate scores
    if (grid[tileKey].fill === "start") {
      this.gScore = 0;
      this.probed = true;
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
    // mark as probed regardless of relative gScore
    this.probed = true;
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
    console.log(this.stack.map(v => [v.tileKey, v.heapIndex]));
  }

  siftDown(idx: number): void {
    if (!(idx in this.stack)) {
      console.log(this.stack.map(v => [v.tileKey, v.heapIndex]));
      return;
    }
    let childIdx: number = 2*idx + 1;
    if (!(childIdx in this.stack)) {
      console.log(this.stack.map(v => [v.tileKey, v.heapIndex]));
      return;
    }
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
    } else {
      console.log(this.stack.map(v => [v.tileKey, v.heapIndex]));
    }
  }

  siftUp(idx: number): void {
    if (idx === 0) {
      console.log(this.stack.map(v => [v.tileKey, v.heapIndex]));
      return;
    }
    const parIdx: number = Math.floor((idx - 1) / 2);
    if (this.stack[parIdx].fScore > this.stack[idx].fScore) {
      const temp: SearchTile = this.stack[idx];
      this.stack[idx] = this.stack[parIdx];
      this.stack[idx].heapIndex = idx;
      this.stack[parIdx] = temp;
      this.stack[parIdx].heapIndex = parIdx;
      this.siftUp(parIdx);
    } else {
      console.log(this.stack.map(v => [v.tileKey, v.heapIndex]));
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
    if (this.stack.length > 1) {
      this.siftDown(0);
    } else if (this.stack.length === 1) {
      this.stack[0].heapIndex = 0;
    }
    rtn.heapIndex = -1;
    console.log(this.stack.map(v => [v.tileKey, v.heapIndex]));
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
    if (!currTile.probed) return false;
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