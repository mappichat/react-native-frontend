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

import { geoToH3, h3ToParent } from "h3-reactnative";
import Geolocation from 'react-native-geolocation-service';
import MapView, { enableLatestRenderer } from 'react-native-maps';

import StepIndicator from 'react-native-step-indicator';

import { mapRegionFromH3 } from '../h3Utils';
import Tile from '../components/Tile';

enableLatestRenderer();

const MAX_RESOLUTION = 7;

export default function() {
  const mapRef = useRef(null);
  const [locationAuthIos, setLoacationAuthIos] = useState('disabled');
  const [gettingPosition, setGettingPosition] = useState(true);
  const [h3, setH3] = useState('');
  const [resolution, setResolution] = useState(0);

  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (locationAuthIos !== 'granted') {
      Geolocation.requestAuthorization('whenInUse')
        .then(setLoacationAuthIos);
    } else {
      setGettingPosition(true);
      Geolocation.getCurrentPosition(
        position => {
          const newh3 = geoToH3(position.coords.latitude, position.coords.longitude, MAX_RESOLUTION);
          setH3(newh3);
          setGettingPosition(false);
          setResolution(MAX_RESOLUTION);
        },
        console.error,
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, [locationAuthIos]);

  useEffect(() => {
    if (h3) {
      const region = mapRegionFromH3(h3ToParent(h3, resolution));
      mapRef.current.animateToRegion(region, 2000);
    }
  }, [resolution]);

  if (locationAuthIos !== 'granted') {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 24, color: isDarkMode ? Colors.light : Colors.dark }}>Location services not authorized</Text>
      </View>
    );
  } else {
    return (
      <View
        style={StyleSheet.absoluteFill}
      >
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
        >
          <Tile
            h3={h3ToParent(h3, resolution)}
            fillColor="rgba(0,0,0,0.15)"
          />
        </MapView>
        <View style={{ position: 'absolute', bottom: '5%', height: '50%' }}>
          <StepIndicator
            currentPosition={MAX_RESOLUTION - resolution}
            stepCount={MAX_RESOLUTION + 1}
            direction={'vertical'}
            onPress={position => setResolution(MAX_RESOLUTION - position)}
          />
        </View>
        {
          gettingPosition ?
            <View style={{ position: 'absolute', top: '50%', bottom: '50%', right: '25%', left: '25%', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" />
              <Text style={{ fontSize: 24, color: isDarkMode ? Colors.lighter : Colors.darker }}>Getting location</Text>
            </View> : <></>
        }
      </View>
    );
  }
};
