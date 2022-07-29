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

import { geoToH3, h3ToParent, h3ToCenterChild, kRing } from "h3-reactnative";
import Geolocation from 'react-native-geolocation-service';
import MapView, { enableLatestRenderer } from 'react-native-maps';

import StepIndicator from 'react-native-step-indicator';

import { deltaFromH3, mapRegionFromH3 } from '../h3Utils';
import Tile from '../components/Tile';

enableLatestRenderer();

const MAX_RESOLUTION = 6;

export default function () {
  const mapRef = useRef(null);
  const [locationAuthIos, setLoacationAuthIos] = useState('disabled');
  const [gettingPosition, setGettingPosition] = useState(true);
  const [userH3, setUserH3] = useState('');
  const [currentH3, setCurrentH3] = useState('');
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
          setUserH3(newh3);
          setCurrentH3(newh3);
          setGettingPosition(false);
          setResolution(MAX_RESOLUTION);
          mapRef.current.animateToRegion(mapRegionFromH3(newh3), 2000);
        },
        console.error,
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, [locationAuthIos]);

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
          onRegionChange={region => setCurrentH3(geoToH3(region.latitude, region.longitude, resolution))}
          onRegionChangeComplete={region => {
            [deltalat, deltalng] = deltaFromH3(currentH3);
            if (region.latitudeDelta >= (4.5 * deltalat) || region.longitudeDelta >= (4.5 * deltalng)) {
              setCurrentH3(h3ToParent(currentH3, resolution !== 0 ? resolution - 1 : resolution));
              setResolution(resolution !== 0 ? resolution - 1 : resolution);
            } else if (region.latitudeDelta <= (deltalat / 2) || region.longitudeDelta <= (deltalng / 2)) {
              setCurrentH3(h3ToCenterChild(currentH3, resolution !== MAX_RESOLUTION ? resolution + 1 : resolution));
              setResolution(resolution !== MAX_RESOLUTION ? resolution + 1 : resolution);
            }
          }}
        >
          {kRing(currentH3, 10).map(h3 => {
            if (h3 === h3ToParent(currentH3, resolution)) {
              return <Tile
                h3={h3}
                fillColor={isDarkMode ? "rgba(128,128,255,0.25)" : "rgba(0,0,128,0.25)"}
              />;
            } else {
              return <Tile
                h3={h3}
                fillColor={isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
              />;
            }
          })}
        </MapView>
        <View style={{ position: 'absolute', bottom: '5%', height: '50%' }}>
          <StepIndicator
            currentPosition={MAX_RESOLUTION - resolution}
            stepCount={MAX_RESOLUTION + 1}
            direction={'vertical'}
            onPress={position => {
              const newResolution = MAX_RESOLUTION - position;
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
