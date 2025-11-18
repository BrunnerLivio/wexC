export { RadialController };

/**
 *
 * @param {import("./radialModel").RadialModelType} RadialModel
 */
const RadialController = (RadialModel) => {
  /**
   * @param {HTMLDivElement} $element
   */
  const render = ($element) => {
    // Render SVG circle control
    // const svgNS = "http://www.w3.org/2000/svg";
    // const svg = document.createElementNS(svgNS, "svg");
    // svg.setAttribute("width", "200");
    // svg.setAttribute("height", "200");
    // $element.appendChild(svg);

    // const circle = document.createElementNS(svgNS, "circle");
    // circle.setAttribute("cx", "100");
    // circle.setAttribute("cy", "100");
    // circle.setAttribute("r", RadialModel.radius.toString());
    // circle.setAttribute("stroke", RadialModel.color);
    // circle.setAttribute("stroke-width", "10");
    // circle.setAttribute("fill", "none");
    // svg.appendChild(circle);

    $element.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="225" height="393" viewBox="0 0 225 393" fill="none">
  <g filter="url(#filter0_dg_1330_139)">
    <circle cx="224.463" cy="195.866" r="120.439" transform="rotate(11.3768 224.463 195.866)" stroke="url(#paint0_linear_1330_139)" stroke-width="8"/>
  </g>
  <defs>
    <filter id="filter0_dg_1330_139" x="0" y="-28.5967" width="448.926" height="448.926" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset/>
      <feGaussianBlur stdDeviation="5"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.686275 0 0 0 0 1 0 0 0 0 0.00784314 0 0 0 1 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1330_139"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1330_139" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="2 2" numOctaves="3" seed="2237"/>
      <feDisplacementMap in="shape" scale="200" xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
      <feMerge result="effect2_texture_1330_139">
        <feMergeNode in="displacedImage"/>
      </feMerge>
    </filter>
    <linearGradient id="paint0_linear_1330_139" x1="100.024" y1="195.866" x2="348.901" y2="195.866" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F5FFE0"/>
      <stop offset="0.216346" stop-color="#ECFFC2"/>
      <stop offset="0.495192" stop-color="#E0FF9E"/>
      <stop offset="1" stop-color="#AFFF02"/>
    </linearGradient>
  </defs>
</svg>`;
  };

  return {
    render,
  };
};
