import React from "react";
import gsap from "gsap";
import { AppContext, AppContextType } from "../App";
import { aStarSearch2 } from "../services/aStarSearch";
import { dijkstraSearch } from "../services/dijkstraSearch";
import { depthFirstSearch } from "../services/depthFirstSearch";
import { Grid } from "../Types";

import BoxSelect from "../svgComponents/BoxSelect";
import RowSelect from "../svgComponents/RowSelect";
import ColumnSelect from "../svgComponents/ColumnSelect";
import Wall from "../svgComponents/Wall";
import Flag from "../svgComponents/Flag";
import Target from "../svgComponents/Target";
import Play from "../svgComponents/Play";
import Stop from "../svgComponents/Stop";
import { generateMaze } from "../services/generateMaze";
import { clearGrid } from "../services/clearGrid";

const gridTextRatio: number = 1.83;
const obstaclesTextRatio: number = 4.45;
const algorithmTextRatio: number = 4.4;

enum SliderState {
  Idle,
  Dragging,
  Snapping,
}

interface HeaderState {
  generalWidth: number;
  activeTitle: string;
  speedSliderState: SliderState;
}

const initHeaderState: HeaderState = {
  generalWidth: 0,
  activeTitle: "grid",
  speedSliderState: SliderState.Idle,
}

enum ActionType {
  SetGeneralWidth,
  SetActiveTitle,
  SetSpeedSliderState,
}

interface HeaderStateDispatchAction {
  type: ActionType;
  data?: any;
}

// required to not reset state to init every window resize
const headerStateDispatch = (last: HeaderState, action: HeaderStateDispatchAction): HeaderState => {
  if (action.type === ActionType.SetGeneralWidth && typeof action.data === "number") {
    return {...last, generalWidth: action.data};
  } else if (action.type === ActionType.SetActiveTitle && typeof action.data === "string") {
    return {...last, activeTitle: action.data};
  } else if (action.type === ActionType.SetSpeedSliderState && action.data in SliderState) {
    return {...last, speedSliderState: action.data};
  } else { throw new Error(); }
}

const Header = () => {
  const {refs: appRefs, state: appState, setState: setAppState} = React.useContext<AppContextType>(AppContext);
  const [ state, stateDispatch ] = React.useReducer(headerStateDispatch, initHeaderState);

  const baseFontSize = Math.max(Math.min(35, window.innerWidth/38.66), 25);
  const mainDivWidth = Math.min(window.innerWidth/3.25 + 286, window.innerWidth, 600);
  let b1TotalMargin: number;
  if (state.activeTitle === "grid"){
    b1TotalMargin = (mainDivWidth - 50) - baseFontSize*(1.5*gridTextRatio + obstaclesTextRatio + algorithmTextRatio);
  } else if (state.activeTitle === "obstacles"){
    b1TotalMargin = (mainDivWidth - 50) - baseFontSize*(gridTextRatio + 1.5*obstaclesTextRatio + algorithmTextRatio);
  } else {
    b1TotalMargin = (mainDivWidth - 50) - baseFontSize*(gridTextRatio + obstaclesTextRatio + 1.5*algorithmTextRatio);
  }

  const renderHeader = () => {
    const header = document.getElementById("header");
    const headerContent = document.getElementById("headerContent");
    if (header){
      header.style.height = Math.min(Math.max(.5*mainDivWidth, 180), 250) + "px";
    }
    if (headerContent){
      headerContent.style.width = mainDivWidth + "px";
    }
  }

  const renderTitleButtons = (animate: boolean) => {
    const buttonsDiv = document.getElementById("titleButtons");
    const gridButton = document.getElementById("gridButton");
    const obstaclesButton = document.getElementById("obstaclesButton");
    const algorithmButton = document.getElementById("algorithmButton");
    if (buttonsDiv){
      buttonsDiv.style.height = 1.5*baseFontSize + 10 + "px";
    }
    if (gridButton){
      gridButton.style.backgroundColor = (state.activeTitle === "grid" ? "#50FFC0" : "rgb(60, 200, 150)");
      gridButton.style.color = (state.activeTitle === "grid" ? "rgb(27, 87, 65)" : "rgb(40, 140, 100)");
      gridButton.style.cursor = (state.activeTitle === "grid") ? "default" : "pointer";
      if (state.activeTitle === "grid") { gridButton.style.boxShadow = "none"; }
      gsap.to(gridButton, {
        fontSize: (state.activeTitle === "grid" ? baseFontSize*1.5 + "px" : baseFontSize + "px"),
        height: (state.activeTitle === "grid" ? baseFontSize*1.5 + 10 + "px" : baseFontSize + 10 + "px"),
        padding: "0 " + b1TotalMargin/6 + "px",
        duration: (animate ? .15 : 0)
      });
    }
    if (obstaclesButton) {
      obstaclesButton.style.backgroundColor = (state.activeTitle === "obstacles" ? "#FFCD4B" : "#DFB342");
      obstaclesButton.style.color = (state.activeTitle === "obstacles" ? "rgb(83, 66, 22)" : "rgb(140, 120, 40)");
      obstaclesButton.style.cursor = (state.activeTitle === "obstacles") ? "default" : "pointer";
      if (state.activeTitle === "obstacles") { obstaclesButton.style.boxShadow = "none"; }
      gsap.to(obstaclesButton, {
        fontSize: (state.activeTitle === "obstacles" ? baseFontSize*1.5 + "px" : baseFontSize + "px"),
        height: (state.activeTitle === "obstacles" ? baseFontSize*1.5 + 10 + "px" : baseFontSize + 10 + "px"),
        padding: "0 " + b1TotalMargin/6 + "px",
        duration: (animate ? .15 : 0)
      });
    }
    if (algorithmButton){
      algorithmButton.style.backgroundColor = (state.activeTitle === "algorithm" ? "#E168FF" : "#AA4EC1");
      algorithmButton.style.color = (state.activeTitle === "algorithm" ? "rgb(70, 32, 80)" : "rgb(120, 50, 140)");
      algorithmButton.style.cursor = (state.activeTitle === "algorithm") ? "default" : "pointer";
      if (state.activeTitle === "algorithm") { algorithmButton.style.boxShadow = "none"; }
      gsap.to(algorithmButton, {
        fontSize: (state.activeTitle === "algorithm" ? baseFontSize*1.5 + "px" : baseFontSize + "px"),
        height: (state.activeTitle === "algorithm" ? baseFontSize*1.5 + 10 + "px" : baseFontSize + 10 + "px"),
        padding: "0 " + b1TotalMargin/6 + "px",
        duration: (animate ? .15 : 0)
      });
    }
  };

  const renderToolDivs = () => {
    // loop and set unselected styles for all tools
    const svgDivAll = document.querySelectorAll(".svgDiv");
    for (let i = 0; i < svgDivAll.length; i++){
      gsap.to(svgDivAll[i], {
        backgroundColor: "rgb(45, 45, 60)",
        duration: 0
      });
      (svgDivAll[i] as HTMLDivElement).style.cursor = "pointer";
      const svgToolStrokeAll = svgDivAll[i].querySelectorAll(".svgToolStroke");
      const svgToolFillAll = svgDivAll[i].querySelectorAll(".svgToolFill");
      for (let j = 0; j < svgToolStrokeAll.length; j++){
        gsap.to(svgToolStrokeAll[j], {
          stroke: "rgb(150,150,150)",
          duration: 0
        });
      }
      for (let j = 0; j < svgToolFillAll.length; j++){
        gsap.to(svgToolFillAll[j], {
          fill: "rgb(150,150,150)",
          duration: 0
        });
      }
    }
    // override loop styling for selected tool
    const clickDiv = document.getElementById(appState.currTool);
    if (clickDiv){
      gsap.to(clickDiv, {
        background: "rgb(89, 95, 116)",
        duration: 0
      });
      clickDiv.style.cursor = "default";
      const svgToolStrokeAll = clickDiv.querySelectorAll(".svgToolStroke");
      const svgToolFillAll = clickDiv.querySelectorAll(".svgToolFill");
      for (let i = 0; i < svgToolStrokeAll.length; i++){
        gsap.to(svgToolStrokeAll[i], {
          stroke: "rgb(255,255,255)",
          duration: 0
        });
      }
      for (let i = 0; i < svgToolFillAll.length; i++){
        gsap.to(svgToolFillAll[i], {
          fill: "rgb(255,255,255)",
          duration: 0
        });
      }
    }
  }

  const renderAlgoButtons = () => {
    const dijkstraButton: HTMLElement | null = document.getElementById("dijkstra");
    const aStarButton: HTMLElement | null = document.getElementById("aStar");
    const depthFirstButton: HTMLElement | null = document.getElementById("depthFirst");
    if (!dijkstraButton || !aStarButton || !depthFirstButton) { return; }
    dijkstraButton.style.backgroundColor = appState.currAlgo === "dijkstra" ? "rgb(255, 100, 150)" : "rgba(255, 100, 150, .15)";
    dijkstraButton.style.color = appState.currAlgo === "dijkstra" ? "rgb(150, 50, 100)" : "rgb(255, 100, 150)";
    dijkstraButton.style.cursor = appState.currAlgo === "dijkstra" ? "default" : "pointer";
    aStarButton.style.backgroundColor = appState.currAlgo === "aStar" ? "rgb(100, 150, 255)" : "rgba(100, 150, 255, .15)";
    aStarButton.style.color = appState.currAlgo === "aStar" ? "rgb(50, 100, 150)" : "rgb(100, 150, 255)";
    aStarButton.style.cursor = appState.currAlgo === "aStar" ? "default" : "pointer";
    depthFirstButton.style.backgroundColor = appState.currAlgo === "depthFirst" ? "rgb(243, 243, 64)" : "rgba(243, 243, 64, .15)";
    depthFirstButton.style.color = appState.currAlgo === "depthFirst" ? "rgb(150, 150, 20)" : "rgb(243, 243, 64)";
    depthFirstButton.style.cursor = appState.currAlgo === "depthFirst" ? "default" : "pointer";
  }

  const renderSpeedSlider = () => {
    const speedSlider: HTMLElement | null = document.getElementById("speedSlider");
    const sliderTrack: HTMLElement | null = document.getElementById("speedSliderTrack");
    const sliderFill: HTMLElement | null = document.getElementById("speedSliderTrackFill");
    const sliderHandle: HTMLElement | null = document.getElementById("speedSliderHandle");
    const sliderAnnotation: HTMLElement | null = document.getElementById("speedSliderAnnotation");
    if (!speedSlider) { console.warn("couldnt find speedSlider"); return; }
    if (!sliderTrack) { console.warn("couldnt find sliderTrack"); return; }
    if (!sliderFill) { console.warn("couldnt find sliderFill"); return; }
    if (!sliderHandle) { console.warn("couldnt find sliderHandle"); return; }
    if (!sliderAnnotation) { console.warn("couldnt find sliderAnnotation"); return; }
    speedSlider.style.width = .7*mainDivWidth + "px";
    let sliderPos: number = (appRefs.playbackSpeed < 1) ? (3 - 1/appRefs.playbackSpeed)/4 : (1 + appRefs.playbackSpeed)/4;
    const sliderRect: DOMRect = sliderTrack.getBoundingClientRect();
    const handleRect: DOMRect = sliderHandle.getBoundingClientRect();
    gsap.to(sliderFill, {width: sliderPos*(sliderRect.right - sliderRect.left) + "px", duration: state.speedSliderState === SliderState.Idle ? 0 : .5});
    gsap.to(sliderHandle, {
      left: (sliderRect.left + sliderPos*(sliderRect.right - sliderRect.left)) + "px",
      top: sliderRect.top + .5*sliderRect.height + "px",
      duration: state.speedSliderState === SliderState.Idle ? 0 : .5
    });
    gsap.to(sliderAnnotation, {
      left: (sliderRect.left + sliderPos*sliderRect.width) + "px", 
      top: sliderRect.top - .5*handleRect.height,
      duration: state.speedSliderState === SliderState.Idle ? 0 : .5
    });
    sliderAnnotation.textContent = "x" + Math.round(100*appRefs.playbackSpeed)/100;
    const prevSpeedSliderState: SliderState = state.speedSliderState;
    if (prevSpeedSliderState !== SliderState.Idle) {
      setTimeout(() => {
        if (prevSpeedSliderState === state.speedSliderState) {
          stateDispatch({type: ActionType.SetSpeedSliderState, data: SliderState.Idle});
        }
      }, 500);
    }
  }

  const renderPlayPause = () => {
    const playPause: HTMLElement | null = document.getElementById("playPause");
    if (!playPause) { return; }
    //playPause.style.backgroundColor = appState.isPlayingSim ? "rgb(221, 104, 123)" : "rgb(125, 255, 145)";
    playPause.style.backgroundColor = appState.isPlayingSim ? "rgb(221, 104, 123)" : "rgb(60, 200, 80)"; //"rgb(70, 180, 110)";
    playPause.style.boxShadow = "none";
    const playPauseFill: HTMLElement | null = playPause.querySelector(".playFill") as HTMLElement;
    if (playPauseFill) {
      playPauseFill.style.fill = "rgb(40, 120, 50)";
    }
  }

  React.useEffect(() => {
    renderTitleButtons(true);
    switch (state.activeTitle) {
      case "grid":
        setAppState({...appState, currTool: "boxSelect"});
        renderToolDivs();
        break
      case "obstacles":
        setAppState({...appState, currTool: "wall"});
        renderToolDivs();
        break
      case "algorithm":
        setAppState({...appState, currTool: "none"});
        renderAlgoButtons();
        renderSpeedSlider();
    }
  },[state.activeTitle]); //eslint-disable-line

  React.useEffect(() => {
    renderToolDivs();
  },[appState.currTool]); //eslint-disable-line

  React.useEffect(() => {
    renderTitleButtons(false);
    renderHeader();
  },[state.generalWidth]); //eslint-disable-line

  React.useEffect(() => {
    renderAlgoButtons();
  },[appState.currAlgo]); //eslint-disable-line

  React.useEffect(() => {
    if (state.speedSliderState === SliderState.Idle || state.speedSliderState === SliderState.Snapping) {
      renderSpeedSlider();
    }
  },[state.speedSliderState]); //eslint-disable-line

  React.useEffect(() => {
    renderPlayPause();
  },[appState.isPlayingSim]); //eslint-disable-line

  React.useEffect(() => {
    window.addEventListener("resize", e => {
      const pixelInterval = 25;
      if (Math.floor(window.innerWidth/pixelInterval) !== Math.floor(state.generalWidth/pixelInterval)){
        stateDispatch({type: ActionType.SetGeneralWidth, data: pixelInterval*Math.floor(window.innerWidth/pixelInterval)});
      }
    });
    renderHeader();
  },[]); // eslint-disable-line

  const titleButtonsEnter = (title: string) => {
    if (state.activeTitle !== title) {
      const titleButton: HTMLElement | null = document.getElementById(title + "Button");
      if (titleButton) {
        titleButton.style.boxShadow = "0 0 12px -3px black";
        if (title === "grid") {
          titleButton.style.backgroundColor = "rgb(80,255,192)";
          titleButton.style.color = "rgb(27, 87, 65)";
        } else if (title === "obstacles") {
          titleButton.style.backgroundColor = "rgb(255, 205, 75)";
          titleButton.style.color = "rgb(83, 66, 22)";
        } else if (title === "algorithm") {
          titleButton.style.backgroundColor = "rgb(255, 104, 255)";
          titleButton.style.color = "rgb(70, 32, 80)";
        }
      }
    }
  }

  const titleButtonsLeave = (title: string) => {
    const titleButton: HTMLElement | null = document.getElementById(title + "Button");
    if (titleButton) {
      titleButton.style.boxShadow = "none";
      if (state.activeTitle !== title) {
        if (title === "grid") {
          titleButton.style.backgroundColor = "rgb(66, 218, 163)";
          titleButton.style.color = "rgb(40, 140, 100)";
        } else if (title === "obstacles") {
          titleButton.style.backgroundColor = "rgb(223, 180, 66)";
          titleButton.style.color = "rgb(140, 120, 40)";
        } else if (title === "algorithm") {
          titleButton.style.backgroundColor = "rgb(170, 80, 193)";
          titleButton.style.color = "rgb(120, 50, 140)";
        }
      }
    }
  }

  const svgDivEnter = (divName: string) => {
    if (divName === appState.currTool) return;
    const toolDiv: HTMLElement | null = document.querySelector("#"+divName);
    const svgToolStrokeAll: NodeListOf<Element> | undefined = toolDiv?.querySelectorAll(".svgToolStroke");
    const svgToolFillAll: NodeListOf<Element> | undefined = toolDiv?.querySelectorAll(".svgToolFill");
    if (toolDiv){
      gsap.to(toolDiv, {backgroundColor: "rgb(35, 35, 45)", duration: .15});
    }
    if (svgToolStrokeAll){
      for (let i = 0; i < svgToolStrokeAll.length; i++){
        gsap.to(svgToolStrokeAll[i], {
          stroke: "rgb(255,255,255)",
          duration: .15
        });
      }
    }
    if (svgToolFillAll){
      for (let i = 0; i < svgToolFillAll.length; i++){
        gsap.to(svgToolFillAll[i], {
          fill: "rgb(255,255,255)",
          duration: .15
        });
      }
    }
  }

  const svgDivLeave = (divName: string) => {
    if (divName === appState.currTool) return;
    const divTool: HTMLElement | null = document.querySelector("#"+divName);
    const svgToolStrokeAll: NodeListOf<Element> | undefined = divTool?.querySelectorAll(".svgToolStroke");
    const svgToolFillAll: NodeListOf<Element> | undefined = divTool?.querySelectorAll(".svgToolFill");
    if (divTool){
      gsap.to(divTool, {backgroundColor: "rgb(45, 45, 60)", duration: .15});
    }
    if (svgToolStrokeAll){
      for (let i = 0; i < svgToolStrokeAll.length; i++){
        gsap.to(svgToolStrokeAll[i], {
          stroke: "rgb(150,150,150)",
          duration: .15
        });
      }
    }
    if (svgToolFillAll){
      for (let i = 0; i < svgToolFillAll.length; i++){
        gsap.to(svgToolFillAll[i], {
          fill: "rgb(150,150,150)",
          duration: .15
        });
      }
    }
  }

  const speedSliderDrag = (e: React.DragEvent) => {
    if (e.clientX === 0) { return; }
    stateDispatch({type: ActionType.SetSpeedSliderState, data: SliderState.Dragging});
    const sliderTrack: HTMLElement | null = document.getElementById("speedSliderTrack");
    const sliderHandle: HTMLElement | null = document.getElementById("speedSliderHandle");
    const sliderFill: HTMLElement | null = document.getElementById("speedSliderTrackFill");
    const sliderAnnotation: HTMLElement | null = document.getElementById("speedSliderAnnotation");
    if (!sliderTrack || !sliderHandle || !sliderFill || !sliderAnnotation) { return; }
    const trackRect: DOMRect = sliderTrack.getBoundingClientRect();
    const relMousePos: number = Math.max(0, Math.min(1, (e.clientX - trackRect.left)/sliderTrack.clientWidth))
    gsap.to(sliderHandle, {left: (trackRect.left + relMousePos*sliderTrack.clientWidth) + "px", duration: 0});
    gsap.to(sliderFill, {width: relMousePos*sliderTrack.clientWidth + "px", duration: 0});
    const handleRect: DOMRect = sliderHandle.getBoundingClientRect();
    gsap.to(sliderAnnotation, {
      left: (trackRect.left + relMousePos*sliderTrack.clientWidth) + "px", 
      top: (trackRect.top - handleRect.height/2) + "px",
      duration: 0});
    const sliderSnapPos: number = Math.floor(4*relMousePos + .5)/4;
    if (sliderSnapPos > .5) {
      sliderAnnotation.textContent = "x" + Math.round(100*(4*sliderSnapPos - 1))/100;
    } else {
      sliderAnnotation.textContent = "x" + Math.round(100*(-1/(4*sliderSnapPos - 3)))/100;
    }
  }

  const speedSliderRelease = (e: React.DragEvent) => {
    const sliderTrack: HTMLElement | null = document.getElementById("speedSliderTrack");
    if (!sliderTrack) { return; }
    const trackRect: DOMRect = sliderTrack.getBoundingClientRect();
    const relMousePos: number = Math.max(0, Math.min(1, (e.clientX - trackRect.left)/trackRect.width));
    /* if (playbackSpeed < 1) sliderPos = (3 - Math.pow(playbackSpeed, -1))/4;
      else sliderPos = (1 + playbackSpeed)/4; */
    const sliderSnapPos: number = Math.floor(4*relMousePos + .5)/4;
    if (sliderSnapPos > .5) {
      appRefs.playbackSpeed = 4*sliderSnapPos - 1;
    } else {
      appRefs.playbackSpeed = -1/(4*sliderSnapPos - 3);
    }
    stateDispatch({type: ActionType.SetSpeedSliderState, data: SliderState.Snapping});
  }

  const playPauseEnter = () => {
   const playPause: HTMLElement | null = document.getElementById("playPause");
   if (!playPause) { return; }
   playPause.style.backgroundColor = appState.isPlayingSim ?  "rgb(255, 125, 145)" : "rgb(125, 255, 145)";
   playPause.style.boxShadow = "0 0 10px -2px";
   const playPauseFill: HTMLElement | null = playPause.querySelector(".playFill") as HTMLElement;
    if (playPauseFill) {
      playPauseFill.style.fill = "rgb(60, 180, 70)";
    }
  }

  const playPauseClick = (): void => {
    if (appState.isPlayingSim) {
      setAppState({...appState, isPlayingSim: false});
    } else {
      let hasStart: boolean = false;
      let hasTarget: boolean = false;
      for (const [_, tileValue] of Object.entries(appState.grid)) { //eslint-disable-line
        if (tileValue.fill === "start") { hasStart = true; }
        else if (tileValue.fill === "target") { hasTarget = true; }
        if (hasStart && hasTarget) {
          const gridCopy: Grid = {};
          for (const [tileKey, tileValue] of Object.entries(appState.grid)) {
            gridCopy[tileKey] = {...tileValue};
          }
          appRefs.simGrids = [gridCopy];
          appRefs.pathHead = undefined;
          if (appState.currAlgo === "dijkstra" && dijkstraSearch(appRefs)) {
            setAppState({...appState, isPlayingSim: true});
          } else if (appState.currAlgo === "aStar" && aStarSearch2(appRefs)) {
            setAppState({...appState, isPlayingSim: true});
          } else if (appState.currAlgo === "depthFirst" && depthFirstSearch(appRefs)) {
            setAppState({...appState, isPlayingSim: true});
          }
          break;
        }
      }
    }
  }

  return(
    <div id="header">
      <div id="headerContent">
        <div id="titleButtons">
          <button
            id="gridButton"
            className="noselect"
            name="grid"
            onMouseEnter={e => titleButtonsEnter("grid")}
            onMouseLeave={e => titleButtonsLeave("grid")}
            onClick={e => stateDispatch({type: ActionType.SetActiveTitle, data: "grid"})}
          >
            Grid
          </button>
          <button
            id="obstaclesButton"
            className="noselect"
            name="obstacles"
            onMouseEnter={e => titleButtonsEnter("obstacles")}
            onMouseLeave={e => titleButtonsLeave("obstacles")}
            onClick={e => stateDispatch({type: ActionType.SetActiveTitle, data: "obstacles"})}
          >
            Obstacles
          </button>
          <button
            id="algorithmButton"
            className="noselect"
            name="algorithm"
            onMouseEnter={e => titleButtonsEnter("algorithm")}
            onMouseLeave={e => titleButtonsLeave("algorithm")}
            onClick={e => stateDispatch({type: ActionType.SetActiveTitle, data: "algorithm"})}
          >
            Algorithm
          </button>
        </div>
        <div id="headerButtons">
          {
            state.activeTitle === "grid" && 
            <>
            <div
              id="boxSelect"
              className="svgDiv"
              onClick={e => setAppState({...appState, currTool: "boxSelect"})}
              onMouseEnter={e => svgDivEnter("boxSelect")}
              onMouseLeave={e => svgDivLeave("boxSelect")}
            >
              <BoxSelect baseFontSize={baseFontSize}/>
            </div>
            <div
              id="rowSelect"
              className="svgDiv"
              onClick={e => setAppState({...appState, currTool: "rowSelect"})}
              onMouseEnter={e => svgDivEnter("rowSelect")}
              onMouseLeave={e => svgDivLeave("rowSelect")}
            >
              <RowSelect baseFontSize={baseFontSize}/>
            </div>
            <div
              id="columnSelect"
              className="svgDiv"
              onClick={e => setAppState({...appState, currTool: "columnSelect"})}
              onMouseEnter={e => svgDivEnter("columnSelect")}
              onMouseLeave={e => svgDivLeave("columnSelect")}
            >
              <ColumnSelect baseFontSize={baseFontSize}/>
            </div>
            </>
          }
          {
            state.activeTitle === "obstacles" &&
            <>
            <div
              id="wall"
              className="svgDiv obstacleSVGDiv"
              onClick={e => setAppState({...appState, currTool: "wall"})}
              onMouseEnter={e => svgDivEnter("wall")}
              onMouseLeave={e => svgDivLeave("wall")}
            >
              <Wall baseFontSize={baseFontSize}/>
            </div>
            <div
              id="start"
              className="svgDiv obstacleSVGDiv"
              onClick={e => setAppState({...appState, currTool: "start"})}
              onMouseEnter={e => svgDivEnter("start")}
              onMouseLeave={e => svgDivLeave("start")}
            >
              <Flag baseFontSize={baseFontSize}/>
            </div>
            <div
              id="target"
              className="svgDiv obstacleSVGDiv"
              onClick={e => setAppState({...appState, currTool: "target"})}
              onMouseEnter={e => svgDivEnter("target")}
              onMouseLeave={e => svgDivLeave("target")}
            >
              <Target baseFontSize={baseFontSize}/>
            </div>
            <div id="actions">
              <button
                id="clear"
                className="algoTag noselect"
                style={{fontSize: .7*baseFontSize + "px"}}
                onClick={e => appState.isPlayingSim ? null : clearGrid(appState, setAppState)}
              >Clear</button>
              <button
                id="maze"
                className="algoTag noselect"
                style={{fontSize: .7*baseFontSize + "px"}}
                onClick={e => appState.isPlayingSim ? null : generateMaze(appState, setAppState)}
              >Maze</button>
            </div>
            </>
          }
          {
            state.activeTitle === "algorithm" &&
            <>
            <button
              id="dijkstra"
              className="algoTag noselect"
              style={{fontSize: .7*baseFontSize + "px"}}
              onClick={e => appState.isPlayingSim ? null : setAppState({...appState, currAlgo: "dijkstra"})}
            >Dijkstra</button>
            <button
              id="aStar"
              className="algoTag noselect"
              style={{fontSize: .7*baseFontSize + "px"}}
              onClick={e => appState.isPlayingSim ? null : setAppState({...appState, currAlgo: "aStar"})}
            >A*</button>
            <button
              id="depthFirst"
              className="algoTag noselect"
              style={{fontSize: .7*baseFontSize + "px"}}
              onClick={e => appState.isPlayingSim ? null : setAppState({...appState, currAlgo: "depthFirst"})}
            >depthFirst</button>
            </>
          }
        </div>
        {
          state.activeTitle === "algorithm" &&
          <div id="playerFrame">
            <div id="speedSlider">
              <div id="speedSliderTrack" >
                <div id="speedSliderTrackFill" />
                <div id="speedSliderHandle"
                  draggable={true}
                  onDrag={e => speedSliderDrag(e)}
                  onDragEnd={e => speedSliderRelease(e)}
                />
                <p id="speedSliderAnnotation" className="noselect"></p>
              </div>
            </div>
            <div id="playPause"
              onMouseEnter={e => playPauseEnter()}
              onMouseLeave={e => renderPlayPause()}
              onClick={e => playPauseClick()}
            >
              {appState.isPlayingSim ? 
                <Stop /> :
                <Play />
              }
            </div>
          </div>
        }
      </div>
    </div>
  )
};

export default Header;