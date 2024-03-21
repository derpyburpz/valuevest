// Modal for adding ticker to Watchlist
import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Modal, Alert, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar, IconButton } from 'react-native-paper';
import { RootStackParamList } from '../../nav/nav_stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stock } from './../../types';

interface AddTickerProps {
  visible: boolean;
  stocks: any[];
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  onApply: (filters: string[]) => void;
  onClose: () => void;
}

type ListItemProps = {
  item: any,
  handleAdd: (item: any) => () => void
};

const AddTickerModal: React.FC<AddTickerProps> = ({ visible, onApply, onClose }) => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const ListItem = React.memo(({ item, handleAdd }: ListItemProps) => {
    if (item.id) {
      return (
        <Card>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Title>{item.company_name}</Title>
                <Paragraph>{item.exchange_ticker}</Paragraph>
              </View>
              <IconButton icon="plus" onPress={handleAdd(item)} />
            </View>
          </Card.Content>
        </Card>
      );
    }
  });

  const fetchStocks = async () => {
    if (!visible) return;
    try {
      console.log(`Fetching stocks with searchTerm: ${searchTerm}`);
      const response = await axios.get(`${API_BASE_URL}/stocks/search_stock/?search=${searchTerm}`);
      console.log('Fetched stocks:', response.data);
      setStocks(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch stocks. Please check your network connection and try again.');
    }
  };

  const handleSearch = () =>  {
    fetchStocks();
  }

  const addToWatchlist: (stock: Stock) => Promise<void> = async (stock) => {
    const user_id = Number(await AsyncStorage.getItem('user_id'));
    const access = await AsyncStorage.getItem('access');
  
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/add_to_watchlist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          user_id: user_id,
          exchange_ticker: stock.exchange_ticker
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error);
      }
  
      console.log('Response after adding stock:', data);
      Alert.alert('Success', `${stock.company_name} has been added to your watchlist.`);
  
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add stock. Please check your network connection and try again.');
    }
  };

  const handleAdd = (stock: Stock) => () => {
    const addToWatchlistAndClose = async () => {
      await addToWatchlist(stock);
      onClose();
    };

    const addToWatchlistAddMore = async () => {
      await addToWatchlist(stock);
    };

    Alert.alert(
      "Add to Watchlist",
      `Do you want to add ${stock.company_name} to your watchlist?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm (Back to Watchlist)",
          onPress: addToWatchlistAndClose
        },
        {
          text: "Confirm (Add More)",
          onPress: addToWatchlistAddMore
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Stock }): React.ReactElement | null => {
    if (item.id) {
      return <ListItem item={item} handleAdd={handleAdd} />
    } else {
      return null;
    }
  }

  return (
    <Modal visible={visible} animationType="slide">
      <Searchbar
        style={{ marginBottom: 10 }}
        onChangeText={(text: string) => setSearchTerm(text)}
        value={searchTerm}
        placeholder="Stock Name/Code/Exchange/Country..."
        icon="magnify"
        onIconPress={handleSearch}
        onSubmitEditing={handleSearch}
      />
      <FlatList
        data={stocks}
        renderItem={renderItem}
        keyExtractor={(item: Stock) => item.id?.toString() ?? ''}
      />
      <Button onPress={onClose}> Cancel </Button>
    </Modal>
  );
};

export default AddTickerModal;
