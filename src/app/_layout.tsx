import * as Sentry from '@sentry/react-native';

import React, {useEffect, useState}from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { initializeDatabase } from '../database/db';

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://535dee0d4209b57a4052d1a447a33a49@o4509114957627392.ingest.us.sentry.io/4509115150499840',
});

function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'SplineSans-Regular': require('../../assets/fonts/SplineSans-Regular.ttf'),
          'SplineSans-Medium': require('../../assets/fonts/SplineSans-Medium.ttf'),
          'SplineSans-SemiBold': require('../../assets/fonts/SplineSans-SemiBold.ttf'),
          'SplineSans-Bold': require('../../assets/fonts/SplineSans-Bold.ttf'),
        });
      } catch (e) {
        console.warn('Erro ao carregar fontes:', e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <SQLiteProvider databaseName='sifra.db' onInit={initializeDatabase}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="listMusic/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <StatusBar style="dark" />
        </Stack>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout)