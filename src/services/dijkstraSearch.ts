import { Refs } from "../App";
import { Grid } from "../Types";

export const dijkstraSearch = (appRefs: Refs): boolean => {
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
          node.iterativeSetHead(node);
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
        node.iterativeSetTail(node);
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
  nodeHash.head = nodeHash.head.head;
  nodeHash.tail = nodeHash.head.tail;
  let count: number = 0;
  const dijkstraRecursive = (nodeHash: {[index: string]: UnvisitedTileLLNode}): boolean => {
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
    if (nodeHash.head.prevTileKey || nodeHash.head.distance === 0) {
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
        console.log(nodeHash.head.tileKey, "nodeHash head prevTile: " + nodeHash.head.prevTileKey, "nodeHash head dis: " + nodeHash.head.distance);
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
    } else {
      return false;
    }
  }
  return dijkstraRecursive(nodeHash);
}