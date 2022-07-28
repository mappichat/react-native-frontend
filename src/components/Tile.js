import React, { useEffect, useState } from "react";

import { geoToH3, h3ToGeo, h3ToGeoBoundary } from "h3-reactnative";
import { Polygon } from 'react-native-maps';

export default function Tile({ h3, fillColor='rgba(0,0,0,0.15)' }) {
  const [coords, setCoords] = useState([]);

  useEffect(() => {
    setCoords(h3ToGeoBoundary(h3).map(pair => {
      return { latitude: pair[0], longitude: pair[1] };
    }));
  }, [h3]);

  return (
    <Polygon 
      coordinates={coords}
      fillColor={fillColor}
    />
  );
}