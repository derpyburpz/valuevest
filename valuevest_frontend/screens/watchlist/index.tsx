import React, { useEffect, useState, useRef } from 'react';
import { Alert, Text, View, TouchableOpacity, RefreshControl, ScrollView, Image } from 'react-native';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { DataTable } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SwipeListView } from 'react-native-swipe-list-view';
import { RootStackParamList } from './../../nav/nav_stack';
import BottomTabs from './../../nav/bottomtabs';
import { Stock } from './../../types';
import Container from './../../components/atoms/container';
import RefreshWatchlistContext from './../../components/contexts/refreshWatchlist';

const Watchlist = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const swipeListViewRef = useRef<SwipeListView<any> | null>(null);
  const rowRefsMap = useRef<Record<string, any>>({});

  const fetchWatchlist = async () => {
    setRefreshing(true);
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const access = await AsyncStorage.getItem('access');
      const response = await axios.get(`${API_BASE_URL}/stocks/get_watchlist/?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      setStocks(response.data.map((stock: any) => ({
        key: stock.exchange_ticker,
        company_name: stock.company_name,
        exchange_ticker: stock.exchange_ticker,
        price: stock.price
      })));
    } catch (error) {
      console.error(error);
      
    }
    setRefreshing(false);
  };

  const removeStock = async (exchange_ticker: string) => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const access = await AsyncStorage.getItem('access');
      const response = await axios.request({
        method: 'delete',
        url: `${API_BASE_URL}/stocks/remove_from_watchlist/`,
        headers: { Authorization: `Bearer ${access}` },
        data: { user_id: user_id, exchange_ticker: exchange_ticker }
      });
  
      console.log(response.data);
      fetchWatchlist(); // Refresh watchlist
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to remove stock. Please check your network connection and try again.');
    }
  };
  
  useEffect(() => {
    fetchWatchlist();
  }, []);

  const renderStock = (data: { item: Stock; index: number; }, rowMap: Record<string, any>) => {
    rowRefsMap.current[data.item.key] = rowMap[data.item.key];
  
    return (
      <View style={{ backgroundColor: 'white' }}>
        <DataTable.Row>
          <DataTable.Cell style={{ color: 'black', flex: 3.5 }}>{data.item.company_name}</DataTable.Cell>
          <DataTable.Cell numeric style={{ color: 'black', flex: 1 }}>{data.item.price.toFixed(2)}</DataTable.Cell>
        </DataTable.Row>
      </View>
    );
  };

  const closeAllOpenRows = () => {
    if (swipeListViewRef.current) {
      swipeListViewRef.current.closeAllOpenRows();
    }
  };
  
  const renderHiddenItem = (data: { item: Stock; index: number; }, rowMap: Record<string, any>) => (
    <View style={{ backgroundColor: 'red', justifyContent: 'center', flex: 1 }}>
      <TouchableOpacity
        style={{ padding: 10 }}
        onPress={() => {
          Alert.alert(
            "Remove Stock",
            "Are you sure you want to remove this stock from your watchlist?",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: closeAllOpenRows
              },
              { 
                text: "OK", onPress: () => {
                removeStock(data.item.exchange_ticker); 
                closeAllOpenRows;
                }
              }
            ]
          );
        }}
      >
        <Text style={{ color: 'white', textAlign: 'right' }}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

return (
  <RefreshWatchlistContext.Provider value={fetchWatchlist}>
    <Container>
      <SwipeListView
        data={stocks}
        renderItem={renderStock}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-75}
        disableRightSwipe={true}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchWatchlist}
          />
        }
        ref={swipeListViewRef}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Stock</DataTable.Title>
                <DataTable.Title numeric>Last Price</DataTable.Title>
              </DataTable.Header>
            </DataTable>
          </>
        }
        ListFooterComponent={
          <>
          </>
        }
      />
    </Container>
  </RefreshWatchlistContext.Provider>
  );
};

export default Watchlist;
