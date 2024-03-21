import React, { useState, useEffect } from 'react';
import { Alert, Text, View, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { containerStyle } from './../styles/containerstyle';
import Container from '../atoms/container';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../nav/nav_stack';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { Stock } from './../../types';

const PortfolioValue = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [portfolio, setPortfolio] = useState({ totalValue: 0, dailyPnL: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolioValue = async () => {
    setRefreshing(true);
    const user_id = await AsyncStorage.getItem('user_id');
    const access = await AsyncStorage.getItem('access');
    
    try {
      const valueResponse = await axios.get(`${API_BASE_URL}/stocks/get_portfolio_value/?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      setPortfolio(prevState => ({ ...prevState, totalValue: valueResponse.data.portfolio_value }));
    
      console.log('Fetched portfolio value: ', valueResponse.data.portfolio_value);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch portfolio value. Please check your network connection and try again.');
    }
    setRefreshing(false);
  };

  const fetchPortfolioPnL = async () => {
    const user_id = await AsyncStorage.getItem('user_id');
    const access = await AsyncStorage.getItem('access');
    
    try {
      const pnlResponse = await axios.get(`${API_BASE_URL}/stocks/get_portfolio_pnl/?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      setPortfolio(prevState => ({ ...prevState, dailyPnL: pnlResponse.data.total_pnl }));
    
      console.log('Fetched daily PnL: ', pnlResponse.data.total_pnl);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch daily PnL. Please check your network connection and try again.');
    }
  };

  useEffect(() => {
    fetchPortfolioValue();
    fetchPortfolioPnL();
  }, []);

  return (
    <View>
      <View style={containerStyle.iconContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="briefcase" size={24} color="black" style={containerStyle.icon}/>
          <Text style={containerStyle.containerTitle}>Portfolio Status</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
          <Ionicons name="arrow-forward" size={24} color="black" style={containerStyle.iconRight}/>
        </TouchableOpacity>
      </View>
      <View>
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={() => {
            fetchPortfolioValue();
            fetchPortfolioPnL();
          }} 
        />
        <Text style={containerStyle.containerHeader}>Total Value of Assets:</Text>
        <Text style={containerStyle.containerTextBold}>{`$${portfolio.totalValue.toFixed(2)}`}</Text>

        <Text style={containerStyle.containerHeader}>Daily Profit & Loss:</Text>
        <Text style={portfolio.dailyPnL < 0 ? containerStyle.containerTextRed : containerStyle.containerTextGreen}>
          {`$${portfolio.dailyPnL.toFixed(2)}`}
        </Text>

      </View>
    </View>
  );
}

export default PortfolioValue;
