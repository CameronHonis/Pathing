import React from "react"

interface Props {
  style?: object;
  baseFontSize?: number;
}

const ColumnSelect: React.FC<Props> = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200mm"
      height="200mm"
      viewBox="0 0 200 200"
      version="1.1"
      id="svg8"
      className="svg"
      style={{...props.style, ...(props.baseFontSize && {width: 1.8*props.baseFontSize, height: 1.8*props.baseFontSize})}}
    >
      <defs
        id="defs2" />
      <g
        transform="translate(0,-97)">
        <g
          id="g4701"
          transform="matrix(1.3446222,0,0,1.2898592,-31.488274,44.097666)"
          className="svgToolStroke svgToolFill"
        >
          <g>
            <rect
            className="svgToolStroke svgToolFill"
              style={{fill:"#ffffff",stroke:"none",strokeWidth:1.36500001,strokeLinecap:"butt",strokeLinejoin:"round", strokeMiterlimit:4, strokeDasharray:"none",strokeOpacity:1,paintOrder:"stroke fill markers",fillOpacity:1, ...props.style}}
              id="rect4661"
              width="52.916664"
              height="47.247025"
              x="71.059525"
              y="42.244045"
              ry="6.3311014" />
            <rect
            className="svgToolStroke svgToolFill"
              style={{fill:"#ffffff",stroke:"none",strokeWidth:1.36500001,strokeLinecap:"butt",strokeLinejoin:"round",strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1,paintOrder:"stroke fill markers",fillOpacity:1, ...props.style}}
              id="rect4661-0"
              width="52.916668"
              height="47.247025"
              x="71.095047"
              y="94.840439"
              ry="6.3311014" />
            <rect
            className="svgToolStroke svgToolFill"
              style={{fill:"#ffffff",stroke:"none",strokeWidth:1.36500001,strokeLinecap:"butt",strokeLinejoin:"round",strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1,paintOrder:"stroke fill markers",fillOpacity:1, ...props.style}}
              id="rect4661-0-9"
              width="52.916668"
              height="47.247025"
              x="71.173325"
              y="147.49254"
              ry="6.3311014" />
          </g>
        </g>
      </g>
    </svg>
  )
}

export default ColumnSelect;