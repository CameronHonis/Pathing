import React from "react";
import gsap from "gsap";
import { Refs, State } from "../App";
import { GridRefs, TileRefs } from "../components/Grid2";
import { Grid, PathNode, Tile } from "../Types";

export const simClock = (
  appState: State, 
  setAppState: React.Dispatch<React.SetStateAction<State>>, 
  appRefs: Refs, 
  gridRefs: GridRefs, 
  simClockId: number, 
  step: number
): void => {
  if (simClockId !== gridRefs.simClockId) { return; }
  // animate new visited tile
  const tileHighlightT: number = Math.min(.2, .15/appRefs.playbackSpeed);
  if (step > 0) {
    for (const [ tileKey, tileValue ] of Object.entries(appRefs.simGrids[step])) {
      const lastTileValue: Tile = appRefs.simGrids[step-1][tileKey];
      if (lastTileValue.fill === tileValue.fill) continue;
      const tileRefs: TileRefs = gridRefs.tileRefs[tileKey];
      gsap.killTweensOf(tileRefs.inner.current, "backgroundColor,width,height");
      if (tileValue.fill === "visited") {
        gsap.to(tileRefs.inner.current, {width: "30%", height: "30%", backgroundColor: "rgba(50,50,80,1)", duration: 0});
        gsap.to(tileRefs.inner.current, {width: "100%", height: "100%", duration: tileHighlightT});
        setTimeout(() => {
          if (simClockId !== gridRefs.simClockId) {
            // sim ended early exit
            gsap.killTweensOf(tileRefs.inner.current, "width,height,backgroundColor");
            gsap.to(tileRefs.inner.current, {width: "0%", height: "0%", backgroundColor: "rgba(10,10,15,1)", duration: 0});
          }
        }, 1000*tileHighlightT);
      }
    }
  }
  if (step < appRefs.simGrids.length - 1) {
    setTimeout(() => {
      simClock(appState, setAppState, appRefs, gridRefs, simClockId, step + 1);
    },200/appRefs.playbackSpeed);
  } else { // sim anims finished
    if (!appRefs.pathHead) { return; }
    // fill target tile
    const targetTileRefs: TileRefs = gridRefs.tileRefs[appRefs.pathHead.tileKey];
    gsap.killTweensOf(targetTileRefs.inner.current, "width,height,backgroundColor");
    gsap.to(targetTileRefs.inner.current, {width: "30%", height: "30%", backgroundColor: "rgba(50,50,80,1)", duration: 0});
    gsap.to(targetTileRefs.inner.current, {width: "100%", height: "100%", duration: .25});
    // animate path
    const resetAppContext: () => void = () => {
      gridRefs.resetAppContextEnabled = false;
      appRefs.pathHead = undefined;
      appRefs.simGrids = [];
      setAppState({...appState, isPlayingSim: false});
    }
    const resetGrid: () => void = () => {
      // turns grid back into non-sim mode
      setTimeout(() => {
        const lastSim: Grid = appRefs.simGrids[appRefs.simGrids.length-1];
        for (const [ tileKey, tileValue ] of Object.entries(lastSim)) {
          if (tileValue.fill !== "visited") continue;
          const tileRefs: TileRefs = gridRefs.tileRefs[tileKey];
          setTimeout(() => {
            if (simClockId !== gridRefs.simClockId) { return; }
            gsap.killTweensOf(tileRefs.inner.current, "width,height,backgroundColor");
            gsap.to(tileRefs.inner.current, {backgroundColor: "rgba(10,10,15,1)"});
            setTimeout(() => {
              if (simClockId !== gridRefs.simClockId) { return; }
              gsap.to(tileRefs.inner.current, {width: 0, height: 0, duration: 0});
            }, 1000);
          }, Math.random()*2000);
        }
        setTimeout(() => {
          if (gridRefs.resetAppContextEnabled) { resetAppContext(); }
          else { gridRefs.resetAppContextEnabled = true; }
        }, 3000);
        let pathTail: PathNode | undefined = appRefs.pathHead;
        while (pathTail?.next) {
          pathTail = pathTail.next;
        }
        animatePathDots(pathTail, "backward");
      }, 3000);
    }
    const animatePathTiles = (pathPointer: PathNode): void => {
      const tileRefs: TileRefs = gridRefs.tileRefs[pathPointer.tileKey];
      if (!tileRefs || !tileRefs.inner.current) return;
      gsap.killTweensOf(tileRefs.inner.current, "backgroundColor");
      gsap.to(tileRefs.inner.current, {backgroundColor: "rgb(150, 150, 200)", duration: 1/appRefs.playbackSpeed});
      setTimeout(() => {
        gsap.to(tileRefs.inner.current, {backgroundColor: "rgb(50, 50, 80)", duration: (simClockId === gridRefs.simClockId ? 1/appRefs.playbackSpeed : 0)});
      }, 1000/appRefs.playbackSpeed);
      setTimeout(() => {
        if (pathPointer.next) {
          animatePathTiles(pathPointer.next);
        }
      }, 100/appRefs.playbackSpeed);
    }
    const animatePathDots: (pathPointer: PathNode | undefined, direction: string) => void = (pathPointer, direction) => {
      if (simClockId !== gridRefs.simClockId) { return; }
      if (!pathPointer || !(pathPointer.tileKey in gridRefs.tileRefs)) {
        if (direction === "forward") { resetGrid(); }
        else {
          if (gridRefs.resetAppContextEnabled) { resetAppContext(); }
          else { gridRefs.resetAppContextEnabled = true; }
        }
        return;
      }
      const tileRefs: TileRefs = gridRefs.tileRefs[pathPointer.tileKey];
      const [ r, c ]: [number, number] = pathPointer.tileKey.split("x").map(v => +v) as [number, number];
      const dotExpandT: number = .1/appRefs.playbackSpeed;
      const dotSpaceT: number = direction === "forward" ? .08/appRefs.playbackSpeed : .04/appRefs.playbackSpeed;
      const dotCompressT: number = .2/appRefs.playbackSpeed;
      if (pathPointer.prev) {
        const [ r0, c0 ]: [number, number] = pathPointer.prev.tileKey.split("x").map(v => +v) as [number, number];
        let firstDot: HTMLDivElement;
        if (r0 < r) { // moving down
          firstDot = tileRefs.pathDots[2].current;
        } else if (r0 > r) { // moving up
          firstDot = tileRefs.pathDots[8].current;
        } else if (c0 < c) { // moving right
          firstDot = tileRefs.pathDots[4].current;
        } else { // moving left
          firstDot = tileRefs.pathDots[6].current;
        }
        if (direction === "forward") {
          // fade dot in
          gsap.fromTo(firstDot, {width: "0", height: "0", backgroundColor: "rgb(243,243,64)"}, {width: "20px", height: "20px", duration: dotExpandT});
          setTimeout(() => { // dot expand delay
            gsap.to(firstDot, {width: "8px", height: "8px", duration: dotCompressT});
            setTimeout(() => { // dot compress delay
              // check if simClockId (clockId) is curr anim id
              if (simClockId !== gridRefs.simClockId) { 
                gsap.killTweensOf(firstDot, "width,height");
                gsap.to(firstDot, {width: "0", height: "0", duration: 0}); 
              } 
            },1000*dotCompressT);
          },1000*dotExpandT);
        } else {
          // fade dot out
          setTimeout(() => {
            gsap.to(firstDot, {backgroundColor: "rgba(243, 243, 64, 0)", duration: dotCompressT});
          },2000*dotSpaceT);
        }
      }
      const midDot: HTMLDivElement = tileRefs.pathDots[5].current;
      if (direction === "forward") {
        // fade dot in
        setTimeout(() => { // space between mid and first delay
          gsap.fromTo(midDot, {width: "0", height: "0", backgroundColor: "rgb(243,243,64)"}, {width: "20px", height: "20px", duration: dotExpandT});
          setTimeout(() => { // dot expand delay
            gsap.to(midDot, {width: "8px", height: "8px", duration: dotCompressT});
            setTimeout(() => { // dot compress delay
              // check if simClockId (clockId) is curr anim id
              if (simClockId !== gridRefs.simClockId) { 
                gsap.killTweensOf(midDot, "width,height");
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
      if (pathPointer.next) {
        const [ r1, c1 ]: [number, number] = pathPointer.next.tileKey.split("x").map(v => +v) as [number, number];
        let lastDot: HTMLDivElement;
        if (r1 < r) { // moving up
          lastDot = tileRefs.pathDots[2].current;
        } else if (r1 > r) { // moving down
          lastDot = tileRefs.pathDots[8].current;
        } else if (c1 < c) { // moving left
          lastDot = tileRefs.pathDots[4].current;
        } else { // moving right
          lastDot = tileRefs.pathDots[6].current;
        }
        if (direction === "forward") {
          setTimeout(() => { // space between last and first delay
            gsap.fromTo(lastDot, {width: "0", height: "0", backgroundColor: "rgb(243,243,64)"}, {width: "20px", height: "20px", duration: dotExpandT});
            setTimeout(() => { // dot expand delay
              gsap.to(lastDot, {width: "8px", height: "8px", duration: dotCompressT});
              setTimeout(() => { // dot compress delay
                if (simClockId !== gridRefs.simClockId) { 
                  // check if simClockId (clockId) is curr anim id
                  gsap.killTweensOf(lastDot, "width,height");
                  gsap.to(lastDot, {width: "0", height: "0", duration: 0}); 
                } 
              },1000*dotCompressT);
            },1000*dotCompressT);
          },2000*dotSpaceT);
        } else {
          gsap.to(lastDot, {backgroundColor: "rgb(243, 243, 64, 0)", duration: dotCompressT});
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