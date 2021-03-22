import { State } from "../App";
import { Tile } from "../Types";

export const generateMaze = (appState: State, setAppState: React.Dispatch<React.SetStateAction<State>>): void => {
  const newGrid: {[index: string]: Tile} = {}
  const connections: {[index: string]: Set<string>} = {}; // tileKey to group set of connected tileKeys
  const specials: string[] = []; // establish ref to all specials on init grid iter to avoid a second iter later
  const earlyConnections: [string, string][] = []; // tile pairs linked from gaps in honeycomb caused by special fills
  // initialize "honeycomb" aka "precut" version of maze
  for (let r = appState.gridBounds[0]; r < appState.gridBounds[1] + 1; ++r) {
    for (let c = appState.gridBounds[2]; c < appState.gridBounds[3] + 1; ++c) {
      const rcStr: string = r + "x" + c;
      if (!(rcStr in appState.grid)) continue;
      const isSpecial: boolean = appState.grid[rcStr].fill === "start" || appState.grid[rcStr].fill === "target";
      if (isSpecial) {
        newGrid[rcStr] = {...appState.grid[rcStr]};
        specials.push(rcStr);
      }
      if (r % 2 === 1 || c % 2 === 1) {
        if (isSpecial) {
          if (r % 2 === 0) {
            const upTileKey: string = (r-1) + "x" + c;
            const downTileKey: string = (r+1) + "x" + c;
            if (upTileKey in appState.grid && downTileKey in appState.grid) {
              earlyConnections.push([upTileKey, downTileKey]);
            }
          } else if (c % 2 === 0) {
            const leftTileKey: string = r + "x" + (c-1);
            const rightTileKey: string = r + "x" + (c+1);
            if (leftTileKey in appState.grid && rightTileKey in appState.grid) {
              earlyConnections.push([leftTileKey, rightTileKey]);
            }
          }
        } else {
          newGrid[rcStr] = {fill: "wall"};
        }
      } else {
        if (!isSpecial) {
          newGrid[rcStr] = {fill: "empty"};
        }
        connections[rcStr] = new Set([rcStr]);
      }
    }
  }
  const combineConnections = (keyFrom: string, keyTo: string): void => {

    // transfer fromKeys set into toKeys set
    connections[keyFrom].forEach(v => connections[keyTo].add(v));
    // override all fromKeys sets to pointer to toKeys set
    connections[keyFrom].forEach(v => v === keyFrom ? undefined : connections[v] = connections[keyTo]);
    connections[keyFrom] = connections[keyTo];
  }
  // combine connections between earlyConnection tiles
  for (const [ tile0, tile1 ] of earlyConnections) {
    combineConnections(tile0, tile1);
  }
  // cut honeycomb and combine connections in random order until least possible connection paths formed
  while (true) {
    // shuffle keys to ensure random order
    const shuffledKeys: string[] = Object.keys(connections);
    for (let i = shuffledKeys.length-1; i >= 0; --i) {
      const swapIdx: number = Math.floor(Math.random()*(i+1));
      const temp: string = shuffledKeys[i];
      shuffledKeys[i] = shuffledKeys[swapIdx];
      shuffledKeys[swapIdx] = temp;
    }
    let cutMade: boolean = false;
    while (shuffledKeys.length > 1) { // attempt neighbor cuts for all nodes
      const randIdx: number = Math.floor(Math.random()*shuffledKeys.length);
      const randTileKey: string = shuffledKeys[randIdx];
      shuffledKeys.pop();
      const [ r, c ]: [number, number] = randTileKey.split("x").map(v => +v) as [number, number];
      // attempt cut at 4 neighbor nodes from randTile in random order
      const shuffledCutDirs: string[] = ["up", "down", "left", "right"];
      for (let i = shuffledCutDirs.length-1; i >= 0; --i) {
        const swapIdx: number = Math.floor(Math.random()*(i+1));
        const temp: string = shuffledCutDirs[i];
        shuffledCutDirs[i] = shuffledCutDirs[swapIdx];
        shuffledCutDirs[swapIdx] = temp;
      }
      for (const cutDir of shuffledCutDirs) {
        let dis2Tile: string, dis1Tile: string;
        if (cutDir === "up") {
          dis2Tile = (r-2) + "x" + c;
          dis1Tile = (r-1) + "x" + c;
        } else if (cutDir === "down") {
          dis2Tile = (r+2) + "x" + c;
          dis1Tile = (r+1) + "x" + c;
        } else if (cutDir === "left") {
          dis2Tile = r + "x" + (c-2);
          dis1Tile = r + "x" + (c-1);
        } else {
          dis2Tile = r + "x" + (c+2);
          dis1Tile = r + "x" + (c+1);
        }
        if (dis1Tile in newGrid && dis2Tile in connections && connections[dis2Tile] !== connections[randTileKey]) {
          console.log("cut " + dis1Tile);
          if (newGrid[dis1Tile].fill === "wall") {
            newGrid[dis1Tile].fill = "empty";
          }
          combineConnections(dis2Tile, randTileKey);
          cutMade = true;
          break;
        }
      }
      if (cutMade) { break; }
    }
    if (!cutMade) { break; }
  }
  // set appState grid to newGrid (maybe incrementally through refs.simGrids for animating?)
  console.log(newGrid);
  setAppState({...appState, grid: newGrid});
}