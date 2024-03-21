import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Image, RefreshControl } from 'react-native';
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
// import { Article } from '../../types';


interface Article {
  urlToImage: string;
  title: string;
  description: string;
  source: {
    name: string;
  };
}

const Home = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'business OR finance',
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
  }, []);

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <Container>
          <PortfolioValue key={refreshKey} />
        </Container>

        <Container>
          <View style={containerStyle.iconContainer}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <View style={[containerStyle.iconContainer, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="newspaper" size={24} color="black" style={containerStyle.icon}/>
                  <Text style={containerStyle.containerTitle}>Top Portfolio News</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('News')}>
                  <Ionicons name="arrow-forward" size={24} color="black" style={containerStyle.iconRight}/>
                </TouchableOpacity>
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
        </Container>
      </ScrollView>
    </>
  );
};

export default Home;
