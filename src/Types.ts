export enum TileFill {
  // todo: complete
}

export interface Tile {
  fill: string; //todo: replace string type w TileFill enum type
}

export interface Grid {
  [index: string]: Tile;
}

export interface PathNode {
  tileKey: string;
  prev?: PathNode;
  next?: PathNode;
}