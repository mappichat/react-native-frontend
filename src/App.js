/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  useColorScheme,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import { geoToH3, h3ToGeo, h3ToGeoBoundary } from "h3-reactnative";
import Geolocation from 'react-native-geolocation-service';
import MapView, { enableLatestRenderer, Marker, Polygon } from 'react-native-maps';

import { deltaFromBoundary } from './h3Utils';

enableLatestRenderer();

const MAX_RESOLUTION = 7;

function App() {
  const [region, setRegion] = useState({});
  const [locationAuthIos, setLoacationAuthIos] = useState('disabled');
  const [gettingPosition, setGettingPosition] = useState(false);
  
  const [position, setPosition] = useState([0, 0]);
  const [centroid, setCentroid] = useState([0, 0]);
  const [tile, setTile] = useState('');
  const [tileBoundary, setTileBoundary] = useState([]);

  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (locationAuthIos !== 'granted') {
      Geolocation.requestAuthorization('whenInUse')
        .then(setLoacationAuthIos);
    } else {
      setGettingPosition(true);
      Geolocation.getCurrentPosition(
        position => {
          const [lat, lng] = [position.coords.latitude, position.coords.longitude];
          setPosition([lat, lng]);
          const h3 = geoToH3(lat, lng, MAX_RESOLUTION);
          setTile(h3);
          const [h3lat, h3lng] = h3ToGeo(h3);
          setCentroid([h3lat, h3lng]);
          const boundary = h3ToGeoBoundary(h3)
          setTileBoundary(boundary);

          const [latDelta, lngDelta] = deltaFromBoundary(boundary)
          setRegion({
            latitude: h3lat,
            longitude: h3lng,
            latitudeDelta: latDelta * 1.2,
            longitudeDelta: lngDelta * 1.2,
          });
          setGettingPosition(false);
        },
        console.error,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, [locationAuthIos]);

  if (locationAuthIos !== 'granted') {
    return (
      <SafeAreaView style={{ ...StyleSheet.absoluteFill, backgroundColor: isDarkMode ? Colors.dark : Colors.light }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 24, color: isDarkMode ? Colors.light : Colors.dark }}>Location services not authorized</Text>
        </View>
      </SafeAreaView>
    );
  } else if (gettingPosition) {
    return (
      <SafeAreaView style={{ ...StyleSheet.absoluteFill, backgroundColor: isDarkMode ? Colors.dark : Colors.light }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ fontSize: 24, color: isDarkMode ? Colors.light : Colors.dark }}>Getting location</Text>
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={{ ...StyleSheet.absoluteFill, backgroundColor: isDarkMode ? Colors.dark : Colors.light }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          onRegionChange={setRegion}
        >
          <Marker 
            coordinate={{ latitude: position[0], longitude: position[1] }}
            pinColor="red"
          />
          <Marker 
            coordinate={{ latitude: centroid[0], longitude: centroid[1] }}
            pinColor="blue"
          />
          <Polygon 
            coordinates={tileBoundary.map(coords => {
              return { latitude: coords[0], longitude: coords[1] };
            })}
            fillColor="rgba(256,0,0,0.5)"
          />
        </MapView>
      </SafeAreaView>
    );
  }
};

export default App;
