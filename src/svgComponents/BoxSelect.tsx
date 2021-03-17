import React from "react";

interface Props {
  style?: object;
  baseFontSize?: number;
}

const BoxSelect: React.FC<Props> = props => {
  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="svg8"
      version="1.1"
      viewBox="0 0 200 200"
      height="200mm"
      width="200mm"
      className="svg"
      style={{...props.style, ...(props.baseFontSize && {width: 1.8*props.baseFontSize, height: 1.8*props.baseFontSize})}}
      >  
      <g
        id="layer1"
        transform="matrix(1.4459948,0,0,1.7686875,-42.229611,-21.679505)"
        className="svgToolStroke svgToolFill"
      >
        <g
          className="svgToolStroke svgToolFill"
          transform="translate(-2.6458333,-122.46429)"
          id="g4614">
          <rect
            className="svgToolStroke svgToolFill"
            style={{fill:"#ffffff",fillOpacity:1,stroke:"#ffffe8",strokeWidth:0.84115189,strokeLinecap:"butt",strokeLinejoin:"round",strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1,paintOrder:"stroke fill markers", ...props.style}}
            id="rect6518"
            width="87.727707"
            height="72.002846"
            x="56.553722"
            y="154.73047"
            ry="12" />
        </g>
      </g>
    </svg>
  );
}

export default BoxSelect;