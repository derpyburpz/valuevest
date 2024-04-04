import React, { useState } from 'react';
import { Button, Text, Image, View, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from './nav_stack';
import { Ionicons } from '@expo/vector-icons';
import Home from './../screens/home/index';
import Portfolio from './../screens/portfolio/index';
import News from './../screens/news/index';
import Watchlist from './../screens/watchlist/index';
import Profile from './../screens/profile/index';
import Login from './../screens/login/index';
import Signup from './../screens/signup/index';
import AuthSplash from './../screens/authsplash/index';
import BottomTabs from './bottomtabs';
import AddTickerModal from './../components/molecules/addticker';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Login" 
      component={Login} 
      options={{ title: 'Login' }}
    />
    <Stack.Screen 
      name="Signup" 
      component={Signup} 
      options={{ title: 'Registration' }}
    />
  </Stack.Navigator>
);

const AppStack = () => (
  <BottomTabs />
);

const RootStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AuthSplash" 
        component={AuthSplash} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AppStack" 
        component={AppStack} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AuthStack" 
        component={AuthStack} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
