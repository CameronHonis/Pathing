import React from "react";

interface Props {
  style?: {};
}

const Play = (props: Props) => {
  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="210mm"
      height="210mm"
      viewBox="0 0 210 210"
      version="1.1"
      id="playSVG"
      className="svg"
    >
      <g
        id="layer1"
        transform="translate(0,-87)">
        <path
          style={{fill:"rgb(40, 150, 60)",stroke:"none",strokeWidth:"0.26458332px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1,fillOpacity:1,...props.style}}
          d="m 23.252448,106.43683 c 0,0 0.108001,-8.481569 7.617182,-4.40995 52.710323,28.58057 106.09463,56.20336 159.1634,84.26448 6.16012,3.25728 -0.004,6.7408 -0.004,6.7408 L 28.956981,279.06788 c 0,0 -5.125092,2.82778 -5.07812,-2.90655 0.463419,-56.57332 -0.626413,-169.7245 -0.626413,-169.7245 z"
          id="path823"
          className="playFill"
        />
      </g>
    </svg>
  )
}

export default Play;