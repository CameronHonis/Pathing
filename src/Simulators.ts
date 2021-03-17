import { Grid, PathNode } from "./Types";
import { Refs } from "./App";

export const depthFirstSim = (appRefs: Refs): boolean => {
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

export const dijkstraSim = (appRefs: Refs): boolean => {
  console.log("dijkstraSim()");
  if (!appRefs.simGrids.length) { console.warn("appRefs.simGrids.length === 0 | dijkstraSim cancelled"); return false; }
  appRefs.simGrids = [appRefs.simGrids[0]];
  appRefs.pathHead = undefined;
  class UnvisitedTileLLNode {
    public tileKey: string;
    public fill: string;
    public prevTileKey?: string;
    public distance: number = Number.MAX_SAFE_INTEGER/2;
    public prev?: UnvisitedTileLLNode;
    public next?: UnvisitedTileLLNode;
    public head: UnvisitedTileLLNode = this;
    public tail: UnvisitedTileLLNode = this;

    constructor({ tileKey, fill }: {tileKey: string, fill: string}) {
      this.tileKey = tileKey;
      this.fill = fill;
      if (fill === "start") { this.distance = 0; }
    }

    public iterativeSetHead(headNode: UnvisitedTileLLNode) {
      this.head = headNode;
      if (this.next) { this.next.iterativeSetHead(headNode); }
    }

    public iterativeSetTail(tailNode: UnvisitedTileLLNode) {
      this.tail = tailNode;
      if (this.prev) { this.prev.iterativeSetTail(tailNode); }
    }

    public push(node: UnvisitedTileLLNode) {
      if (this.tail === this) {
        this.next = node;
        node.prev = this;
        this.iterativeSetTail(node);
      } else {
        this.tail.push(node);
      }
    }

    public pop(): [poppedNode: UnvisitedTileLLNode, lastNode: boolean] {
      if (this.tail === this) {
        let lastNode: boolean = false
        if (this.prev) {
          this.prev.next = undefined;
          this.prev.iterativeSetTail(this.prev);
        } else {
          lastNode = true;
        }
        this.prev = undefined;
        this.head = this;
        this.tail = this;
        return [this, lastNode];
      } else {
        return this.tail.pop();
      }
    }

    public remove(): [removedNode: UnvisitedTileLLNode, lastNode: boolean] {
      if (!this.prev && !this.next) { return [this, true]; }
      if (this.tail === this && this.prev) {
        console.log("remove tail");
        this.prev.next = undefined;
        this.prev.iterativeSetTail(this.prev);
      } else if (this.head === this && this.next) {
        console.log("remove head");
        this.next.prev = undefined;
        this.next.iterativeSetHead(this.next);
      } else {
        if (this.prev) {
          this.prev.next = this.next;
        }
        if (this.next) {
          this.next.prev = this.prev;
        }
      }
      this.prev = undefined;
      this.next = undefined;
      this.head = this;
      this.tail = this;
      return [this, false];
    }

    public insert(node: UnvisitedTileLLNode): UnvisitedTileLLNode { // maintains sorted order of "distance"
      if (node.distance < this.distance) {
        if (this.prev) {
          this.prev.insert(node);
        } else {
          node.next = this;
          node.tail = this.tail;
          this.prev = node;
          this.tail.iterativeSetHead(node);
        }
      } else if (this.next) {
        if (this.next.distance < node.distance) {
          this.next.insert(node);
        } else {
          node.prev = this;
          node.next = this.next;
          this.next.prev = node;
          this.next = node;
          node.head = this.head;
          node.tail = this.tail;
        }
      } else {
        this.next = node;
        node.prev = this;
        node.head = this.head;
        this.head.iterativeSetTail(node);
      }
      return node;
    }

    // GETTERS AND SETTERS
    public setDistance(distance: number) {
      this.distance = distance;
      if (this.prev && this.prev.distance > distance) {
        this.head.insert(this.remove()[0]); // optimization: attempt insert start at head instead of this.prev
      } else if (this.next && this.next.distance < distance) {
        this.tail.insert(this.remove()[0]); // optimization: attempt insert start at tail instead of this.next
      }
    }

    // OVERRIDES && PRINTS
    public toString(): string {
      return JSON.stringify({tileKey: this.tileKey, fill: this.fill, prevTileKey: this.prevTileKey, distance: this.distance});
    }

    public printList(highlightTileKey?: string) {
      console.log(this.recurseList(highlightTileKey));
    }

    private recurseList(highlightTileKey?: string, last?: UnvisitedTileLLNode, i: number = 0): string {
      let rtn: string = "";
      if (this.prev && this.prev !== last) {
        rtn += this.prev.recurseList(highlightTileKey, this, i - 1);
      }
      if (rtn.length) {
        rtn += ", ";
      }
      if (highlightTileKey === this.tileKey || (!highlightTileKey && i === 0)) {
        if (rtn.length) { rtn += " "; }
        rtn += "[[" + this.tileKey + ": " + this.distance + "]]";
      } else {
        rtn += "[" + this.tileKey + ": " + this.distance + "]";
      }
      if (this.next && this.next !== last) {
        if (highlightTileKey === this.tileKey || (!highlightTileKey && i === 0)) {
          rtn += ",  ";
        } else {
          rtn += ", ";
        }
        rtn += this.next.recurseList(highlightTileKey, this, i + 1);
      }
      return rtn;
    }

    public printSimple() {
      console.log("[" + this.head.tileKey + " " + this.prev?.tileKey + " " + this.tileKey + " " + this.next?.tileKey + " " + this.tail.tileKey + "]");
    }
  }

  const nodeHash: {[index: string]: UnvisitedTileLLNode} = {};
  for (const [ tileKey, tileValue ] of Object.entries(appRefs.simGrids[0])) {
    const node: UnvisitedTileLLNode = new UnvisitedTileLLNode({tileKey, fill: tileValue.fill});
    if (nodeHash.head) {
      nodeHash[tileKey] = nodeHash.head.insert(node);
    } else {
      nodeHash.head = node;
      nodeHash[tileKey] = node;
    }
  }
  if (!nodeHash.head || !nodeHash.head.tail) { return false; }
  let count: number = 0;
  const dijkstraRecursive: (nodeHash: {[index: string]: UnvisitedTileLLNode}) => boolean = (nodeHash) => {
    if (!nodeHash.head) { return false; }
    nodeHash.tail = nodeHash.head.tail;
    console.log(count + " " + nodeHash.head.tileKey);
    count++;
    while (nodeHash.head.fill === "wall") {
      if (nodeHash.head.next) {
        nodeHash.head = nodeHash.head.next;
        nodeHash.head.prev?.remove();
      } else {
        return false;
      }
    }
    const newGrid: Grid = {};
    for (const [ tileKey, tileValue ] of Object.entries(appRefs.simGrids[appRefs.simGrids.length - 1])) {
      newGrid[tileKey] = {...tileValue};
    }
    appRefs.simGrids.push(newGrid);
    if (nodeHash.head.fill === "target") { // can end early (assumes no shorter route will be found, impossible on grid layout)
      if (!nodeHash.head.prevTileKey) { // isolates and fixes "last bridge disconnnected" bug
        const targetRC: [number, number] = [parseInt(nodeHash.head.tileKey.split("x")[0]), parseInt(nodeHash.head.tileKey.split("x")[1])];
        const targetRightRC: string = targetRC[0] + "x" + (targetRC[1]+1);
        if (targetRightRC in newGrid && newGrid[targetRightRC].fill === "visited") {
          nodeHash.head.prevTileKey = targetRC[0] + "x" + (targetRC[1]+1);
        }
        const targetLeftRC: string = targetRC[0] + "x" + (targetRC[1]-1);
        if (targetLeftRC in newGrid && newGrid[targetLeftRC].fill === "visited") {
          nodeHash.head.prevTileKey = targetRC[0] + "x" + (targetRC[1]-1);
        }
        const targetDownRC: string = (targetRC[0]+1) + "x" + targetRC[1];
        if (targetDownRC in newGrid && newGrid[targetDownRC].fill === "visited") {
          nodeHash.head.prevTileKey = (targetRC[0]+1) + "x" + targetRC[1];
        }
        const targetUpRC: string = (targetRC[0]-1) + "x" + targetRC[1];
        if (targetUpRC in newGrid && newGrid[targetUpRC].fill === "visited") {
          nodeHash.head.prevTileKey = (targetRC[0]-1) + "x" + targetRC[1];
        }
      }
      appRefs.pathHead = {tileKey: nodeHash.head.tileKey};
      while (nodeHash[appRefs.pathHead.tileKey] && nodeHash[appRefs.pathHead.tileKey].prevTileKey) {
        appRefs.pathHead = {tileKey: (nodeHash[appRefs.pathHead.tileKey].prevTileKey || ""), next: appRefs.pathHead};
        if (appRefs.pathHead.next) { appRefs.pathHead.next.prev = appRefs.pathHead; }
      }
      console.log(nodeHash);
      return true;
    } else {
      newGrid[nodeHash.head.tileKey].fill = "visited";
      const tileRC: [number, number] = [parseInt(nodeHash.head.tileKey.split("x")[0]), parseInt(nodeHash.head.tileKey.split("x")[1])];
      const tileRightRC: string = tileRC[0] + "x" + (tileRC[1] + 1);
      if (tileRightRC in nodeHash && nodeHash.head.distance + 1 < nodeHash[tileRightRC].distance) {
        nodeHash[tileRightRC].setDistance(nodeHash.head.distance + 1);
        nodeHash[tileRightRC].prevTileKey = nodeHash.head.tileKey;
      }
      const tileLeftRC: string = tileRC[0] + "x" + (tileRC[1] -1);
      if (tileLeftRC in nodeHash && nodeHash.head.distance + 1 < nodeHash[tileLeftRC].distance) {
        nodeHash[tileLeftRC].setDistance(nodeHash.head.distance + 1);
        nodeHash[tileLeftRC].prevTileKey = nodeHash.head.tileKey;
      }
      const tileUpRC: string = (tileRC[0] - 1) + "x" + tileRC[1];
      if (tileUpRC in nodeHash && nodeHash.head.distance + 1 < nodeHash[tileUpRC].distance) {
        nodeHash[tileUpRC].setDistance(nodeHash.head.distance + 1);
        nodeHash[tileUpRC].prevTileKey = nodeHash.head.tileKey;
      }
      const tileDownRC: string = (tileRC[0] + 1) + "x" + tileRC[1];
      if (tileDownRC in nodeHash && nodeHash.head.distance + 1 < nodeHash[tileDownRC].distance) {
        nodeHash[tileDownRC].setDistance(nodeHash.head.distance + 1);
        nodeHash[tileDownRC].prevTileKey = nodeHash.head.tileKey;
      }
      if (nodeHash.head.next) {
        nodeHash.head = nodeHash.head.next;
        nodeHash.head.prev?.remove();
        return dijkstraRecursive(nodeHash);
      } else {
        return false;
      }
    }
  }
  return dijkstraRecursive(nodeHash);
}

export const aStarSim = (appRefs: Refs): boolean => {
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