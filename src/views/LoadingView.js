import React from "react";

import {
  Text,
  useColorScheme,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function LoadingView() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
      <ActivityIndicator size={'large'} />
    </View>
  );
}