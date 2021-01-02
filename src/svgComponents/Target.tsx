import React from "react";

interface Props {
  style?: object;
}

const Target: React.FC<Props> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="210mm"
      height="210mm"
      viewBox="0 0 210 210"
      version="1.1"
      id="svg8"
      className="svg"
      style={props.style}
      >
      <g
        id="layer1"
        transform="translate(0,-87)">
        <g
          id="g4561"
          transform="rotate(-90,106.7493,194.40718)">
          <ellipse // second ring
            cx="105.03693"
            cy="192.36398"
            rx="80.715393"
            ry="81.650833"
            style={{fillOpacity:1,stroke:"#ffffff",strokeWidth:15,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1, ...props.style, fill: "none"}}
            className="svgToolStroke"
            id="path3717" />
          <path // first ring
            d="m 156.88613,191.48856 a 51.583012,52.785732 0 0 1 -51.24312,53.12547 51.583012,52.785732 0 0 1 -51.920679,-52.43204 51.583012,52.785732 0 0 1 51.231629,-53.13707 51.583012,52.785732 0 0 1 51.93202,52.42028"
            id="path4530"
            className="svgToolStroke"
            style={{fillOpacity:1,stroke:"#ffffff",strokeWidth:15,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1, ...props.style, fill: "none"}} />
          <path // inner circle
            d="m 125.34898,192.10263 a 20.312481,19.777943 0 0 1 -20.15211,19.90505 20.312481,19.777943 0 0 1 -20.471548,-19.59359 20.312481,19.777943 0 0 1 20.094128,-19.96055 20.312481,19.777943 0 0 1 20.52846,19.53704"
            id="path4536"
            className="svgToolStroke svgToolFill"
            style={{fill:"#ffffff",fillOpacity:1,stroke:"none",strokeWidth:15,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1, ...props.style}} />
          <path //dart body
            id="path4549"
            className="svgToolStroke svgToolFill"
            d="m 122.40944,212.54283 -3.06346,3.47578 -0.85045,4.6302 0.94494,3.77976 48.27116,43.97359 9.6217,-8.95353 -40.22406,-49.57849 -4.00905,-1.06908 -4.00904,0.26727 -3.20723,0.80181 z"
            style={{fill:"#ffffff",fillOpacity:1,stroke:"none",strokeWidth:"0.26458332px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1, ...props.style}} />
          <path // dart tip
            id="path4551"
            d="m 103.96784,193.03216 17.03179,21.35642 3.47265,-3.30729 -18.96763,-19.11821 z"
            className="svgToolStroke svgToolFill"
            style={{fill:"#ffffff",fillOpacity:1,stroke:"none",strokeWidth:"0.26458332px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1, ...props.style}} />
          <path // dart fins
            id="path4553"
            className="svgToolStroke svgToolFill"
            d="m 167.71163,268.40217 7.29134,26.32999 6.04761,-16.63096 14.5521,8.88244 -8.69346,-12.28422 18.14285,-5.66964 -27.71875,-9.58114 z"
            style={{fill:"#ffffff",fillOpacity:1,stroke:"none",strokeWidth:"0.26458332px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1, ...props.style}} />
        </g>
      </g>
    </svg>
  );
}

export default Target;