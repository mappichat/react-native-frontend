/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  useColorScheme,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import { geoToH3, h3ToParent, h3ToCenterChild, kRing, h3Distance, h3ToGeo } from "h3-reactnative";
import MapView, { enableLatestRenderer, Circle } from 'react-native-maps';

import StepIndicator from 'react-native-step-indicator';

import { deltaFromH3, mapRegionFromH3 } from '../h3Utils';
import Tile from '../components/Tile';
import Region from '../components/Region';

import { MAX_RESOLUTION, REGION_ENGINE_URL } from '@env';

enableLatestRenderer();

const colorMap = new Map();

export default function ({ startPosition }) {
  const mapRef = useRef(null);
  const [level, setLevel] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [lastUpdatePosition, setLastUpdatePosition] = useState(startPosition);
  const [currentPosition, setCurrentPosition] = useState(startPosition);
  const [regions, setRegions] = useState({});
  const [regionsJsx, setRegionsJsx] = useState([]);

  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (!fetching) {
      console.log(REGION_ENGINE_URL + '/regions')
      setFetching(true);
      fetch(REGION_ENGINE_URL + '/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: kRing(geoToH3(currentPosition.latitude, currentPosition.longitude, MAX_RESOLUTION), 15),
          levels: [0],
        }),
      })
      .then(res => res.json())
      .then(data => {
        setRegions(data);
        setLastUpdatePosition(currentPosition);
        setFetching(false);
      })
      .catch(console.error);
    }
  }, [h3Distance(
    geoToH3(currentPosition.latitude, currentPosition.longitude, MAX_RESOLUTION), 
    geoToH3(lastUpdatePosition.latitude, lastUpdatePosition.longitude, MAX_RESOLUTION),
  ) > 5]);

  useEffect(() => {
    let newJsx = [];
    for (const h in regions[level.toString()]) {
      let color;
      if (colorMap.has(`${level}-${h}`)) {
        color = colorMap.get(`${level}-${h}`);
      } else {
        color = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.33)`;
        colorMap.set(`${level}-${h}`, color);
      }
      newJsx.push(<Region key={h} tiles={regions[level.toString()][h]} fillColor={color} />);
    }
    setRegionsJsx(newJsx)
  }, [regions]);

  return (
    <View
      style={StyleSheet.absoluteFill}
    >
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        rotateEnabled={false}
        pitchEnabled={false}
        onRegionChange={region => setCurrentPosition({ latitude: region.latitude, longitude: region.longitude })}
        initialRegion={mapRegionFromH3(geoToH3(startPosition.latitude, startPosition.longitude, MAX_RESOLUTION))}
      >
        {regionsJsx}
      </MapView>
      {/* <View style={{ position: 'absolute', bottom: '5%', height: '50%' }}>
        <StepIndicator
          currentPosition={parseInt(MAX_RESOLUTION) - resolution}
          stepCount={parseInt(MAX_RESOLUTION) + 1}
          direction={'vertical'}
          onPress={position => {
            const newResolution = parseInt(MAX_RESOLUTION) - position;
            let newh3 = currentH3;
            if (newResolution < resolution) {
              newh3 = h3ToParent(currentH3, newResolution);
            } else if (newResolution > resolution) {
              newh3 = h3ToCenterChild(currentH3, newResolution);
            }
            mapRef.current.animateToRegion(mapRegionFromH3(newh3), 2000);
            setCurrentH3(newh3);
            setResolution(newResolution);
          }}
        />
      </View> */}
    </View>
  );
};
