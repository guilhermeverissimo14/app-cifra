import * as Sentry from '@sentry/react-native';

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from "expo-sqlite";
import { initializeDatabase } from '../database/db';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



Sentry.init({
  dsn: 'https://535dee0d4209b57a4052d1a447a33a49@o4509114957627392.ingest.us.sentry.io/4509115150499840',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName='sifra.db' onInit={initializeDatabase}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="listMusic/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <StatusBar style="auto" />
        </Stack>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout)