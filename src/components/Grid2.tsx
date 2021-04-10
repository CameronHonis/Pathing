import gsap from "gsap/all";
import React from "react";
import { AppContext, AppContextType, State } from "../App";
import { Helpers } from "../services/Helpers";
import { simClock } from "../services/simClock";
import Flag from "../svgComponents/Flag";
import Target from "../svgComponents/Target";
import { Grid } from "../Types";

const tileLength: number = 50;
const tileGapDis: number = 8;

export interface TileRefs {
  main: React.MutableRefObject<HTMLDivElement>;
  inner: React.MutableRefObject<HTMLDivElement>;
  svg: React.MutableRefObject<SVGSVGElement>;
  pathDots: {
    2: React.MutableRefObject<HTMLDivElement>;
    4: React.MutableRefObject<HTMLDivElement>;
    5: React.MutableRefObject<HTMLDivElement>;
    6: React.MutableRefObject<HTMLDivElement>;
    8: React.MutableRefObject<HTMLDivElement>;
  }
}

export interface GridRefs {
  tileRefs: {[index: string]: TileRefs};
  mouseOverTile?: string;
  simClockId: number;
  lastGridState: Grid;
  targetsCount: number;
  renders: number;
  resetAppContextEnabled: boolean;
}

export const initGridRefs: GridRefs = {
  tileRefs: {},
  simClockId: 0,
  lastGridState: {},
  targetsCount: 1,
  renders: 0,
  resetAppContextEnabled: false,
};

enum GridRefsAction {
  SetMouseOver,
  SetMouseDown,
}

const screenWidthReducer = (last: number, curr: number): number => {
  if (Math.abs(last - curr) > 10) {
    return curr;
  } else {
    return last;
  }
}

const canInteract = (appState: State, tileKey: string | undefined, targetsCount: number): boolean => {
  if (appState.isPlayingSim) return false;
  if (!tileKey) return false;
  if (tileKey in appState.grid) {
    if (appState.grid[tileKey].fill === "start") return false;
    if (appState.grid[tileKey].fill === "target" && targetsCount === 1) return false;
    return true;
  } else {
    if (appState.currTool === "wall" || appState.currTool === "start" || appState.currTool === "target") {
      return false;
    }
  }
  return true;
}

