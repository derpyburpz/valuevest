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
import StockInfo from '../screens/stockinfo/index';
import AddTickerModal from '../components/molecules/addticker';
import AddPortfolioModal from '../components/molecules/addportfolio';
import Settings from '../components/molecules/settings';
import SearchStockModal from '../components/molecules/searchstock';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const [tickerModalVisible, setTickerModalVisible] = useState<boolean>(false);
  const [tickerStocks] = useState<any[]>([]);
  const [tickerSearchTerm, setTickerSearchTerm] = useState('');
  const [watchlistKey, setWatchlistKey] = useState(Math.random());
  
  const [portfolioModalVisible, setPortfolioModalVisible] = useState(false);
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState('');
  const [portfolioStocks] = useState<any[]>([]);
  const [portfolioKey, setPortfolioKey] = useState(Math.random());
  
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [searchStockModalVisible, setSearchStockModalVisible] = useState(false);

  const handleWatchlistClose = () => {
    setTickerModalVisible(false);
    setWatchlistKey(Math.random());   // Refresh watchlist on modal close
  }

  const handlePortfolioClose = () => {
    setPortfolioModalVisible(false);
    setPortfolioKey(Math.random());   // Refresh portfolio on modal close
  }

  const handleSettingsClose = () => {
    setSettingsVisible(false);
  }

  const handleSearchStockClose = () => {
    setSearchStockModalVisible(false);
  }

  const handleApply = () => {
  }

  const ApplySettings = () => {
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
      <Settings
        visible={settingsVisible}
        onClose={handleSettingsClose}
      />
      <SearchStockModal 
        visible={searchStockModalVisible}
        onClose={handleSearchStockClose}
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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="home-outline" size={27} color="#000" />
                <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 'bold' }}>Home</Text>
              </View>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setSearchStockModalVisible(true)}>
                  <Ionicons name="search" size={25} color="#000" style={{ marginRight: 15 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSettingsVisible(true)}>
                  <Ionicons name="cog-outline" size={25} color="#000" style={{ marginRight: 15 }} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tab.Screen 
          name="Watchlist" 
          children={()=><Watchlist key={watchlistKey} />}
          options={{ 
            tabBarLabel: 'Watchlist', 
            tabBarIcon: ({ color, size }) => (<Ionicons name="list-outline" size={size} color={color} />),
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="list-outline" size={27} color="#000" />
                <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 'bold' }}>My Watchlist</Text>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => setTickerModalVisible(true)}>
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
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="briefcase-outline" size={27} color="#000" />
                <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 'bold' }}>My Portfolio</Text>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => setPortfolioModalVisible(true)}>
                <Ionicons name="add" size={25} color="#000" style={{ marginRight: 15 }} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Tab.Screen 
          name="Valuator"
          component={Valuator} 
          options={{ 
            tabBarLabel: 'Valuator', 
            tabBarIcon: ({ color, size }) => (<Ionicons name="cash-outline" size={size} color={color} />),
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="cash-outline" size={27} color="#000" />
                <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 'bold' }}>Most Undervalued Companies</Text>
              </View>
            ), 
          }} 
        />
        <Tab.Screen
          name="News"
          component={News}
          options={{
            tabBarLabel: 'News',
            tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />,
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="newspaper-outline" size={27} color="#000" />
                <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 'bold' }}>Trending Market News</Text>
              </View>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setSearchStockModalVisible(true)}>
                  <Ionicons name="search" size={25} color="#000" style={{ marginRight: 15 }} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="StockInfo"
          component={StockInfo}
          options={({ navigation }) => ({
            tabBarButton: () => null,
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="stats-chart-outline" size={27} color="#000" />
                <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 'bold' }}>Stock Details</Text>
              </View>
            ),
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          })}
        />
      </Tab.Navigator>
    </>
  );
}

export default BottomTabs;

