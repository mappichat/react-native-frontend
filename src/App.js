/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
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

import MapView from './views/MapView';
import LoadingView from './views/LoadingView';

import { API_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } from '@env'
import jwtDecode from 'jwt-decode';

const auth0 = new Auth0({ domain: AUTH0_DOMAIN, clientId: AUTH0_CLIENT_ID });

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [accessToken, setAccessToken] = useState('');

  if (accessToken == '') {
    auth0.webAuth.authorize({scope: 'openid profile email', audience: AUTH0_AUDIENCE})
    .then(credentials => setAccessToken(credentials.accessToken))
    .catch(error => console.log(error));
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
          <MapView />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
};

export default App;
