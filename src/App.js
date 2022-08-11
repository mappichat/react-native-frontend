/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import Auth0 from 'react-native-auth0';
import decode from 'jwt-decode';
import Geolocation from 'react-native-geolocation-service';

import MapView from './views/MapView';
import LoadingView from './views/LoadingView';

import { API_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } from '@env'

const auth0 = new Auth0({ domain: AUTH0_DOMAIN, clientId: AUTH0_CLIENT_ID });

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [accessToken, setAccessToken] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [locationAuthIos, setLoacationAuthIos] = useState('disabled');

  useEffect(() => {
    if (locationAuthIos !== 'granted') {
      Geolocation.requestAuthorization('whenInUse')
        .then(setLoacationAuthIos);
    } else {
      Geolocation.getCurrentPosition(
        position => {
          setUserPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        console.error,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, [locationAuthIos]);

  useEffect(() => {
    auth0.webAuth.authorize({scope: 'openid profile email', audience: AUTH0_AUDIENCE})
    .then(credentials => setAccessToken(credentials.accessToken))
    .catch(console.error);
  }, []);

  if (accessToken == '' || locationAuthIos !== 'granted' || !userPosition) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ ...StyleSheet.absoluteFill, backgroundColor: isDarkMode ? Colors.dark : Colors.light }}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <LoadingView />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  } else {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ ...StyleSheet.absoluteFill, backgroundColor: isDarkMode ? Colors.dark : Colors.light }}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <MapView startPosition={userPosition} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
};

export default App;
