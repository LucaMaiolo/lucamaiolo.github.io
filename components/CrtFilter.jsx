// SVG displacement filter that bends the whole page like a curved CRT tube.
// The runtime fills in the displacement map once it knows the window size.
export default function CrtFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="crtf" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB" x="0" y="0" width="1440" height="900">
        <feImage id="crtmap" x="0" y="0" width="1440" height="900" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
