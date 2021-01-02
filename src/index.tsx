import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { App } from "./App";

ReactDOM.render(
    <App />,
  document.getElementById("root")
);
/*
----INITIAL CONCEPT FRAMEWORK----
  Actions:
    -Add/remove path squares
    -Add/remove walls
    -Add/remove glue (weights) **depending on algorithms
    -Add/remove 
    -Change position of start point
    -Add endpoint(s)
    -Change position of endpoint(s)
    -Select algorithm (default djikstras)
    -Select sim speed
    -Play sim

  Grid Section:
    -visuals:
      -default grid size (prob based on screen height/width)
      -min/max square size in pixels (based on screen height/width)
      -animation for adding potential row/column should look to slide grid to make space first, then resize squares if cant slide
    -tools:
      -row select (hotkey R, assumed when adding square to top/bottom of already full row)
      -column select (hotkey C, assumed when adding square to left/right of already full column)
      -individual select (hotkey G, assumed in most cases except 2 above)
    -restrictions:
      -cant add square(s) if result would make grid squares larger/smaller than constraints
    actions:
      -add by row
      -add by column
      -add by square
      -remove row (removes non-adjacent row squares as well)
      -remove column (removes non-adjacent column squares as well) 
    
  Obstacles Section:
    -tools:
      -start flag positioner
      -wall tool
        -able to drag to effect multiple squares
        -if initial click added a square, drag can only add squares
        -if initial click removes a square, drag can only remove squares
        -walls can override all elements except start flag
      -glue tool
        -works similar to wall tool
      -target tool
        -works similar to wall tool EXCEPT no dragging
        -able to add multiple targets
      -




----ADDITIONAL PROJECT INFO----
  COMPONENT STRUCTURE:
    -reacty stuff
      -initial render useEffect func last
    -animation/display heavy functions
    -logic heavy functions
    -pre-render variables
    -return w/ jsx

  ALGORITHMS:
    -djikstra
    -a*
    -greedy best-first
    -swarm
    -convergent swarm
    -direct swarm
    -breath-first
    -depth-first

  TODOS:
    -in grid component, pass row, col ints instead of string
    -transfer some app context state values to a ref instead. to reduce number of rerenders
    -add keybinding for tools
    -consider adding "compacting" code for when editing the grid
    -consider adding general func to change SVG color




NOTES & TAKEAWAYS:
  -tagged all comps of SVGs with classNames to signify which attrs to modify when changing color
  -kept all useRef data in single object. This allows the REACT DEBUGGER to label all useRef variables
  -avoided in-line styling in jsx in Header comp. Either delegated styling to global css file or to animation funcs (which are typically fired by useEffects)
  -did styling calculations in Comp global space in Grid. jsx contains all static styling. useEffects contain animation styling only. Reduces number of comp renders
  -for Grid, could've went for a useEffect that compares active grid state to a "prevState" useRef obj to handle anims. Reduces amount of logic on evts
  -came across nasty glitch in Grid, some tiles were rerendering unneccessarily due to the "key" attr being set incorrectly
  -for future ref, separate logic code from anim code. mobile and desktop have different actions (such as no "mouseover" on mobile, etc.)
  -couldve added more layers than 2 to each tile. wouldve reduced amount of logic code required
  -started implementing "gsap.killTweensOf()" of an element if setting style instantly (without time duration on anim)
  -plan ahead for possible feature changes, especially w UI design. (ex. displaying list of items, consider design flexibility around possible size of list)
  -might be most optimal to store all data related to rendering local components inside refs, and keep all rendering code in one function.
      the current approach was to create seperate functions for each significant event, which scatters rendering code
  -consider creating custom ref setters that can execute pre-set side-effect functions (like renders) -- might be more efficient compared to states and useEffects
  -avoid using mouse enter/exit events; instead use singular mouse moved event and use lightweight logic (possibly on element states) to spawn
      heavier functions/animations
  -keep commonly rendered/interactive components rendered off page while not currently rendered instead of deleting entirely in JSX
     (allows for smooth transitions, etc.)
  
*/