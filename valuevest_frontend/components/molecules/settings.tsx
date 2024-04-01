import React from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Button, Headline, Portal, Provider, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../nav/nav_stack';
import { API_BASE_URL } from '../../config';
import { settingsStyles } from '../styles/settingsStyle';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSignOut = async () => {
    const refreshToken = await AsyncStorage.getItem('refresh');
    axios
      .post(`${API_BASE_URL}/api/token/logout/`, { refresh: refreshToken })
      .then((response) => {
        if (response.status === 200) {
          console.log('Logged out successfully');
        }
      })
      .catch((error) => {
        console.error(error);
      });

    await AsyncStorage.removeItem('access');
    await AsyncStorage.removeItem('refresh');
    navigation.navigate('AuthStack', { screen: 'Login' });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={settingsStyles.container}>
        <View style={settingsStyles.header}>
          <Headline style={settingsStyles.title}>Settings</Headline>
          <IconButton icon="close" onPress={onClose} style={settingsStyles.closeButton} />
        </View>
        <ScrollView contentContainerStyle={settingsStyles.content}>
          <View style={settingsStyles.settingsSection}>
            <Headline style={settingsStyles.sectionTitle}>General</Headline>
          </View>
          <View style={settingsStyles.settingsSection}>
            <Headline style={settingsStyles.sectionTitle}>Notifications</Headline>
          </View>
        </ScrollView>
        <Button mode="contained" onPress={handleSignOut} style={settingsStyles.button}>
          Sign Out
        </Button>
      </View>
    </Modal>
  );
};

export default Settings;