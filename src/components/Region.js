import React from "react";

import { h3SetToMultiPolygon } from "h3-reactnative";
import { Geojson } from 'react-native-maps';

export default function Region({ tiles=[], title='', fillColor='rgba(255,255,255,1.0)' }) {
  return <Geojson 
    geojson={{
      type: "FeatureCollection",
      features: [{
          "type": "Feature",
          geometry: {
              "type": "MultiPolygon",
              "coordinates": h3SetToMultiPolygon(tiles, true)
          }
      }]
    }}
    fillColor={fillColor}
    title={title}
  />;
}