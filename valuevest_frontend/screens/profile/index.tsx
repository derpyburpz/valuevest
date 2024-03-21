// Placeholder needs work
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { API_BASE_URL, API_NEWS_KEY } from '@env';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScrollView } from 'react-native';
import axios from 'axios';
import * as Network from 'expo-network';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../nav/nav_stack';
import Container from './../../components/atoms/container';
import { containerStyle } from './../../components/styles/containerstyle';

const Profile = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [expoAddress, setExpoAddress] = useState('');

  const getExpoAddress = async () => {
    if (Constants.expoConfig) {
      const { hostUri } = Constants.expoConfig;
      setExpoAddress(hostUri || '');
    }
  };

  const handleSignOut = async () => {
    const refreshToken = await AsyncStorage.getItem('refresh');

    axios.post(`${API_BASE_URL}/api/token/logout/`, {
      refresh: refreshToken
    })
    .then(response => {
      if (response.status === 200) {
        console.log('Logged out successfully');
      }
    })
    .catch(error => {
      console.error(error);
    });
  
    await AsyncStorage.removeItem('access');
    await AsyncStorage.removeItem('refresh');
    navigation.navigate('AuthStack', { screen: 'Login' });
  };  
  
  return (
    <>
      <Container>
        <View>
          <Button mode="contained" onPress={getExpoAddress}>
            Get Expo Address
          </Button>
          {expoAddress ? <Text>Your Expo Address is: {expoAddress}</Text> : null}
        </View>
      </Container>

      <Container>
        <View style={containerStyle.iconContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="briefcase" size={24} color="black" style={containerStyle.icon}/>
            <Text style={containerStyle.containerTitle}>Portfolio Status</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Ionicons name="arrow-forward" size={24} color="black" style={containerStyle.iconRight}/>
          </TouchableOpacity>
        </View>
        <Text style={containerStyle.containerHeader}>Total Value of Assets:</Text>
        <Text style={containerStyle.containerTextBold}>US$2700$</Text>
        <Text style={containerStyle.containerHeader}>Daily Profit & Loss:</Text>
        <Text style={containerStyle.containerTextGreen}>+US$580/33.0%</Text>
      </Container>

      <Container>
        <Button mode="contained" onPress={handleSignOut}>
          Sign Out
        </Button>
      </Container>
    </>
  );
};

export default Profile;
