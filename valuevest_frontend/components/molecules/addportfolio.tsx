import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, Alert, Text, TouchableOpacity, Pressable, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar, IconButton, Dialog, Portal, TextInput } from 'react-native-paper';
import { RootStackParamList } from '../../nav/nav_stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { Stock } from './../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fetchPortfolio from '../../screens/portfolio/index';

interface AddPortfolioProps {
  visible: boolean;
  stocks: any[];
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  onApply: (filters: string[]) => void;
  onClose: () => void;
}

type ListItemProps = {
  item: any,
  handleAdd: (item: any) => void
};


const AddPortfolioModal: React.FC<AddPortfolioProps> = ({ visible, onApply, onClose }) => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [shares, setShares] = useState(1);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  
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
              <IconButton icon="plus" onPress={() => handleAdd(item)} />

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

  const handleAdd = (stock: Stock) => {
    setSelectedStock(stock);
    setDialogVisible(true);
  };

  const handleConfirm = async () => {
    if (selectedStock) {
      await addToPortfolio(selectedStock, shares);
    }
    setDialogVisible(false);  // Close dialog
  };

  const handleConfirmAndAddMore = async () => {
    if (selectedStock) {
      await addToPortfolio(selectedStock, shares); 
    }
  
    setDialogVisible(false);  
  };

  const addToPortfolio: (stock: Stock, shares: number) => Promise<void> = async (stock, shares) => { const user_id = Number(await AsyncStorage.getItem('user_id'));
    const access = await AsyncStorage.getItem('access');
  
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/add_to_portfolio/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        body: JSON.stringify({
          user_id: user_id,
          exchange_ticker: stock.exchange_ticker,
          shares: shares
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error);
      }
  
      console.log('Response after adding stock:', data);
      Alert.alert('Success', `${stock.company_name} has been added to your portfolio.`);
  
      // onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add stock. Please check your network connection and try again.');
    }
  };       

  const renderItem = ({ item }: { item: Stock }): React.ReactElement | null => {
    if (item.id) {
      return <ListItem item={item} handleAdd={handleAdd} />
    } else {
      return null;
    }
  }

  return (
    <>
      <Modal visible={visible && !dialogVisible} animationType="slide">
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
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add to Portfolio</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{`Do you want to add ${selectedStock?.company_name} to your portfolio?`}</Paragraph>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Button icon="minus" onPress={() => setShares(Math.max(1, shares - 1))} />
              <TextInput
                label="Shares"
                value={shares.toString()}
                keyboardType="numeric"
                onChangeText={(text: string) => setShares(Number(text))}
                style={{ flex: 1, marginHorizontal: 10 }}
              />
              <Button icon="plus" onPress={() => setShares(shares + 1)} />
            </View>
          </Dialog.Content>
          <View>
          <Button onPress={async () => {await handleConfirm(); onClose(); }}>Confirm (Back to Portfolio)</Button>
          <Button onPress={handleConfirmAndAddMore}>Confirm (Add More)</Button>
          <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
        </View>
      </Dialog>
    </Portal>
  </>
);
  
};
export default AddPortfolioModal;
