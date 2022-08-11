import React, { useEffect, useState } from "react";

import { h3SetToMultiPolygon } from "h3-reactnative";
import { Circle, Polygon } from 'react-native-maps';
import { h3ToGeo, h3ToGeoBoundary } from "h3-reactnative";

export default function Region({ tiles=[], fillColor='rgba(255,255,255,1.0)' }) {
  return tiles.map((h, index) => {
    const coords = h3ToGeoBoundary(h).map(pair => {
      return { latitude: pair[0], longitude: pair[1] };
    });
    return <Polygon key={index} coordinates={coords} fillColor={fillColor} radius={5000} strokeWidth={0.001} />;
  });

  // return h3SetToMultiPolygon(tiles, true)[0][0].map((pair, index) => {
  //   const coords =  { latitude: pair[0], longitude: pair[1] };
  //   console.log(coords);
  //   return <Circle key={index} center={coords} fillColor={fillColor} radius={2000} />;
  // });

  // return (
  //   <Polygon 
  //     coordinates={h3SetToMultiPolygon(tiles, true)[0][0].map(pair => {
  //       return { latitude: pair[0], longitude: pair[1] }
  //     })}
  //     fillColor={fillColor}
  //   />
  // );
}