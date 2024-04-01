import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Button, Card, Title, Paragraph, Headline, Subheading, FAB, Divider } from 'react-native-paper';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScrollView } from 'react-native';
import axios from 'axios';
import { RootStackParamList } from '../../nav/nav_stack';
import Container from './../../components/atoms/container';
import { containerStyle } from './../../components/styles/containerstyle';
import ValuatorFilterModal from '../../components/molecules/valuatorfilter';
import { Stock } from './../../types';

const Valuator = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<{ industry_group?: string; model?: string; country?: string }>({});
  const [stocks, setStocks] = useState<Stock[]>([]);

  const openModal = () => {
    setModalVisible(true);
  }

  const onApplyFilters = (selected: { industryGroup?: string; model?: string; country?: string }) => {
    setFilters(selected);
    setModalVisible(false);
  }

  useEffect(() => {
    axios.get(`${API_BASE_URL}/stocks/get_ranking_by_attribute/`, {
      params: filters
    })
    .then(response => {
      setStocks(response.data);
    })
    .catch(error => {
      console.error(error);
    });
  }, [filters]);


  return (
    <>
      {modalVisible && (
        <ValuatorFilterModal
          visible={modalVisible}
          onApply={onApplyFilters}
          onClose={() => setModalVisible(false)}
        />
      )}
      <View>
        <ScrollView>
          {stocks.map((stock, index) => {
            let [name] = stock.company_name.split('(');
            return (
              <Card key={index} style={{ margin: 10, backgroundColor: '#FFFFFF', borderColor: 'white' }} elevation={0}>
                <Card.Title title={`${stock.count}. ${name}`} titleStyle={{ fontSize: 24, paddingTop: 15, color: '#74278E', fontWeight: 'bold' }} />
                <Card.Content>
                  <Title style={{ fontSize: 15 }}>Stock Performance Forecast</Title>
                  <Paragraph style={{ paddingTop: 10, fontSize: 14, color: '#606060' }}>Intrinsic Value:  <Text style={{ fontWeight: 'bold', color: '#74278E', fontSize: 20 }}>${stock.intrinsic_value}</Text></Paragraph>
                  <Paragraph style={{ paddingTop: 10, fontSize: 14, color: '#606060' }}>Growth Potential:  <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#000000' }}>{stock.price_change}%</Text></Paragraph>
                  <Paragraph style={{ paddingTop: 10, fontSize: 14, color: '#606060' }}>Model:  <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#000000' }}>{stock.model}</Text></Paragraph>
                  <Divider style={{ marginVertical: 10 }}/>
                  <Title style={{ fontSize: 15 }}>Stock Information</Title>
                  <Paragraph style={{ paddingTop: 10, fontSize: 14, color: '#606060' }}>Current Price:  <Text style={{ fontWeight: 'bold', color: '#74278E', fontSize: 20 }}>${stock.latest_price}</Text></Paragraph>
                  <Paragraph style={{ paddingTop: 10, fontSize: 14, color: '#606060' }}>Exchange Ticker:  <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#000000' }}>{stock.exchange_ticker}</Text></Paragraph>
                  <Paragraph style={{ paddingTop: 10, fontSize: 14, color: '#606060' }}>Country:  <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#000000' }}>{stock.country}</Text></Paragraph>
                  <Paragraph style={{ paddingTop: 10 }}>Industry Group:  <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#000000' }}>{stock.industry_group}</Text></Paragraph>
                </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
      <FAB
        style={{
          position: 'absolute',
          margin: 0,
          right: 30,
          top: 565,
          backgroundColor: '#74278E',
          width: 56,
          height: 55,
        }}
        icon="filter"
        color="white"
        onPress={() => openModal()}
      />
    </View>
    </>
  );
};
export default Valuator;
