import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import axios from 'axios';
import { RootStackParamList } from '../../nav/nav_stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'AppStack'>>();

  useEffect(() => {
    const checkRememberMe = async () => {
      const rememberMeValue = await AsyncStorage.getItem('rememberMe');
      if (rememberMeValue === 'true') {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedPassword = await AsyncStorage.getItem('password');
        if (storedUsername && storedPassword) {
          setUsername(storedUsername);
          setPassword(storedPassword);
          setRememberMe(true);
        }
      }
    };
    checkRememberMe();
  }, []);

  useEffect(() => {
    const checkKeepLoggedIn = async () => {
      const keepLoggedInValue = await AsyncStorage.getItem('keepLoggedIn');
      if (keepLoggedInValue === 'true') {
        setKeepLoggedIn(true);
        navigation.navigate('AppStack', { screen: 'Home' });
      }
    };
    checkKeepLoggedIn();
  }, []);

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
      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('password', password);
      } else {
        await AsyncStorage.removeItem('rememberMe');
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('password');
      }
      if (keepLoggedIn) {
        await AsyncStorage.setItem('keepLoggedIn', 'true');
      } else {
        await AsyncStorage.removeItem('keepLoggedIn');
      }
      navigation.navigate('AppStack', { screen: 'Home' });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to sign in. Please check your network connection and try again.');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('AuthStack', { screen: 'Signup' });
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
      <View style={LoginStyles.checkboxContainer}>
        <Checkbox
          status={rememberMe ? 'checked' : 'unchecked'}
          onPress={() => setRememberMe(!rememberMe)}
        />
        <Button onPress={() => setRememberMe(!rememberMe)}>Remember Me</Button>
      </View>
      <View style={LoginStyles.checkboxContainer}>
        <Checkbox
          status={keepLoggedIn ? 'checked' : 'unchecked'}
          onPress={() => setKeepLoggedIn(!keepLoggedIn)}
        />
        <Button onPress={() => setKeepLoggedIn(!keepLoggedIn)}>Keep Me Logged In</Button>
      </View>
      <Button mode="contained" onPress={handleSignIn} style={LoginStyles.button}>
        Sign In
      </Button>
      <Button mode="outlined" onPress={handleSignUp} style={LoginStyles.button}>
        Sign Up
      </Button>
    </View>
  );
}

Login.navigationOptions = {
  headerShown: false,
};

Login.options = {
  headerShown: false,
};

const LoginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});

export default Login;