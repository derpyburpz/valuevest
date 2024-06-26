import React, { useEffect, useState, useRef } from 'react';
import { Alert, Text, View, TouchableOpacity, RefreshControl, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { DataTable } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SwipeListView } from 'react-native-swipe-list-view';
import Container from './../../components/atoms/container';
import PortfolioValue from '../../components/organisms/portfoliovalue';
import { Stock } from './../../types';
import StockInfoModal from '../../components/organisms/stockinfomodal';

const Portfolio = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const handleStockPress = (ticker: string) => {
    setSelectedStock(ticker);
  };

  const closeModal = () => {
    setSelectedStock(null);
  };

  const swipeListViewRef = useRef<SwipeListView<any> | null>(null);
  const rowRefsMap = useRef<Record<string, any>>({});

  const refreshPortfolio = async () => {
    setRefreshing(true);
    await fetchPortfolio();
    setRefreshKey(prevKey => prevKey + 1);
    setRefreshing(false);
  };
  
  const fetchPortfolio = async () => {
    setRefreshing(true);
    const user_id = await AsyncStorage.getItem('user_id');
    const access = await AsyncStorage.getItem('access');

    try {
      const response = await axios.get(`${API_BASE_URL}/stocks/get_portfolio/?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      setStocks(response.data.map((stock: any) => ({
        key: stock.exchange_ticker,
        company_name: stock.company_name,
        exchange_ticker: stock.exchange_ticker,
        latest_price: stock.latest_price,
        shares: stock.shares,
        price_change: stock.price_change
      })));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch portfolio. Please check your network connection and try again.');
    }
    setRefreshing(false);
  };
  
  const removeStock = async (exchange_ticker: string) => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const access = await AsyncStorage.getItem('access');
      const response = await axios.request({
        method: 'delete',
        url: `${API_BASE_URL}/stocks/remove_from_portfolio/`,
        headers: { Authorization: `Bearer ${access}` },
        data: { user_id: user_id, exchange_ticker: exchange_ticker }
      });
  
      console.log(response.data);
      fetchPortfolio();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error);
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
      } else {
        console.error(error);
      }
      Alert.alert('Error', 'Failed to remove stock. Please check your network connection and try again.');
    }
  };
   
  useEffect(() => {
    refreshPortfolio();
  }, []);

  const renderStock = (data: { item: Stock; index: number; }, rowMap: Record<string, any>) => {
    rowRefsMap.current[data.item.key] = rowMap[data.item.key];
  
    return (
      <TouchableWithoutFeedback onPress={() => handleStockPress(data.item.exchange_ticker)}>
        <View style={{ backgroundColor: 'white' }}>
          <DataTable.Row>
            <DataTable.Cell style={{ color: 'black', flex: 4.5 }}>{data.item.company_name.split('(')[0].trim()}</DataTable.Cell>
            <DataTable.Cell numeric style={{ color: 'black', flex: 3 }}>{data.item.latest_price ? data.item.latest_price.toFixed(2) : 'N/A'}</DataTable.Cell>
            <DataTable.Cell numeric style={{ color: 'black', flex: 3 }}>
              {data.item.price_change ? (
                parseFloat(data.item.price_change.toFixed(2)) > 0 ? `+${data.item.price_change.toFixed(2)}` : data.item.price_change.toFixed(2)
              ) : (
                'N/A'
              )}
            </DataTable.Cell>
            <DataTable.Cell numeric style={{ color: 'black', flex: 2 }}>{data.item.shares ? data.item.shares.toString() : 'N/A'}</DataTable.Cell>
          </DataTable.Row>
        </View>
      </TouchableWithoutFeedback>
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
            "Are you sure you want to remove this stock from your portfolio?",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: closeAllOpenRows
              },
              {
                text: "OK",
                onPress: () => {
                  removeStock(data.item.exchange_ticker);
                  closeAllOpenRows();
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
    <>
      <Container key={refreshKey}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshPortfolio}
            />
          }
        >
          <PortfolioValue key={refreshKey} showAll={true}/>
        </ScrollView>
      </Container>
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
            onRefresh={refreshPortfolio}
          />
        }
        ref={swipeListViewRef}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <>
            <View style={{ flex: 1, height: 0.1, backgroundColor: 'white' }} />
            <DataTable>
              <DataTable.Header>
                <DataTable.Title style={{ flex: 4.5 }}>Company</DataTable.Title>
                <DataTable.Title numeric style={{ flex: 3 }}>Current Price</DataTable.Title>
                <DataTable.Title numeric style={{ flex: 3 }}>Change (%)</DataTable.Title>
                <DataTable.Title numeric style={{ flex: 2 }}>Shares</DataTable.Title>
              </DataTable.Header>
            </DataTable>
          </>
        }
        ListFooterComponent={<></>}
      />
      <Modal visible={!!selectedStock} onRequestClose={closeModal}>
        {selectedStock && <StockInfoModal ticker={selectedStock} onClose={closeModal} />}
      </Modal>
    </>
  );
};

export default Portfolio;
