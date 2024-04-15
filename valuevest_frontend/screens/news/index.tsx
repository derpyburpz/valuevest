import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Image, Linking } from 'react-native';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [manualSearch] = useState('');

  const openModal = () => {
    setModalVisible(true);
  };

  const onApplyFilters = (selected: string[]) => {
    if (selected.includes('All')) {
      console.log(selected);
      setFilters([]);
    } else {
      console.log(selected);
      setFilters(selected);
    }
    setModalVisible(false);
  };

  const fetchNews = async () => {
    try {
      const defaultCategory = 'Technology';
      const selectedCategories = filters.length ? filters : [defaultCategory];
  
      const params: Record<string, string> = {
        language: 'en',
        apiKey: API_NEWS_KEY,
      };
  
      let apiEndpoint = 'https://newsapi.org/v2/top-headlines';
  
      if (manualSearch.trim() !== '') {
        apiEndpoint = 'https://newsapi.org/v2/everything';
        params.q = manualSearch.trim();
        params.searchIn = 'title,description';
      } else if (filters.length > 0) {
        apiEndpoint = 'https://newsapi.org/v2/everything';
        params.q = selectedCategories.join(' OR ');
      } else {
        params.category = defaultCategory;
      }
  
      console.log('API Request Params:', params);
  
      const response = await axios.get(apiEndpoint, { params });
  
      if (response.data && response.data.articles) {
        setArticles(response.data.articles);
      } else {
        console.log('No articles found in the API response.');
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setArticles([]);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [filters, manualSearch]);

  const openArticle = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 7.5 }}>
        <Button onPress={() => setFilters([])}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, textAlign: 'center' }}>
            Reset Filters
          </Text>
        </Button>
        <Button onPress={openModal}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, textAlign: 'center' }}>
            Open Filters
          </Text>
        </Button>
      </View>

      {modalVisible && (
        <NewsFilterModal visible={modalVisible} onApply={onApplyFilters} onClose={() => setModalVisible(false)} />
      )}

      <ScrollView>
        <View style={containerStyle.iconContainer}>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={[containerStyle.iconContainer, { justifyContent: 'space-between' }]}>      
            </View>
            {articles.slice(0, 20).map((article, index) => (
              <TouchableOpacity key={index} onPress={() => openArticle(article.url)}>
                <Card style={{ marginBottom: 10, backgroundColor: '#FFFFFF' }}>
                  <Card.Content>
                    <Title>{article.title}</Title>
                    {article.urlToImage && (
                      <Card.Cover source={{ uri: article.urlToImage }} style={{ marginVertical: 10 }} />
                    )}
                    <Paragraph>{article.description}</Paragraph>
                    {article.source && article.source.name && (
                      <Text style={{ fontStyle: 'italic', marginTop: 5 }}>Source: {article.source.name}</Text>
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default News;