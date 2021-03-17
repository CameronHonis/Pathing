import React from "react";
import gsap from "gsap";
import { AppContext, AppContextType, State as AppState } from "../App";
import { PathNode } from "../Types";

import Flag from "../svgComponents/Flag";
import Target from "../svgComponents/Target";

const tileSpacePix: number = 60;

interface Refs {
  isInitialRender: boolean;
  gridToolsDisabled: boolean;
  lastGridBounds: [number, number, number, number];
  tilesHighlighted: Set<HTMLElement>;
  tilesDebounce: Set<string>;
  simId: number;
  resetAppContextEnabled: boolean;
}

const initialRefs: Refs = {
  isInitialRender: true,
  gridToolsDisabled: false,
  lastGridBounds: [0,0,0,0],
  tilesHighlighted: new Set(),
  tilesDebounce: new Set(),
  simId: 0,
  resetAppContextEnabled: false,
}

interface State {
  generalWidth: number;
}

const initialState: State = {
  generalWidth: 0
}

const Grid = () => { //For all things related to the grid
  // --------------REACTY STUFF--------------
  const refs = React.useRef<Refs>(initialRefs)

  const [state, setState] = React.useState<State>(initialState);

  const { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext);

  React.useEffect(() => {
    let gridBoundsChanged: boolean = false;
    if (gridBounds[0] !== refs.current.lastGridBounds[0]){
      gridBoundsChanged = true;
    } else if (gridBounds[1] !== refs.current.lastGridBounds[1]){
      gridBoundsChanged = true;
    } else if (gridBounds[2] !== refs.current.lastGridBounds[2]){
      gridBoundsChanged = true;
    } else if (gridBounds[3] !== refs.current.lastGridBounds[3]){
      gridBoundsChanged = true;
    }
    if (gridBoundsChanged){
      renderGridPosition(!refs.current.isInitialRender);
    } else {
      renderGridPosition(false);
    }
  },[appState.grid]); //eslint-disable-line

  React.useEffect(() => {
    refs.current.gridToolsDisabled = appState.isPlayingSim;
    if (appState.isPlayingSim) {
      renderGridPosition(false);
      simClock(refs.current.simId, 0);
    } else {
      refs.current.simId++;
      for (const [tileKey, tileValue] of Object.entries(appState.grid)) {
        if (tileValue.fill === "empty") {
          const tile: HTMLElement | null = document.getElementById("tile" + tileKey);
          const innerTile: HTMLElement | null = tile?.querySelector(".innerTile") as HTMLElement;
          if (innerTile) {
            innerTile.style.height = "0";
            innerTile.style.width = "0";
          }
        }
      }
      document.querySelectorAll(".pathDot").forEach((v: Element) => gsap.to(v, {height: "0", width: "0", duration: 0}));
    }
  },[appState.isPlayingSim]) //eslint-disable-line

  React.useEffect(() => {
    renderGridPosition(false);
  },[state.generalWidth]); //eslint-disable-line

  React.useEffect(() => {
    window.addEventListener("resize", e => {
      const pixelInterval = 25;
      if (Math.floor(window.innerWidth/pixelInterval) !== Math.floor(state.generalWidth/pixelInterval)){
        setState({...state, generalWidth: pixelInterval*Math.floor(window.innerWidth/pixelInterval)});
      }
    });
    refs.current.isInitialRender = false;
  },[]); //eslint-disable-line

  // --------------ANIMATING--------------
  const simClock: (simId: number, step: number) => void = (simId, step) => {
    if (simId !== refs.current.simId) { return; }
    // animate new visited tile
    for (const [tileKey, tileValue] of Object.entries(appRefs.simGrids[step])) {
      const tileElement: HTMLElement | null = document.getElementById("tile" + tileKey);
      const innerTileElement: HTMLElement | null = tileElement?.querySelector(".innerTile") as HTMLElement;
      const tileHighlightT: number = .15/appRefs.playbackSpeed;
      if (innerTileElement) {
        if (tileValue.fill === "empty") {
          innerTileElement.style.height = "0";
          innerTileElement.style.width = "0";
        } else if (tileValue.fill === "visited") {
          if (innerTileElement.style.height !== "50px") {}
          else if (innerTileElement.style.backgroundColor !== "rgb(50, 50, 80)") {}
          else { continue; }
          innerTileElement.style.height = "20px";
          innerTileElement.style.width = "20px";
          innerTileElement.style.borderRadius = "5px";
          innerTileElement.style.backgroundColor = "rgb(50, 50, 80)";
          gsap.to(innerTileElement, {height: "50px", width: "50px", borderRadius: "10px", duration: Math.min(tileHighlightT, .2)});
          setTimeout(() => {
            if (simId !== refs.current.simId) {
              innerTileElement.style.height = "0";
              innerTileElement.style.width = "0";
            }
          }, Math.min(1000*tileHighlightT, 200));
        }
      }
    }
    if (step < appRefs.simGrids.length - 1) {
      setTimeout(() => {
        simClock(simId, step + 1);
      },200/appRefs.playbackSpeed);
    } else { // sim anims finished
      // animate path
      if (!appRefs.pathHead) { return; }
      const resetAppContext: () => void = () => {
        refs.current.resetAppContextEnabled = false;
        appRefs.pathHead = undefined;
        appRefs.simGrids = [];
        setAppState({...appState, isPlayingSim: false});
      }
      const resetGrid: () => void = () => {
        setTimeout(() => {
          for (const [tileKey, tileValue] of Object.entries(appState.grid)) {
            if (tileValue.fill === "empty") {
              const tile: HTMLElement | null = document.getElementById("tile" + tileKey);
              const innerTileElement: HTMLElement | null = tile?.querySelector(".innerTile") as HTMLElement;
              if (innerTileElement) {
                setTimeout(() => {
                  if (simId !== refs.current.simId) { return; }
                  const c: number[] = innerTileElement.style.backgroundColor.split(",").map((v) => parseInt(v.replace(/\D/g,"")));
                  gsap.to(innerTileElement, {backgroundColor: "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)", duration: 1});
                  setTimeout(() => {
                    if (simId !== refs.current.simId) { return; }
                    innerTileElement.style.height = "0";
                    innerTileElement.style.width = "0";
                  },1000);
                },Math.random()*2000);
              }
            }
          }
          setTimeout(() => {
            if (refs.current.resetAppContextEnabled) { resetAppContext(); }
            else { refs.current.resetAppContextEnabled = true; }
          },3000);
          let pathTail: PathNode | undefined = appRefs.pathHead;
          while (pathTail?.next) {
            pathTail = pathTail.next;
          }
          animatePathDots(pathTail, "backward");
        },3000);
      }
      const animatePathTiles = (pathPointer: PathNode): void => {
        const tile: HTMLElement | null = document.getElementById("tile" + pathPointer.tileKey);
        const innerTile: HTMLElement | null = tile?.querySelector(".innerTile") as HTMLElement;
        gsap.to(innerTile, {backgroundColor: "rgb(150, 150, 200)", duration: 1/appRefs.playbackSpeed});
        setTimeout(() => {
          gsap.to(innerTile, {backgroundColor: "rgb(50, 50, 80)", duration: (simId === refs.current.simId ? 1/appRefs.playbackSpeed : 0)});
        },1000/appRefs.playbackSpeed);
        setTimeout(() => {
          if (pathPointer.next) {
            animatePathTiles(pathPointer.next);
          }
        },100/appRefs.playbackSpeed);
      }
      const animatePathDots: (pathPointer: PathNode | undefined, direction: string) => void = (pathPointer, direction) => {
        if (simId !== refs.current.simId) { return; }
        if (!pathPointer) {
          if (direction === "forward") { resetGrid(); }
          else {
            if (refs.current.resetAppContextEnabled) { resetAppContext(); }
            else { refs.current.resetAppContextEnabled = true; }
          }
          return;
        }
        const currRC: [number, number] = [parseInt(pathPointer.tileKey.split("x")[0]), parseInt(pathPointer.tileKey.split("x")[1])];
        const dotExpandT: number = .1/appRefs.playbackSpeed;
        const dotSpaceT: number = direction === "forward" ? .08/appRefs.playbackSpeed : .04/appRefs.playbackSpeed;
        const dotCompressT: number = .2/appRefs.playbackSpeed;
        if (pathPointer.prev) {
          const prevRC: [number, number] = [parseInt(pathPointer.prev.tileKey.split("x")[0]), parseInt(pathPointer.prev.tileKey.split("x")[1])];
          let firstDot: HTMLElement | null;
          if (currRC[0] > prevRC[0]) { firstDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x2"); }
          else if (currRC[0] < prevRC[0]) { firstDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x8"); }
          else if (currRC[1] > prevRC[1]) { firstDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x4"); }
          else { firstDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x6"); }
          if (firstDot) {
            if (direction === "forward") {
              // fade dot in
              gsap.fromTo(firstDot, {width: "0", height: "0", backgroundColor: "rgb(243,243,64)"}, {width: "20px", height: "20px", duration: dotExpandT});
              setTimeout(() => { // dot expand delay
                gsap.to(firstDot, {width: "8px", height: "8px", duration: dotCompressT});
                setTimeout(() => { // dot compress delay
                  // check if simId (clockId) is curr anim id
                  if (simId !== refs.current.simId) { gsap.to(firstDot, {width: "0", height: "0", duration: 0}); } 
                },1000*dotCompressT);
              },1000*dotExpandT);
            } else {
              // fade dot out
              setTimeout(() => {
                gsap.to(firstDot, {backgroundColor: "rgba(243, 243, 64, 0)", duration: dotCompressT});
              },2000*dotSpaceT);
            }
          }
        }
        const midDot: HTMLElement | null = document.getElementById(currRC[0] + "x" + currRC[1] + "x5");
        if (midDot) {
          if (direction === "forward") {
            // fade dot in
            setTimeout(() => { // space between mid and first delay
              gsap.fromTo(midDot, {width: "0", height: "0", backgroundColor: "rgb(243,243,64)"}, {width: "20px", height: "20px", duration: dotExpandT});
              setTimeout(() => { // dot expand delay
                gsap.to(midDot, {width: "8px", height: "8px", duration: dotCompressT});
                setTimeout(() => { // dot compress delay
                  // check if simId (clockId) is curr anim id
                  if (simId !== refs.current.simId) { 
                    gsap.to(midDot, {width: "0", height: "0", duration: 0}); 
                  } 
                },1000*dotCompressT);
              },1000*dotExpandT);
            },1000*dotSpaceT);
          } else {
            // fade dot out
            setTimeout(() => {
              gsap.to(midDot, {backgroundColor: "rgb(243, 243, 64, 0)", duration: dotCompressT});
            },1000*dotSpaceT);
          }
        }
        if (pathPointer.next) {
          const nextRC: [number, number] = [parseInt(pathPointer.next.tileKey.split("x")[0]), parseInt(pathPointer.next.tileKey.split("x")[1])];
          let lastDot: HTMLElement | null;
          if (currRC[0] > nextRC[0]) { lastDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x2"); }
          else if (currRC[0] < nextRC[0]) { lastDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x8"); }
          else if (currRC[1] > nextRC[1]) { lastDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x4"); }
          else { lastDot = document.getElementById(currRC[0] + "x" + currRC[1] + "x6"); }
          if (lastDot) {
            if (direction === "forward") {
              setTimeout(() => { // space between last and first delay
                gsap.fromTo(lastDot, {width: "0", height: "0", backgroundColor: "rgb(243,243,64)"}, {width: "20px", height: "20px", duration: dotExpandT});
                setTimeout(() => { // dot expand delay
                  gsap.to(lastDot, {width: "8px", height: "8px", duration: dotCompressT});
                  setTimeout(() => { // dot compress delay
                    if (simId !== refs.current.simId) { 
                      // check if simId (clockId) is curr anim id
                      gsap.to(lastDot, {width: "0", height: "0", duration: 0}); 
                    } 
                  },1000*dotCompressT);
                },1000*dotCompressT);
              },2000*dotSpaceT);
            } else {
              gsap.to(lastDot, {backgroundColor: "rgb(243, 243, 64, 0)", duration: dotCompressT});
            }
          }
        }
        setTimeout(() => {
          animatePathDots(direction === "forward" ? pathPointer.next : pathPointer.prev, direction);
        },3000*dotSpaceT);
      }
      animatePathTiles(appRefs.pathHead);
      setTimeout(() => animatePathDots(appRefs.pathHead, "forward"), 1000/appRefs.playbackSpeed);
    }
  }

  const renderGridPosition = (animate: boolean) => { // only set animate to true if actual grid re-positioning is needed
    refs.current.lastGridBounds = gridBounds;
    if (animate){
      refs.current.gridToolsDisabled = true;
      setTimeout(() => {
        refs.current.gridToolsDisabled = false;
      },250);
    }
    for (let r = gridBounds[0] - 1; r < gridBounds[1] + 2; r++){
      for (let c = gridBounds[2] - 1; c < gridBounds[3] + 2; c++){
        renderTilePosition(r, c, animate);
      }
    }
  }

  const renderTilePosition = (r: number, c: number, animate: boolean) => {
    const tile: HTMLElement | null = document.getElementById("tile" + r + "x" + c);
    const relRow: number = r - gridBounds[0];
    const relCol: number = c - gridBounds[2];
    if (tile){
      if (!appState.grid[r+"x"+c]){
        tile.style.opacity = "0";
        setTimeout(() => {
          tile.style.opacity = "1";
        }, 250);
      }
      const leftPos: number = window.innerWidth/2 + (relCol - (gridCols%2 === 0 ? gridCols/2 - .5 : Math.floor(gridCols/2)))*tileSpacePix;
      const topPos: number = headerHeight + (window.innerHeight - headerHeight)/2 + 
        (relRow - (gridRows%2 === 0 ? gridRows/2 - .5 : Math.floor(gridRows/2)))*tileSpacePix;
      gsap.to(tile, {
        left: leftPos + "px",
        top: topPos + "px",
        duration: animate ? .25 : 0
      });
      const middleDot: HTMLElement | null = document.getElementById(r + "x" + c + "x5");
      if (middleDot) {
        middleDot.style.left = leftPos + "px";
        middleDot.style.top = topPos + "px";
      }
      const topDot: HTMLElement | null = document.getElementById(r + "x" + c + "x2");
      if (topDot) {
        topDot.style.left = leftPos + "px";
        topDot.style.top = topPos - 20 + "px";
      }
      const bottomDot: HTMLElement | null = document.getElementById(r + "x" + c + "x8");
      if (bottomDot) {
        bottomDot.style.left = leftPos + "px";
        bottomDot.style.top = topPos + 20 + "px";
      }
      const leftDot: HTMLElement | null = document.getElementById(r + "x" + c + "x4");
      if (leftDot) {
        leftDot.style.left = leftPos - 20 + "px";
        leftDot.style.top = topPos + "px";
      }
      const rightDot: HTMLElement | null = document.getElementById(r + "x" + c + "x6");
      if (rightDot) {
        rightDot.style.left = leftPos + 20 + "px";
        rightDot.style.top = topPos + "px";
      }
    }
  }

  const tileOver = (tileName: string) => {
    if (refs.current.gridToolsDisabled) return;
    const tile: HTMLElement | null = document.getElementById("tile"+tileName);
    if (tile){
      if (refs.current.tilesHighlighted.has(tile)) return;
      const tileR = parseInt(tileName.split("x")[0]);
      const tileC = parseInt(tileName.split("x")[1]);
      if (appState.currTool === "boxSelect"){
        for (let i of refs.current.tilesHighlighted){
          tileOut(i.id);
        }
        if (!tileInteractable(tileR, tileC)) {
          tile.style.cursor = "default";
          return;
        } else {
          tile.style.cursor = "pointer";
        }
        refs.current.tilesHighlighted.add(tile);
        if (!appState.grid[tileName]){
          gsap.to(tile, {backgroundColor: "rgb(50, 255, 150)", duration: .15});
        } else if (appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          gsap.to(tile, {backgroundColor: "rgb(200, 50, 100)", duration: .15});
          const innerTile: HTMLElement | null = tile.firstChild as HTMLElement;
          if (innerTile) gsap.to(innerTile, {backgroundColor: "rgb(200, 50, 100)", duration: .15});
        }
      } else if (appState.currTool === "rowSelect"){
        if (tileC < gridBounds[2] || tileC > gridBounds[3]) {
          tile.style.cursor = "default";
          return;
        } else {
          tile.style.cursor = "pointer";
        }
        for (let i of refs.current.tilesHighlighted){
          if (parseInt(i.id.substring(4).split("x")[0]) !== tileR){
            tileOut(i.id);
          }
        }
        if (!appState.grid[tileName]){
          for (let c: number = gridBounds[2]; c < gridBounds[3]+1; c++){
            const cTile: HTMLElement | null = document.getElementById("tile"+tileR+"x"+c);
            if (cTile && !appState.grid[tileR+"x"+c]){
              refs.current.tilesHighlighted.add(cTile);
              gsap.to(cTile, {backgroundColor: "rgb(50, 255, 150)", duration: .15});
            }
          }
        } else if (appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          for (let c: number = gridBounds[2]; c < gridBounds[3]+1; c++){
            const cTile: HTMLElement | null = document.getElementById("tile"+tileR+"x"+c);
            if (cTile && appState.grid[tileR+"x"+c] && appState.grid[tileR+"x"+c].fill !== "start" && appState.grid[tileR+"x"+c].fill !== "target"){
              refs.current.tilesHighlighted.add(cTile);
              gsap.to(cTile, {backgroundColor: "rgb(200, 50, 100)", duration: .15});
              const innerCTile: HTMLElement | null = cTile.firstChild as HTMLElement;
              if (innerCTile) gsap.to(innerCTile, {backgroundColor: "rgb(200, 50, 100)", duration: .15});
            }
          }
        }
      } else if (appState.currTool === "columnSelect"){
        if (tileR < gridBounds[0] || tileR > gridBounds[1]) {
          tile.style.cursor = "default";
          return;
        } else {
          tile.style.cursor = "pointer";
        }
        for (let i of refs.current.tilesHighlighted){
          if (parseInt(i.id.substring(4).split("x")[1]) !== tileC){
            tileOut(i.id);
          }
        }
        if (!appState.grid[tileName]){
          for (let r: number = gridBounds[0]; r < gridBounds[1]+1; r++){
            const rTile: HTMLElement | null = document.getElementById("tile"+r+"x"+tileC);
            if (rTile && !appState.grid[r+"x"+tileC]){
              refs.current.tilesHighlighted.add(rTile);
              gsap.to(rTile, {backgroundColor: "rgb(50, 255, 150)", duration: .15});
            }
          }
        } else if (appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          for (let r: number = gridBounds[0]; r < gridBounds[1]+1; r++){
            const rTile: HTMLElement | null = document.getElementById("tile"+r+"x"+tileC);
            if (rTile && appState.grid[r+"x"+tileC] && appState.grid[r+"x"+tileC].fill !== "start" && appState.grid[r+"x"+tileC].fill !== "target"){
              refs.current.tilesHighlighted.add(rTile);
              gsap.to(rTile, {backgroundColor: "rgb(200, 50, 100)", duration: .15});
              const innerRTile: HTMLElement | null = rTile.firstChild as HTMLElement;
              if (innerRTile) gsap.to(innerRTile, {backgroundColor: "rgb(200, 50, 100)", duration: .15});
            }
          }
        }
      } else if (appState.currTool === "wall"){
        for (let i of refs.current.tilesHighlighted){
          tileOut(i.id);
        }
        if (appState.grid[tileName] && appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          const innerTile: HTMLElement | null = tile.firstChild as HTMLElement;
          if (innerTile){
            tile.style.cursor = "pointer";
            refs.current.tilesHighlighted.add(tile);
            if (appState.grid[tileName].fill === "wall"){
              gsap.to(innerTile, {backgroundColor: "rgb(200, 50, 100)", duration: .15});
            } else {
              gsap.killTweensOf(innerTile);
              innerTile.style.backgroundColor = "rgb(200, 200, 200)";
              innerTile.style.width = "10px";
              innerTile.style.height = "10px";
              gsap.to(innerTile, {height: "20px", width: "20px", borderRadius: "5px", duration: .15});
            }
          } else {
            tile.style.cursor = "default";
          }
        } else {
          tile.style.cursor = "default";
        }
      } else if (appState.currTool === "start" || appState.currTool === "target"){
        for (let i of refs.current.tilesHighlighted){
          tileOut(i.id);
        }
        if (!tileInteractable(tileR, tileC) || !appState.grid[tileName]) {
          tile.style.cursor = "default";
          return;
        } else {
          tile.style.cursor = "pointer";
        }
        const innerTile: HTMLElement | null = tile.firstChild as HTMLElement;
        if (appState.grid[tileName].fill === appState.currTool){
          const svgStrokeParts: NodeListOf<Element> | undefined = innerTile.querySelectorAll(".svgToolStroke");
          const svgFillParts: NodeListOf<Element> | undefined = innerTile.querySelectorAll(".svgToolFill");
          for (let i of svgStrokeParts){
            gsap.to(i, {stroke: "rgb(200, 50, 100)", duration: .15});
          }
          for (let i of svgFillParts){
            gsap.to(i, {fill: "rgb(200, 50, 100)", duration: .15});
          }
        } else {
          gsap.killTweensOf(innerTile);
          innerTile.style.backgroundColor = appState.currTool === "start" ? "rgb(255, 255, 100)" : "rgb(50, 100, 255)";
          innerTile.style.borderRadius = "5px";
          gsap.to(innerTile, {height: "20px", width: "20px", borderRadius: "5px", duration: .15});
        }
      }
    }
    
  }

  const tileOut = (tileName: string) => {
    if (refs.current.gridToolsDisabled) { return; }
    const tile: HTMLElement | null = document.getElementById("tile"+tileName);
    if (tile){
      const dehighlightTile = (tileName: string) => {
        const delTile = document.getElementById("tile"+tileName);
        if (delTile){
          refs.current.tilesHighlighted.delete(delTile);
          if (!appState.grid[tileName]){
            gsap.to(delTile, {backgroundColor: "rgb(35,35,45)", duration: .25});
          } else {
            gsap.to(delTile, {backgroundColor: "rgb(10,10,10)", duration: .25});
            const innerTile: HTMLElement | null = delTile.firstChild as HTMLElement;
            if (innerTile){
              if (appState.grid[tileName].fill === "empty"){
                gsap.to(innerTile, {width: "0", height: "0", duration: .25});
              } else if (appState.grid[tileName].fill === "wall") {
                gsap.to(innerTile, {backgroundColor: "rgb(200, 200, 200)", width: "50px", height: "50px", duration: .25});
              } else if (appState.grid[tileName].fill === "start" || appState.grid[tileName].fill === "target") {
                const svgStrokeParts: NodeListOf<Element> | undefined = innerTile.querySelectorAll(".svgToolStroke");
                const svgFillParts: NodeListOf<Element> | undefined = innerTile.querySelectorAll(".svgToolFill");
                for (let i of svgStrokeParts){
                  gsap.to(i, {stroke: "rgb(255, 255, 255)", duration: .25});
                }
                for (let i of svgFillParts){
                  gsap.to(i, {fill: "rgb(255, 255, 255)", duration: .25});
                }
              }
            }
          }
        }
      }
      if (appState.currTool === "boxSelect"){
        dehighlightTile(tileName);
      } else if (appState.currTool === "rowSelect"){
        for (let i of refs.current.tilesHighlighted){
          if (i.id.substring(4).split("x")[0] === tileName.split("x")[0]){
            dehighlightTile(i.id.substring(4));
          }
        }
      } else if (appState.currTool === "columnSelect"){
        for (let i of refs.current.tilesHighlighted){
          if (i.id.substring(4).split("x")[1] === tileName.split("x")[1]){
            dehighlightTile(i.id.substring(4));
          }
        }
      } else if (appState.currTool === "wall" || appState.currTool === "start" || appState.currTool === "target"){
        dehighlightTile(tileName);
      }
    }
  }

  // --------------LOGIC--------------
  const tileInteractable = (r: number, c: number) => {
    if (appState.grid[r+"x"+c]){
      if (appState.grid[r+"x"+c].fill === "start"){
        if (appState.currTool !== "start") { return false; }
        let startCount: number = 0;
        for (let i in appState.grid){
          if (appState.grid[i].fill === "start"){
            startCount++;
            if (startCount > 1) break;
          }
        }
        if (startCount > 1) return true;
        else return false;
      } else if (appState.grid[r+"x"+c].fill === "target"){
        if (appState.currTool !== "target") { return false; }
        let targetCount: number = 0;
        for (let i in appState.grid){
          if (appState.grid[i].fill === "target"){
            targetCount++;
            if (targetCount > 1) break;
          }
        }
        if (targetCount > 1) return true;
        else return false;
      }
    }
    if (appState.grid[(r+1)+"x"+c]) return true;
    if (appState.grid[(r-1)+"x"+c]) return true;
    if (appState.grid[r+"x"+(c+1)]) return true;
    if (appState.grid[r+"x"+(c-1)]) return true;
    return false;
  }

  const tileClick = (tileName: string) => {
    if (refs.current.gridToolsDisabled) return;
    if (refs.current.tilesDebounce.has(tileName)) return;
    const tile: HTMLElement | null = document.getElementById("tile"+tileName);
    if (tile){
      const tileR: number = parseInt(tileName.split("x")[0]);
      const tileC: number = parseInt(tileName.split("x")[1]);
      if (appState.currTool === "boxSelect"){
        if (!tileInteractable(tileR, tileC)) return;
        refs.current.tilesDebounce.add(tileName);
        setTimeout(() => {
          refs.current.tilesDebounce.delete(tileName);
        }, 250);
        if (!appState.grid[tileName]){
          addTiles([tileName]);
        } else if (appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          removeTiles([tileName]);
        }
      } else if (appState.currTool === "rowSelect"){
        if (tileC < gridBounds[2] || tileC > gridBounds[3]) return;
        if (!appState.grid[tileName]){
          const tilesToAdd: string[] = [];
          for (let c: number = gridBounds[2]; c < gridBounds[3]+1; c++){
            if (!appState.grid[tileR+"x"+c]){
              tilesToAdd.push(tileR+"x"+c);
            }
          }
          addTiles(tilesToAdd);
        } else if (appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          const tilesToRemove: string[] = [];
          for (let c: number = gridBounds[2]; c < gridBounds[3]+1; c++){
            if (appState.grid[tileR+"x"+c] && appState.grid[tileR+"x"+c].fill !== "start" && appState.grid[tileR+"x"+c].fill !== "target"){
              tilesToRemove.push(tileR+"x"+c);
            }
          }
          removeTiles(tilesToRemove);
        }
      } else if (appState.currTool === "columnSelect"){
        if (tileR < gridBounds[0] || tileR > gridBounds[1]) return;
        if (!appState.grid[tileName]){
          const tilesToAdd: string[] = [];
          for (let r: number = gridBounds[0]; r < gridBounds[1]+1; r++){
            if (!appState.grid[r+"x"+tileC]){
              tilesToAdd.push(r+"x"+tileC);
            }
          }
          addTiles(tilesToAdd);
        } else if (appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          const tilesToRemove: string[] = [];
          for (let r: number = gridBounds[0]; r < gridBounds[1]+1; r++){
            if (appState.grid[r+"x"+tileC] && appState.grid[r+"x"+tileC].fill !== "start" && appState.grid[r+"x"+tileC].fill !== "target"){
              tilesToRemove.push(r+"x"+tileC);
            }
          }
          removeTiles(tilesToRemove);
        }
      } else if (appState.currTool === "wall"){
        if (appState.grid[tileName] && appState.grid[tileName].fill !== "start" && appState.grid[tileName].fill !== "target"){
          const tempGrid: AppState["grid"] = {...appState.grid};
          const innerTile: HTMLElement | null = tile.firstChild as HTMLElement;
          if (appState.grid[tileName].fill === "wall"){
            tempGrid[tileName].fill = "empty";
            if (innerTile){
              gsap.to(innerTile, {height: "0", width: "0", duration: .15});
            }
          } else {
            tempGrid[tileName].fill = "wall";
            if (innerTile){
              gsap.to(innerTile, {height: "50px", width: "50px", borderRadius: "10px", duration: .15});
            }
          }
          setAppState({...appState, grid: tempGrid});
        }
      } else if (appState.currTool === "start" || appState.currTool === "target"){
        if (!tileInteractable(tileR, tileC)) return;
        if (!appState.grid[tileName]) return;
        const tempGrid: AppState["grid"] = {...appState.grid};
        if (appState.grid[tileName].fill !== appState.currTool){
          tempGrid[tileName].fill = appState.currTool;
        } else {
          tempGrid[tileName].fill = "empty";
        }
        setAppState({...appState, grid: tempGrid});
      }
    }
  }

  const addTiles = (tileNames: string[]) => {
    const tempGrid: AppState["grid"] = {...appState.grid};
    for (let i in tileNames){
      const tile: HTMLElement | null = document.getElementById("tile"+tileNames[i]);
      if (tile){
        gsap.killTweensOf(tile);
        tile.style.backgroundColor = "rgb(50, 255, 150)";
        gsap.to(tile, {backgroundColor: "rgb(10, 10, 10)", duration: .25});
      }
      tempGrid[tileNames[i]] = {fill: "empty"};
    }
    setAppState({...appState, grid: tempGrid});
  }

  const removeTiles = (tileNames: string[]) => {
    const tempGrid: AppState["grid"] = {...appState.grid};
    for (let i in tileNames){
      delete tempGrid[tileNames[i]];
    }
    // possibly add algo that compacts seperate chunks automatically?
    // possibly add tool that shifts chunks?
    setAppState({...appState, grid: tempGrid});
  }
  // TODO: refactor tile functions to accept row and col numbers instead of string
  const gridBounds: [number, number, number, number] = [0,0,0,0];
  for (let i in appState.grid){ //sets grid bounds
    const rc: string[] = i.split("x");
    const r = parseInt(rc[0]);
    const c = parseInt(rc[1]);
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
  const canAddCol: boolean = tileSpacePix*(gridCols+1) + 60 < window.innerWidth;
  const headerHeight: number = Math.min(Math.max(.5*window.innerWidth, 180), 250);
  const canAddRow: boolean = tileSpacePix*(gridRows+1) + 60 < window.innerHeight - headerHeight;
  const tiles: JSX.Element[] = []
  let tileBounds: [number, number, number, number] = [...gridBounds];
  if (canAddRow){
    tileBounds = [gridBounds[0]-1, gridBounds[1]+1, tileBounds[2], tileBounds[3]];
  }
  if (canAddCol){
    tileBounds = [tileBounds[0], tileBounds[1], gridBounds[2]-1, gridBounds[3]+1];
  }

  for (let r: number = tileBounds[0]; r < tileBounds[1]+1; r++){
    for (let c: number = tileBounds[2]; c < tileBounds[3]+1; c++){
      tiles.push(
        <div
          key={r+"x"+c}
          id={"tile"+r+"x"+c}
          className={"tile"}
          style={appState.grid[r+"x"+c] ? {} : {backgroundColor: "rgb(35,35,45)", opacity: 0}}
          onMouseOver={e => tileOver(r+"x"+c)}
          onMouseMove={e => tileOver(r+"x"+c)}
          onMouseLeave={e => tileOut(r+"x"+c)}
          onClick={e => tileClick(r+"x"+c)}
        >
          {
            appState.grid[r+"x"+c] && (
              (appState.grid[r+"x"+c].fill === "empty" && <div className={"innerTile"} key={r+"x"+c+"inner"}/>) ||
              (appState.grid[r+"x"+c].fill === "wall" && <div className={"innerTile"} style={{backgroundColor: "rgb(200, 200, 200)"}} key={r+"x"+c+"inner"}/>) ||
              (appState.grid[r+"x"+c].fill === "start" && <Flag style={{height: "36px", width: "36px"}} />) ||
              (appState.grid[r+"x"+c].fill === "target" && <Target style={{height: "36px", width: "36px"}} />)
            )
          }
        </div>
      )
    }
  }
  const pathDots: JSX.Element[] = [];
  let pathPointer: PathNode | undefined = appRefs.pathHead;
  while (pathPointer) {
    if (pathPointer.tileKey in appState.grid) {
      pathDots.push(
        <div
          key={pathPointer.tileKey + "x5"}
          id={pathPointer.tileKey + "x5"}
          className={"pathDot"}
        />
      )
      if (pathPointer.prev && pathPointer.prev.tileKey in appState.grid) {
        let currDir: string, prevDir: string;
        const currRC: [number, number] = [parseInt(pathPointer.tileKey.split("x")[0]), parseInt(pathPointer.tileKey.split("x")[1])];
        const prevRC: [number, number] = [parseInt(pathPointer.prev.tileKey.split("x")[0]), parseInt(pathPointer.prev.tileKey.split("x")[1])];
        if (currRC[0] > prevRC[0]) { currDir = "2"; prevDir = "8"; }
        else if (currRC[0] < prevRC[0]) { currDir = "8"; prevDir = "2"; }
        else if (currRC[1] > prevRC[1]) { currDir = "4"; prevDir = "6"; }
        else { currDir = "6"; prevDir = "4"; }
        pathDots.push(
          <div
            key={pathPointer.prev.tileKey + "x" + prevDir}
            id={pathPointer.prev.tileKey + "x" + prevDir}
            className={"pathDot"}
          />
        )
        pathDots.push(
          <div
            key={pathPointer.tileKey + "x" + currDir}
            id={pathPointer.tileKey + "x" + currDir}
            className={"pathDot"}
          />
        )
      }
    }
    pathPointer = pathPointer.next;
  }

  return(
    <div id="grid">
      {tiles}
      {pathDots}
    </div>
  )
}

export default Grid;