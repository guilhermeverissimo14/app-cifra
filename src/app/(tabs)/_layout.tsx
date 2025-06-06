import { faHeart, faHome, faMusic, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';


export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#8e99cc",
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#21284a',
          },
          default: {
            backgroundColor: '#21284a',
            height: 70,
            justifyContent: 'center',
            alignItems: 'center',
          },
        }),
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 10,
          borderTopColor: '#101323',
          borderTopWidth: 1,
        }
      }}>

      <Tabs.Screen
        name="favorite"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon size={28} icon={faHeart} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon size={28} icon={faHome} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="newMusic"
        options={{
          title: 'Nova musica',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon size={28} icon={faPlus} color={color} />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}