const gridRefsReducer = (
  gridRefs: GridRefs, 
  action: GridRefsAction, 
  data: any, 
  appState: State, 
  setAppState: React.Dispatch<React.SetStateAction<State>>
): void => {
  if (action === GridRefsAction.SetMouseOver && data instanceof Array 
  && (typeof data[0] === "string") && typeof data[1] === "boolean" && typeof data[2] === "boolean") {
    const [ tileKey, isMouseOver, isMouseDown ] = data;
    if ((isMouseOver && gridRefs.mouseOverTile === tileKey) || (!gridRefs.mouseOverTile && !isMouseOver)) return;
    // set on refs
    if (isMouseOver) {
      gridRefs.mouseOverTile = tileKey;
    } else {
      gridRefs.mouseOverTile = undefined;
    }
    // side effects
    if (isMouseDown) {
      gridRefsReducer(gridRefs, GridRefsAction.SetMouseDown, isMouseOver, appState, setAppState);
    }
    if (canInteract(appState, tileKey, gridRefs.targetsCount)) {
      if (appState.currTool === "boxSelect") {
        gsap.killTweensOf(gridRefs.tileRefs[tileKey].main.current, "backgroundColor");
        gsap.killTweensOf(gridRefs.tileRefs[tileKey].inner.current, "width,height,backgroundColor");
        if (isMouseOver) {
          let backgroundColor: string;
          if (tileKey in appState.grid) {
            backgroundColor = "rgba(255,50,100,1)";
          } else {
            backgroundColor = "rgba(50,255,150,1)";
          }
          gsap.to(gridRefs.tileRefs[tileKey].inner.current, {backgroundColor, width: "100%", height: "100%", duration: 0});
        } else {
          let backgroundColor: string;
          if (tileKey in appState.grid) {
            backgroundColor = "rgba(255,50,100,0)";
          } else {
            backgroundColor = "rgba(50,255,150,0)";
          }
          gsap.to(gridRefs.tileRefs[tileKey].inner.current, {backgroundColor, duration: .25});
        }
      } else if (appState.currTool === "rowSelect") {
        const [ r, ]: [number, number] = tileKey.split("x").map(v => +v) as [number, number];
        const isInGrid: boolean = tileKey in appState.grid;
        for (const [ tileKey0, tileRefs ] of Object.entries(gridRefs.tileRefs)) {
          if (tileKey0 in appState.grid !== isInGrid) continue;
          if (!canInteract(appState, tileKey0, gridRefs.targetsCount)) continue;
          const [ r0, ]: [number, number] = tileKey0.split("x").map(v => +v) as [number, number];
          if (r === r0) {
            gsap.killTweensOf(tileRefs.main.current, "backgroundColor");
            gsap.killTweensOf(tileRefs.inner.current, "width,height,backgroundColor");
            if (isMouseOver) {
              const backgroundColor: string = isInGrid ? "rgba(255,50,100,1)" : "rgba(50,255,150,1)";
              gsap.to(tileRefs.inner.current, {backgroundColor, width: "100%", height: "100%", duration: 0});
            } else {
              const backgroundColor: string = isInGrid ? "rgba(255,50,100,0)" : "rgba(50,255,150,0)";
              gsap.to(tileRefs.inner.current, {backgroundColor, width: "100%", height: "100%", duration: .25});
            }
          }
        }
      } else if (appState.currTool === "columnSelect") {
        const [ ,c ]: [number, number] = tileKey.split("x").map(v => +v) as [number, number];
        const isInGrid: boolean = tileKey in appState.grid;
        for (const [ tileKey0, tileRefs ] of Object.entries(gridRefs.tileRefs)) {
          if (tileKey0 in appState.grid !== isInGrid) continue;
          if (!canInteract(appState, tileKey0, gridRefs.targetsCount)) continue;
          const [ ,c0 ]: [number, number] = tileKey0.split("x").map(v => +v) as [number, number];
          if (c === c0) {
            gsap.killTweensOf(tileRefs.main.current, "backgroundColor");
            gsap.killTweensOf(tileRefs.inner.current, "width,height,backgroundColor");
            if (isMouseOver) {
              const backgroundColor: string = isInGrid ? "rgba(255,50,100,1)" : "rgba(50,255,150,1)";
              gsap.to(tileRefs.inner.current, {backgroundColor, width: "100%", height: "100%", duration: 0});
            } else {
              const backgroundColor: string = isInGrid ? "rgba(255,50,100,0)" : "rgba(50,255,150,0)";
              gsap.to(tileRefs.inner.current, {backgroundColor, width: "100%", height: "100%", duration: .25});
            }
          }
        }
      } else if (appState.currTool === "wall" || appState.currTool === "start" || appState.currTool === "target") {
        gsap.killTweensOf(gridRefs.tileRefs[tileKey].main.current, "backgroundColor");
        gsap.killTweensOf(gridRefs.tileRefs[tileKey].inner.current, "width,height,backgroundColor");
        if (isMouseOver) {
          let backgroundColor: string;
          if (appState.currTool === "wall") {
            backgroundColor = "rgba(200,200,200,1)";
          } else if (appState.currTool === "start") {
            backgroundColor = "rgba(255,255,100)";
          } else {
            backgroundColor = "rgba(255,50,100)";
          }
          if (appState.grid[tileKey].fill === "wall") {
            gridRefs.tileRefs[tileKey].main.current.style.backgroundColor = "rgba(10,10,15,1)";
            gsap.to(gridRefs.tileRefs[tileKey].inner.current, {backgroundColor, width: "70%", height: "70%", duration: 0});
          } else {
            gsap.to(gridRefs.tileRefs[tileKey].inner.current, {backgroundColor, width: "30%", height: "30%", duration: 0});
          }
        } else { // mouseLeave
          if (appState.grid[tileKey].fill === "wall") {
            gsap.to(gridRefs.tileRefs[tileKey].inner.current, {backgroundColor: "rgba(200,200,200,1)", duration: 0});
            gsap.to(gridRefs.tileRefs[tileKey].inner.current, {width: "100%", height: "100%", duration: .25});
          } else {
            gsap.to(gridRefs.tileRefs[tileKey].inner.current, {width: "0%", height: "0%", duration: .25});
          }
        }
      }
    }
  } else if (action === GridRefsAction.SetMouseDown && typeof data === "boolean") {
    // data: boolean = isMouseDown
    // side effects
    if (gridRefs.mouseOverTile && canInteract(appState, gridRefs.mouseOverTile, gridRefs.targetsCount)) {
      if (data) { // mousedown
        if (appState.currTool === "wall") {
          const newAppGrid: Grid = Helpers.deepCopy(appState.grid);
          if (appState.grid[gridRefs.mouseOverTile].fill === "wall") {
            newAppGrid[gridRefs.mouseOverTile].fill = "empty";
          } else {
            newAppGrid[gridRefs.mouseOverTile].fill = "wall";
          }
          setAppState({...appState, grid: newAppGrid});
        }
      } else { // mouseup
        if (appState.currTool === "start") {
          const newAppGrid: Grid = Helpers.deepCopy(appState.grid);
          for (const tile of Object.values(newAppGrid)) {
            if (tile.fill === "start") {
              tile.fill = "empty";
            }
          } 
          newAppGrid[gridRefs.mouseOverTile].fill = "start";
          setAppState({...appState, grid: newAppGrid});
        } else if (appState.currTool === "target") {
          const newAppGrid: Grid = Helpers.deepCopy(appState.grid);
          if (appState.grid[gridRefs.mouseOverTile].fill === "target") {
            newAppGrid[gridRefs.mouseOverTile].fill = "empty";
            gridRefs.targetsCount--;
          } else {
            newAppGrid[gridRefs.mouseOverTile].fill = "target";
            gridRefs.targetsCount++;
          }
          setAppState({...appState, grid: newAppGrid});
        } else if (appState.currTool === "boxSelect") {
          const newAppGrid: Grid = Helpers.deepCopy(appState.grid);
          let newAppGridBounds: [number,number,number,number] = Helpers.deepCopy(appState.gridBounds);
          const [ r, c ]: [number, number] = gridRefs.mouseOverTile.split("x").map(v => +v) as [number, number];
          if (gridRefs.mouseOverTile in appState.grid) {
            delete newAppGrid[gridRefs.mouseOverTile];
            if (r === newAppGridBounds[0] || r === newAppGridBounds[1] || c === newAppGridBounds[2] || c === newAppGridBounds[3]) {
              newAppGridBounds = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
              for (const tileKey of Object.keys(newAppGrid)) {
                const [ r0, c0 ]: [number, number] = tileKey.split("x").map(v => +v) as [number, number];
                newAppGridBounds[0] = Math.min(r0, newAppGridBounds[0]);
                newAppGridBounds[1] = Math.max(r0, newAppGridBounds[1]);
                newAppGridBounds[2] = Math.min(c0, newAppGridBounds[2]);
                newAppGridBounds[3] = Math.max(c0, newAppGridBounds[3]);
              }
            }
          } else {
            newAppGrid[gridRefs.mouseOverTile] = {fill: "empty"};
            newAppGridBounds[0] = Math.min(r, newAppGridBounds[0]);
            newAppGridBounds[1] = Math.max(r, newAppGridBounds[1]);
            newAppGridBounds[2] = Math.min(c, newAppGridBounds[2]);
            newAppGridBounds[3] = Math.max(c, newAppGridBounds[3]);
          }
          gsap.killTweensOf(gridRefs.tileRefs[gridRefs.mouseOverTile].inner.current, "backgroundColor,width,height");
          gridRefs.tileRefs[gridRefs.mouseOverTile].inner.current.style.backgroundColor = "rgba(10,10,15,0)";
          setAppState({...appState, grid: newAppGrid, gridBounds: newAppGridBounds});
        } else if (appState.currTool === "rowSelect" || appState.currTool === "columnSelect") {
          const newAppGrid: Grid = Helpers.deepCopy(appState.grid);
          let newAppGridBounds: [number, number, number, number] = Helpers.deepCopy(appState.gridBounds);
          const [ r, c ]: [number, number] = gridRefs.mouseOverTile.split("x").map(v => +v) as [number, number];
          const isInGrid: boolean = gridRefs.mouseOverTile in appState.grid;
          // add/remove tiles
          for (const [ tileKey0, tileRefs ] of Object.entries(gridRefs.tileRefs)) {
            if (tileKey0 in appState.grid !== isInGrid) continue;
            if (!canInteract(appState, tileKey0, gridRefs.targetsCount)) continue;
            const [ r0, c0 ]: [number, number] = tileKey0.split("x").map(v => +v) as [number, number];
            if ((appState.currTool === "rowSelect" && r === r0) || (appState.currTool === "columnSelect" && c === c0)) {
              if (isInGrid) {
                delete newAppGrid[tileKey0];
              } else if ((r0 >= appState.gridBounds[0] && r0 <= appState.gridBounds[1]) || (c0 >= appState.gridBounds[2] && c0 <= appState.gridBounds[3])){
                newAppGrid[tileKey0] = {fill: "empty"};
              }
              if (!tileRefs.inner.current) continue;
              gsap.killTweensOf(tileRefs.inner.current, "backgroundColor,width,height");
              tileRefs.inner.current.style.backgroundColor = "rgba(10,10,15,0)";
            }
          }
          // adjust gridBounds
          if (isInGrid) {
            newAppGridBounds = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
            for (const tileKey0 of Object.keys(newAppGrid)) {
              const [ r0, c0 ]: [number, number] = tileKey0.split("x").map(v => +v) as [number, number];
              newAppGridBounds[0] = Math.min(r0, newAppGridBounds[0]);
              newAppGridBounds[1] = Math.max(r0, newAppGridBounds[1]);
              newAppGridBounds[2] = Math.min(c0, newAppGridBounds[2]);
              newAppGridBounds[3] = Math.max(c0, newAppGridBounds[3]);
            }
          } else {
            newAppGridBounds[0] = Math.min(r, newAppGridBounds[0]);
            newAppGridBounds[1] = Math.max(r, newAppGridBounds[1]);
            newAppGridBounds[2] = Math.min(c, newAppGridBounds[2]);
            newAppGridBounds[3] = Math.max(c, newAppGridBounds[3]);
          }
          setAppState({...appState, grid: newAppGrid, gridBounds: newAppGridBounds});
        }
      }
    }
  }
}

