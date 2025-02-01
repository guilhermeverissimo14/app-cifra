import { faHeart, faHome, faMusic, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';


export default function TabLayout() {
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      // initialRouteName="index"
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        // tabBarButton: HapticTab,
        // tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      <Tabs.Screen
        name="favorite"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faHeart} color={color} />,
        }}
      />
  
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faHome} color={color} />,
        }}
      />
      <Tabs.Screen
        name="newMusic"
        options={{
          title: 'Nova musica',
          tabBarIcon: ({ color }) => <FontAwesomeIcon size={28} icon={faPlus} color={color} />,
        }}
      />

    </Tabs>
  );
}
