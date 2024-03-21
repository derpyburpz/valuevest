import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import { RootStackParamList } from '../../nav/nav_stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'AppStack'>>();

  const handleSignIn = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login/`, {
        username: username,
        password: password,
      });
      console.log(response.data);
      await AsyncStorage.setItem('access', response.data.access);
      await AsyncStorage.setItem('refresh', response.data.refresh);
      await AsyncStorage.setItem('user_id', response.data.user_id.toString());
      navigation.navigate('AppStack', { screen: 'Home' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to sign in. Please check your network connection and try again.');
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/signup/`, {
        username: username,
        password: password,
      });
      console.log(response.data);
      await AsyncStorage.setItem('access', response.data.access);
      await AsyncStorage.setItem('refresh', response.data.refresh);
      await AsyncStorage.setItem('user_id', response.data.user_id.toString());
      navigation.navigate('AuthStack', { screen: 'Login' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to sign up. Please check your network connection and try again.');
    }
  };

  return (
    <View style={LoginStyles.container}>
      <TextInput
        label="Username"
        value={username}
        onChangeText={(text: string) => setUsername(text)}
        style={LoginStyles.input}
        mode="outlined"
        placeholder="Username"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text: string) => setPassword(text)}
        style={LoginStyles.input}
        secureTextEntry
        mode="outlined"
        placeholder="Password"
      />
      <Button mode="contained" onPress={handleSignIn} style={LoginStyles.button}>
        Sign In
      </Button>
      <Button mode="outlined" onPress={handleSignUp} style={LoginStyles.button}>
        Sign Up
      </Button>
    </View>
  );
}

const LoginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});

export default Login;
