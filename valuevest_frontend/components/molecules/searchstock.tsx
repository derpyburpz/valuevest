import React, { useState } from 'react';
import { View, Modal, Alert, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar } from 'react-native-paper';
import { RootStackParamList } from '../../nav/nav_stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { API_BASE_URL } from './../../config';
import { Stock } from './../../types';

interface SearchStockModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchStockModal: React.FC<SearchStockModalProps> = ({ visible, onClose }) => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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

  const renderItem = ({ item }: { item: Stock }) => {
    if (item.id) {
      return (
        <Card
          onPress={() => {
            console.log('Selected ticker:', item.exchange_ticker);
            navigation.navigate('StockInfo', { ticker: item.exchange_ticker, key: item.exchange_ticker });
            onClose();
          }}
        >
          <Card.Content>
            <Title>{item.company_name}</Title>
            <Paragraph>{item.exchange_ticker}</Paragraph>
          </Card.Content>
        </Card>
      );
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

export default SearchStockModal;