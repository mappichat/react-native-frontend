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
const reloadDistances = [35, 35, 35, 35, 35, 35];
const fetchRadii = [56, 56, 56, 56, 56, 56];

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
          tiles: kRing(geoToH3(currentPosition.latitude, currentPosition.longitude, MAX_RESOLUTION), fetchRadii[level]),
          levels: [level],
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
  ) > reloadDistances[level], level]);

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
      <View style={{ position: 'absolute', bottom: '5%', height: '50%' }}>
        <StepIndicator
          currentPosition={level}
          stepCount={parseInt(MAX_RESOLUTION)}
          direction={'vertical'}
          onPress={setLevel}
        />
      </View>
    </View>
  );
};
