import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import { RootStackParamList } from '../../nav/nav_stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_BASE_URL } from './../../config';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'AuthStack'>>();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/users/signup/`, {
        username: username,
        password: password,
      });
      console.log(response.data);
      Alert.alert('Success', 'Registration successful. Please log in.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AuthStack', { screen: 'Login' }),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to sign up. Please check your network connection and try again.');
    }
  };

  return (
    <View style={SignupStyles.container}>
      <TextInput
        label="Username"
        value={username}
        onChangeText={(text: string) => setUsername(text)}
        style={SignupStyles.input}
        mode="outlined"
        placeholder="Username"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text: string) => setPassword(text)}
        style={SignupStyles.input}
        secureTextEntry
        mode="outlined"
        placeholder="Password"
      />
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text: string) => setConfirmPassword(text)}
        style={SignupStyles.input}
        secureTextEntry
        mode="outlined"
        placeholder="Confirm Password"
      />
      <Button mode="contained" onPress={handleSignUp} style={SignupStyles.button}>
        Sign Up
      </Button>
    </View>
  );
}

Signup.navigationOptions = {
  headerShown: false,
};

Signup.options = {
  headerShown: false,
};

const SignupStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
});

export default Signup;