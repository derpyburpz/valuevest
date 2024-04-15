import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Image, RefreshControl, Linking } from 'react-native';
import { Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { API_BASE_URL, API_NEWS_KEY } from './../../config';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScrollView } from 'react-native';
import axios from 'axios';
import { RootStackParamList } from '../../nav/nav_stack';
import Container from './../../components/atoms/container';
import PortfolioValue from '../../components/organisms/portfoliovalue';
import { containerStyle } from './../../components/styles/containerstyle';
import { Article, SettingsProps } from './../../types';
import Settings from '../../components/molecules/settings';

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const openArticle = (url: string) => {
    Linking.openURL(url);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'stocks',
          apiKey: API_NEWS_KEY,
        },
      });
      setArticles(response.data.articles);
    } catch (error: any) {
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Container>
          <PortfolioValue key={refreshKey} showAll={false}/>
        </Container>
        <Card style={{ marginHorizontal: 10, marginBottom: 10, backgroundColor: '#FFFFFF' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Ionicons name="newspaper-outline" size={24} color="black" style={{ marginRight: 10 }} />
              <Title style={{ fontWeight: 'bold' }}>Trending Market News</Title>
            </View>
            <Divider style={{ marginVertical: 6 }} />
            {articles.slice(0, 20).map((article, index) => (
              <TouchableOpacity key={index} onPress={() => openArticle(article.url)}>
                <View style={{ marginBottom: 20 }}>
                  <Title>{article.title}</Title>
                  {article.urlToImage && (
                    <Card.Cover source={{ uri: article.urlToImage }} style={{ marginVertical: 10 }} />
                  )}
                  <Paragraph>{article.description}</Paragraph>
                  {article.source && article.source.name && (
                    <Text style={{ fontStyle: 'italic', marginTop: 5 }}>Source: {article.source.name}</Text>
                  )}
                </View>
                {index !== articles.length - 1 && (
                  <View style={{ height: 1, backgroundColor: '#E0E0E0', marginBottom: 20 }} />
                )}
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
};

export default Home;