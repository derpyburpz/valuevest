import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { Button } from 'react-native-paper';
import { Article } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScrollView } from 'react-native';
import axios from 'axios';
import { RootStackParamList } from '../../nav/nav_stack';
import Container from './../../components/atoms/container';
import { containerStyle } from './../../components/styles/containerstyle';
import NewsFilterModal from '../../components/molecules/newsfilter';


const News = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stockType, setStockType] = useState('stocks');
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);

  const openModal = () => {
    setModalVisible(true);
  }

  const onApplyFilters = (selected: string[]) => {
    if (selected.includes('All')) {
      console.log(selected);
      setFilters([]);
    } else {
      console.log(selected);
      setFilters(selected);
    }
    setModalVisible(false);
  }
  
  <NewsFilterModal
  visible={modalVisible}
  onApply={onApplyFilters}
  onClose={() => setModalVisible(false)} 
  />

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: filters.length ? filters.join(',') : stockType,
          language: 'en',
          sortBy: 'relevancy',
          apiKey: API_NEWS_KEY
        }
      });
      setArticles(response.data.articles);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [filters]);

  return (
    <>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
      <Button onPress={openModal}>Open Filter</Button>
      <Button onPress={() => setFilters([])}>Reset Filters</Button>
    </View>

    {modalVisible && (
      <NewsFilterModal
        visible={modalVisible}
        onApply={onApplyFilters}
        onClose={() => setModalVisible(false)}
      />
    )}

      <Container>
        <ScrollView>
          <View style={containerStyle.iconContainer}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <View style={[containerStyle.iconContainer, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="newspaper" size={24} color="black" style={containerStyle.icon}/>
                  <Text style={containerStyle.containerTitle}>Top News</Text>
                </View>
              </View>
              {articles.slice(0, 20).map((article, index) => (
                <View key={index} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: '#D3D3D3' }}>
                  {article.urlToImage && <Image source={{ uri: article.urlToImage }} style={{ width: 150, height: 150 }} />}
                  <View style={{ flex: 2, marginLeft: 10, alignItems: 'stretch' }}>
                    {article.title && <Text>{article.title}</Text>}
                    {article.description && <Text>{article.description}</Text>}
                    {article.source && article.source.name && <Text style={{ fontStyle: 'italic' }}>Source: {article.source.name}</Text>}
                  </View>
                  <View style={{ height: 10 }} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

export default News;
