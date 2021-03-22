export enum TileFill {
  // todo: complete
}

export interface Tile {
  fill: "start" | "target" | "wall" | "empty" | "visited";
}

export interface Grid {
  [index: string]: Tile;
}

export interface PathNode {
  tileKey: string;
  prev?: PathNode;
  next?: PathNode;
}