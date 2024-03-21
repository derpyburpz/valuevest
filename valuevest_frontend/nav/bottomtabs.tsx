import React, { useState, useContext } from 'react';
import { Button, Text, Image, View, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from '../screens/home/index';
import Portfolio from '../screens/portfolio/index';
import News from '../screens/news/index';
import Watchlist from '../screens/watchlist/index';
import Valuator from '../screens/valuator/index';
import Profile from '../screens/profile/index';
import Login from '../screens/login/index';
import AddTickerModal from '../components/molecules/addticker';
import AddPortfolioModal from '../components/molecules/addportfolio';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const [tickerModalVisible, setTickerModalVisible] = useState<boolean>(false);
  const [portfolioModalVisible, setPortfolioModalVisible] = useState(false);
  const [tickerSearchTerm, setTickerSearchTerm] = useState('');
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState('');
  const [tickerStocks] = useState<any[]>([]);
  const [portfolioStocks] = useState<any[]>([]);
  const [watchlistKey, setWatchlistKey] = useState(Math.random());
  const [portfolioKey, setPortfolioKey] = useState(Math.random());

  const handleApply = () => {
  }

  const handleWatchlistClose = () => {
    setTickerModalVisible(false);
    setWatchlistKey(Math.random());   // Refresh watchlist on modal close
  }

  const handlePortfolioClose = () => {
    setPortfolioModalVisible(false);
    setPortfolioKey(Math.random());   // Refresh portfolio on modal close
  }

  return (
    <>
      <AddTickerModal 
        visible={tickerModalVisible}
        stocks={tickerStocks}
        searchTerm={tickerSearchTerm}
        onSearchTermChange={setTickerSearchTerm}
        onApply={handleApply} 
        onClose={handleWatchlistClose}
      />
      <AddPortfolioModal 
        visible={portfolioModalVisible}
        stocks={portfolioStocks}
        searchTerm={portfolioSearchTerm}
        onSearchTermChange={setPortfolioSearchTerm}
        onApply={handleApply} 
        onClose={handlePortfolioClose}
      />
      <Tab.Navigator
        screenOptions={{
        tabBarActiveTintColor: '#772F90',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={Home} 
          options={{ 
            tabBarLabel: 'Home', 
            tabBarIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />) 
          }} 
        />
      <Tab.Screen 
        name="Watchlist" 
        children={()=><Watchlist key={watchlistKey} />}
        options={{ 
          tabBarLabel: 'Watchlist', 
          tabBarIcon: ({ color, size }) => (<Ionicons name="list" size={size} color={color} />),
          headerRight: () => (
            <TouchableOpacity onPress={() => {
              setTickerModalVisible(true);
            }}>
              <Ionicons name="add" size={25} color="#000" style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ),
        }} 
      />
        <Tab.Screen 
          name="Portfolio" 
          children={()=><Portfolio key={portfolioKey} />} 
          options={{ 
            tabBarLabel: 'Portfolio', 
            tabBarIcon: ({ color, size }) => (<Ionicons name="briefcase-outline" size={size} color={color} />),
            headerRight: () => (
              <TouchableOpacity onPress={() => setPortfolioModalVisible(true)}>
                <Ionicons name="add" size={25} color="#000" style={{ marginRight: 15 }} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Tab.Screen 
          name="Top Stocks by Intrinsic Value"
          component={Valuator} 
          options={{ 
            tabBarLabel: 'Valuator', 
            tabBarIcon: ({ color, size }) => (<Ionicons name="cash-outline" size={size} color={color} />) 
          }} 
        />
        <Tab.Screen 
          name="News" 
          component={News} 
          options={{ 
            tabBarLabel: 'News', 
            tabBarIcon: ({ color, size }) => (<Ionicons name="newspaper" size={size} color={color} />) 
          }} 
        />
        <Tab.Screen 
					name="My Profile" 
					component={Profile} 
					options={{ 
							tabBarLabel: 'Profile', 
							tabBarIcon: ({ color, size }) => (<Ionicons name="person" size={size} color={color} />),
					}} 
					/>
      </Tab.Navigator>
    </>
  );
}

export default BottomTabs;
