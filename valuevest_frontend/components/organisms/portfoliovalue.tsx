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

const PortfolioValue = ({ showAll = false }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [portfolio, setPortfolio] = useState({ totalValue: 0, dailyPnL: 0, overallPerformance: 0, total_cost_basis: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolioStatus = async () => {
    setRefreshing(true);
    const user_id = await AsyncStorage.getItem('user_id');
    const access = await AsyncStorage.getItem('access');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/stocks/get_portfolio_status/?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${access}` }
      });
  
      setPortfolio(prevState => ({
        ...prevState,
        totalValue: response.data.portfolio_value,
        dailyPnL: response.data.total_pnl,
        total_cost_basis: response.data.total_cost_basis,
        overallPerformance: response.data.overall_performance
      }));
  
      console.log('Fetched portfolio data: ', response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch portfolio data. Please check your network connection and try again.');
    }
  
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchPortfolioStatus();
  }, []);

  return (
    <View>
      <View style={containerStyle.iconContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="briefcase" size={24} color="black" style={containerStyle.icon} />
          <Text style={containerStyle.containerTitle}>Portfolio Status</Text>
        </View>
        <View style={{ flex: 1 }} />
        {!showAll && (
          <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
            <Ionicons name="arrow-forward" size={24} color="black" style={containerStyle.iconRight} />
          </TouchableOpacity>
        )}
      </View>
      <View>
        <RefreshControl refreshing={refreshing} onRefresh={() => { fetchPortfolioStatus }} />
        <Text style={containerStyle.containerHeader}>Total Value of Assets:</Text>
        <Text style={containerStyle.containerTextBold}>{`$${portfolio.totalValue.toFixed(2)}`}</Text>
        <Text style={containerStyle.containerHeader}>Daily Profit & Loss:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginLeft: 5 }}>
            <Text style={[
              parseFloat(portfolio.dailyPnL.toFixed(2)) === 0 ? containerStyle.containerTextBlack :
              parseFloat(portfolio.dailyPnL.toFixed(2)) < 0 ? containerStyle.containerTextRed : containerStyle.containerTextGreen
            ]}>
              {parseFloat(portfolio.dailyPnL.toFixed(2)) === 0 ? `$${Math.abs(parseFloat(portfolio.dailyPnL.toFixed(2)))}` : `$${portfolio.dailyPnL.toFixed(2)}`}
            </Text>
          </View>
        </View>

        {showAll && (
          <Text style={containerStyle.containerHeader}>Original Total Asset Value:</Text>
        )}
        <View style={{ marginLeft: 5 }}>
          {showAll && (
            <Text style={containerStyle.containerTextBlack}>{`$${portfolio.total_cost_basis.toFixed(2)}`}</Text>
          )}
        </View>
        {showAll && (
          <Text style={containerStyle.containerHeader}>Overall Profit & Loss:</Text>
        )}
        {showAll && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginLeft: 5 }}>
              <Text style={[
                parseFloat(portfolio.overallPerformance.toFixed(2)) === 0 ? containerStyle.containerTextBlack :
                parseFloat(portfolio.overallPerformance.toFixed(2)) < 0 ? containerStyle.containerTextRed : containerStyle.containerTextGreen
              ]}>
                {parseFloat(portfolio.overallPerformance.toFixed(2)) === 0 ? `$${Math.abs(parseFloat(portfolio.overallPerformance.toFixed(2)))}` : `$${portfolio.overallPerformance.toFixed(2)}`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default PortfolioValue;
