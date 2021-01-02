import React from "react";

interface Props {
  style?: object;
}

const Stop: React.FC<Props> = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200mm"
      height="200mm"
      viewBox="0 0 200 200"
      version="1.1"
      id="pauseSVG"
      className="svg"
    >
      <g
        id="layer1"
        transform="translate(0,-97)"
      >
        <path
          style={{fill:"#ffffff",fillOpacity:1,stroke:"none",strokeWidth:56.69291306,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1,...props.style}}
          d="M 244.45703,52.839844 53.806641,243.10938 53.537109,512.45898 243.80664,703.10938 513.1582,703.37695 703.80664,513.10938 704.07617,243.75781 513.80664,53.109375 Z m 18.18359,43.435547 233.3086,0.404297 164.6914,165.261722 -0.40429,233.31054 L 494.97461,659.94141 261.66406,659.53711 96.974609,494.27539 97.378906,260.96484 Z"
          transform="matrix(0.26458333,0,0,0.26458333,0,97)"
          id="path4533"
          className="stopFill"
        />
        <path
          style={{opacity:1,fill:"#fffbff",fillOpacity:1,stroke:"none",strokeWidth:15,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1,...props.style}}
          id="path4586"
          className="stopFill"
          d="m 127.15544,262.01456 -53.830537,0.0117 -38.072198,-38.05567 -0.01168,-53.83054 38.055675,-38.07219 53.830534,-0.0117 38.0722,38.05568 0.0117,53.83053 z"
        />
      </g>
    </svg>
  );
}
export default Stop;