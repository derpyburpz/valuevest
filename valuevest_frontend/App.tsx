import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import RootStack from './nav/nav';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#772F90',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <RootStack /> 
      </NavigationContainer>
    </PaperProvider>
  );
}