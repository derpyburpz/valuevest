import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../nav/nav_stack';

type AuthSplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AuthSplash'
>;

type Props = {
  navigation: AuthSplashScreenNavigationProp;
};

function AuthSplash({ navigation }: Props) {
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const userToken = await AsyncStorage.getItem('access');
    if (userToken) {
			navigation.navigate('AppStack', { screen: 'Home' });
    } else {
      navigation.navigate('AuthStack', { screen: 'Login' });
    }
  };

  return (
    <View>
      <ActivityIndicator />
    </View>
  );
}

export default AuthSplash;