export const Grid2: React.FC<{}> = () => {
  const { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext);
  const [ screenWidth, screenWidthDispatch ] = React.useReducer(screenWidthReducer, window.innerWidth);
  let { current: gridRefs } = React.useRef(Helpers.deepCopy(initGridRefs));

  React.useEffect(() => {
    window.addEventListener("resize", () => {
      screenWidthDispatch(window.innerWidth);
    });
  }, []);

  React.useEffect(() => { // deps: appState.grid
    console.group("appState.grid useEffect()");
    for (const [ tileKey, tileRefs ] of Object.entries(gridRefs.tileRefs)) {
      if (!tileRefs.main.current || !tileRefs.inner.current) continue;
      // immediate fill value styling
      if (tileKey in appState.grid) {
        if (tileKey in gridRefs.lastGridState && gridRefs.lastGridState[tileKey].fill === appState.grid[tileKey].fill) continue;
        //console.log("change at " + tileKey);
        gsap.killTweensOf(tileRefs.main.current, "backgroundColor");
        gsap.killTweensOf(tileRefs.inner.current, "width,height,backgroundColor");
        if (appState.grid[tileKey].fill === "empty") {
          if (tileKey in gridRefs.lastGridState) {
            gsap.to(tileRefs.inner.current, {backgroundColor: tileRefs.main.current.style.backgroundColor, 
              width: "100%", height: "100%", duration: 0});
            tileRefs.main.current.style.backgroundColor = "rgba(10,10,15,1)";
            gsap.to(tileRefs.inner.current, {width: "0%", height: "0%", duration: .25});
          } else { // just created
            tileRefs.main.current.style.backgroundColor = "rgba(10,10,15,1)";
          }
        } else if (appState.grid[tileKey].fill === "wall") {
          gsap.to(tileRefs.inner.current, {background: "rgba(200,200,200,1)", width: "30%", height: "30%", duration: 0});
          gsap.to(tileRefs.inner.current, {width: "100%", height: "100%", duration: .25});
          gsap.to(tileRefs.inner.current, {delay: .25, backgroundColor: "rgba(200,200,200,0)", duration: 0});
          gsap.to(tileRefs.main.current, {delay: .25, backgroundColor: "rgba(200,200,200,1)", duration: 0});
        } else if (appState.grid[tileKey].fill === "start" || appState.grid[tileKey].fill === "target") {
          tileRefs.inner.current.style.backgroundColor = "rgba(0,0,0,0)";
          tileRefs.main.current.style.backgroundColor = "rgba(10,10,15,1)";
        }
      } else { // !tileKey in appState.grid
        console.log(tileKey);
        tileRefs.main.current.style.backgroundColor = "rgba(10,10,15,0)";
      }
      if (canInteract(appState, tileKey, gridRefs.targetsCount)) {
        tileRefs.main.current.style.cursor = "pointer";
      } else {
        tileRefs.main.current.style.cursor = "default";
      }
    }
    // sync lastGridState with current gridState
    gridRefs.lastGridState = Helpers.deepCopy(appState.grid);
    console.groupEnd();
  }, [appState.grid]); 

  React.useEffect(() => { // deps: appState.gridBounds, screenWidth
    const midTop: number = headerHeight + (window.innerHeight - headerHeight)/2;
    // const midRow: number = (appState.gridBounds[1] - appState.gridBounds[0])/2;
    const midRow: number = .5*appState.gridBounds[1] + .5*appState.gridBounds[0];
    // const midCol: number = (appState.gridBounds[3] - appState.gridBounds[2])/2;
    const midCol: number = .5*appState.gridBounds[2] + .5*appState.gridBounds[3];
    const duration: number = gridRefs.renders === 1 ? 0 : .5;
    for (const [ tileKey, tileRefs ] of Object.entries(gridRefs.tileRefs)) {
      const [ r, c ]: [number, number] = tileKey.split("x").map(v => +v) as [number, number];
      const rowMidDiffPix: number = (tileLength + tileGapDis)*(r - midRow);
      const colMidDiffPix: number = (tileLength + tileGapDis)*(c - midCol);
      gsap.to(tileRefs.main.current, {left: colMidDiffPix + window.innerWidth/2, top: midTop + rowMidDiffPix, duration});
    }
  }, [appState.gridBounds, screenWidth]); 

  React.useEffect(() => {
    if (appState.isPlayingSim) {
      simClock(appState, setAppState, appRefs, gridRefs, gridRefs.simClockId, 0);
    } else {
      gridRefs.simClockId++;
      for (const [ tileKey, tileRefs ] of Object.entries(gridRefs.tileRefs)) {
        if (!(2 in tileRefs.pathDots) || !(4 in tileRefs.pathDots) || !(5 in tileRefs.pathDots) 
        || !(6 in tileRefs.pathDots) || !(8 in tileRefs.pathDots) || !tileRefs.inner.current) {
          continue;
        }
        gsap.killTweensOf(tileRefs.pathDots[2].current, "width,height");
        gsap.killTweensOf(tileRefs.pathDots[4].current, "width,height");
        gsap.killTweensOf(tileRefs.pathDots[5].current, "width,height");
        gsap.killTweensOf(tileRefs.pathDots[6].current, "width,height");
        gsap.killTweensOf(tileRefs.pathDots[8].current, "width,height");
        gsap.to(tileRefs.pathDots[2].current, {width: "0%", height: "0%", duration: 0});
        gsap.to(tileRefs.pathDots[4].current, {width: "0%", height: "0%", duration: 0});
        gsap.to(tileRefs.pathDots[5].current, {width: "0%", height: "0%", duration: 0});
        gsap.to(tileRefs.pathDots[6].current, {width: "0%", height: "0%", duration: 0});
        gsap.to(tileRefs.pathDots[8].current, {width: "0%", height: "0%", duration: 0});
        if (tileKey in appState.grid && (appState.grid[tileKey].fill === "empty" || appState.grid[tileKey].fill === "start" || appState.grid[tileKey].fill === "target")) {
          gsap.killTweensOf(tileRefs.inner.current, "backgroundColor,width,height");
          gsap.to(tileRefs.inner.current, {backgroundColor: "rgba(10,10,15,0)", width: "0%", height: "0%", duration: 0});
        }
      }
    }
  },[appState.isPlayingSim]);

  const gridBounds: [number, number, number, number] = [0,0,0,0];
  for (let tileKey in appState.grid){ //sets grid bounds
    const [ r, c ]: [number, number] = tileKey.split("x").map(v => +v) as [number, number];
    if (r < gridBounds[0]){
      gridBounds[0] = r;
    } else if (r > gridBounds[1]){
      gridBounds[1] = r;
    }
    if (c < gridBounds[2]){
      gridBounds[2] = c;
    } else if (c > gridBounds[3]){
      gridBounds[3] = c;
    }
  }
  const gridCols: number = gridBounds[3] - gridBounds[2] + 1;
  const gridRows: number = gridBounds[1] - gridBounds[0] + 1;
  const canAddCol: boolean = (tileLength + tileGapDis)*(gridCols+1) + 60 < window.innerWidth;
  const headerHeight: number = Math.min(Math.max(.5*window.innerWidth, 180), 250);
  const canAddRow: boolean = (tileLength + tileGapDis)*(gridRows+1) + 60 < window.innerHeight - headerHeight;
  const tiles: JSX.Element[] = []
  let tileBounds: [number, number, number, number] = [...gridBounds];
  if (canAddRow){
    tileBounds = [gridBounds[0]-1, gridBounds[1]+1, tileBounds[2], tileBounds[3]];
  }
  if (canAddCol){
    tileBounds = [tileBounds[0], tileBounds[1], gridBounds[2]-1, gridBounds[3]+1];
  }

  for (let r: number = tileBounds[0]; r <= tileBounds[1]; r++){
    for (let c: number = tileBounds[2]; c <= tileBounds[3]; c++){
      const tileStr: string = r+"x"+c;
      if (!(tileStr in appState.grid)) {
        let hasNeighbor: boolean = false;
        if ((r-1)+"x"+c in appState.grid) hasNeighbor = true;
        if ((r+1)+"x"+c in appState.grid) hasNeighbor = true;
        if (r+"x"+(c-1) in appState.grid) hasNeighbor = true;
        if (r+"x"+(c+1) in appState.grid) hasNeighbor = true;
        if (!hasNeighbor) continue;
      }
      if (!(tileStr in gridRefs.tileRefs)) {
        gridRefs.tileRefs[tileStr] = {
          main: React.createRef() as React.MutableRefObject<HTMLDivElement>,
          inner: React.createRef() as React.MutableRefObject<HTMLDivElement>,
          svg: React.createRef() as React.MutableRefObject<SVGSVGElement>,
          pathDots: {
            2: React.createRef() as React.MutableRefObject<HTMLDivElement>,
            4: React.createRef() as React.MutableRefObject<HTMLDivElement>,
            5: React.createRef() as React.MutableRefObject<HTMLDivElement>,
            6: React.createRef() as React.MutableRefObject<HTMLDivElement>,
            8: React.createRef() as React.MutableRefObject<HTMLDivElement>,
          },
        };
      }
      let svgComp: JSX.Element | undefined;
      if (tileStr in appState.grid) {
        if (appState.grid[tileStr].fill === "start") {
          svgComp = <Flag className="tileSVG" />; // todo: pass ref to svg comp
        } else if (appState.grid[tileStr].fill === "target") {
          svgComp = <Target className="tileSVG" />; // todo: pass ref to svg comp
        }
      }
      tiles.push(
        <div
          key={tileStr}
          className="tile2"
          ref={gridRefs.tileRefs[tileStr].main}
          style={{width: tileLength + "px", height: tileLength + "px", backgroundColor: "rgba(35, 35, 45, 1)"}}
          onMouseOver={e => gridRefsReducer(gridRefs, GridRefsAction.SetMouseOver, [tileStr, true, e.buttons === 1], appState, setAppState)}
          onMouseMove={e => gridRefsReducer(gridRefs, GridRefsAction.SetMouseOver, [tileStr, true, e.buttons === 1], appState, setAppState)}
          onMouseLeave={e => gridRefsReducer(gridRefs, GridRefsAction.SetMouseOver, [tileStr, false, e.buttons === 1], appState, setAppState)}
          onMouseDown={e => gridRefsReducer(gridRefs, GridRefsAction.SetMouseDown, true, appState, setAppState)}
          onMouseUp={e => gridRefsReducer(gridRefs, GridRefsAction.SetMouseDown, false, appState, setAppState)}
        >
          <div
            className="innerTile2"
            key={tileStr}
            ref={gridRefs.tileRefs[tileStr].inner}
            
          />
          {svgComp}
          <div
            className="pathDot2"
            ref={gridRefs.tileRefs[tileStr].pathDots[2]}
            style={{left: "50%", top: "16%"}}
          />
          <div
            className="pathDot2"
            ref={gridRefs.tileRefs[tileStr].pathDots[4]}
            style={{left: "16%", top: "50%"}}
          />
          <div
            className="pathDot2"
            ref={gridRefs.tileRefs[tileStr].pathDots[5]}
            style={{left: "50%", top: "50%"}}
          />
          <div
            className="pathDot2"
            ref={gridRefs.tileRefs[tileStr].pathDots[6]}
            style={{left: "84%", top: "50%"}}
          />
          <div
            className="pathDot2"
            ref={gridRefs.tileRefs[tileStr].pathDots[8]}
            style={{left: "50%", top: "84%"}}
          />
        </div>
      );
    }
  }

  gridRefs.renders++;
  console.log("GRID RERENDER");
  return(
    <div id="grid2">
      {tiles}
    </div>
  );
}