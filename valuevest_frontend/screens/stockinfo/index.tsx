import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card, Title, Paragraph, Subheading, Divider, ActivityIndicator, List } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { Stock } from '../../types';
import { RootStackParamList } from '../../nav/nav_stack';

type StockInfoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockInfo'>;
type StockInfoScreenRouteProp = RouteProp<RootStackParamList, 'StockInfo'>;

const StockInfo: React.FC = () => {
  const navigation = useNavigation<StockInfoScreenNavigationProp>();
  const route = useRoute<StockInfoScreenRouteProp>();
  const { ticker } = route.params;
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('Received ticker in StockInfo screen:', ticker);
  useEffect(() => {
    fetchStockDetails();
  }, []);

  const fetchStockDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stocks/get_stock_details/?ticker=${ticker}`);
      setStock(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch stock details. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (!stock) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Paragraph>Failed to load stock details.</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card style={{backgroundColor: '#FFFFFF'}}>
        <Card.Content>
					<Title style={{ fontWeight: "bold", fontSize: 24, color: '#74278E' }}>{stock.company_name.split('(')[0].trim()}</Title>
          <Subheading>{stock.exchange_ticker}</Subheading>
        </Card.Content>
      </Card>

      <Divider style={{ marginVertical: 8 }} />

      <Card style={{backgroundColor: '#FFFFFF'}}>
        <Card.Content>
          <Title style={{ fontWeight: "bold" }}>General Information</Title>
          <Paragraph style={{ paddingTop: 10, fontSize: 15 }}>Sector: {stock.sector}</Paragraph>
          <Paragraph style={{ paddingTop: 10, fontSize: 15 }}>Industry: {stock.industry_group}</Paragraph>
          <Paragraph style={{ paddingTop: 10, fontSize: 15 }}>Country: {stock.country}</Paragraph>
          <Paragraph style={{ paddingTop: 10, fontSize: 15 }}>Current Price: ${stock.current_price}</Paragraph>
          <Paragraph style={{ paddingTop: 10, fontSize: 15 }}>High Price: ${stock.high_price}</Paragraph>
          <Paragraph style={{ paddingTop: 10, fontSize: 15 }}>Low Price: ${stock.low_price}</Paragraph>
          <Paragraph style={{ paddingTop: 10, fontSize: 15 }}>Market Cap: ${stock.market_cap.toFixed(0)} Million</Paragraph>
        </Card.Content>
      </Card>

      <Divider style={{ marginVertical: 8 }} />

			<Card style={{backgroundColor: '#FFFFFF'}}>
				<Card.Content>
					<Title style={{ fontWeight: "bold" }}>Financial Ratios</Title>
					<List.Section>
						<List.Subheader style={{ paddingLeft: -20, fontSize: 16 }}>
							Valuation Ratios
						</List.Subheader>
						<List.Item
							title="PE Ratio"
							description={stock.pe_ratio}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="PS Ratio"
							description={stock.ps_ratio}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="PB Ratio"
							description={stock.pb_ratio}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="P/FCF Ratio"
							description={stock.p_fcf_ratio}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="P/OCF Ratio"
							description={stock.p_ocf_ratio}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="EV/Revenue"
							description={stock.ev_revenue}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="EV/EBITDA"
							description={stock.ev_ebitda}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="EV/EBIT"
							description={stock.ev_ebit}
							left={() => <List.Icon icon="chart-line" />}
						/>
						<List.Item
							title="EV/FCF"
							description={stock.ev_fcf}
							left={() => <List.Icon icon="chart-line" />}
						/>

						<List.Subheader style={{ paddingLeft: -20, fontSize: 16 }}>
							Leverage Ratios
						</List.Subheader>
						<List.Item
							title="Debt/Equity"
							description={stock.debt_equity}
							left={() => <List.Icon icon="chart-bar" />}
						/>
						<List.Item
							title="Debt/EBITDA"
							description={stock.debt_ebitda}
							left={() => <List.Icon icon="chart-bar" />}
						/>
						<List.Item
							title="Debt/FCF"
							description={stock.debt_fcf}
							left={() => <List.Icon icon="chart-bar" />}
						/>

						<List.Subheader style={{ paddingLeft: -20, fontSize: 16 }}>
							Liquidity Ratios
						</List.Subheader>
						<List.Item
							title="Quick Ratio"
							description={stock.quick_ratio}
							left={() => <List.Icon icon="water" />}
						/>
						<List.Item
							title="Current Ratio"
							description={stock.current_ratio}
							left={() => <List.Icon icon="water" />}
						/>

						<List.Subheader style={{ paddingLeft: -20, fontSize: 16 }}>
							Efficiency Ratios
						</List.Subheader>
						<List.Item
							title="Asset Turnover"
							description={stock.asset_turnover}
							left={() => <List.Icon icon="cog" />}
						/>

						<List.Subheader style={{ paddingLeft: -20, fontSize: 16 }}>
							Profitability Ratios
						</List.Subheader>
						<List.Item
							title="Return on Equity (ROE)"
							description={stock.return_on_equity}
							left={() => <List.Icon icon="trending-up" />}
						/>
						<List.Item
							title="Return on Assets (ROA)"
							description={stock.return_on_assets}
							left={() => <List.Icon icon="trending-up" />}
						/>
						<List.Item
							title="Return on Invested Capital (ROIC)"
							description={stock.return_on_invested_capital}
							left={() => <List.Icon icon="trending-up" />}
						/>

						<List.Subheader style={{ paddingLeft: -20, fontSize: 16 }}>
							Dividend and Yield Ratios
						</List.Subheader>
						<List.Item
							title="Earnings Yield"
							description={stock.earnings_yield}
							left={() => <List.Icon icon="cash" />}
						/>
						<List.Item
							title="Free Cash Flow Yield"
							description={stock.free_cash_flow_yield}
							left={() => <List.Icon icon="cash" />}
						/>
						<List.Item
							title="Dividend Yield"
							description={stock.dividend_yield}
							left={() => <List.Icon icon="cash" />}
						/>
						<List.Item
							title="Payout Ratio"
							description={stock.payout_ratio}
							left={() => <List.Icon icon="cash" />}
						/>
						<List.Item
							title="Buyback Yield"
							description={stock.buyback_yield}
							left={() => <List.Icon icon="cash" />}
						/>
						<List.Item
							title="Total Return"
							description={stock.total_return}
							left={() => <List.Icon icon="cash" />}
						/>
					</List.Section>
				</Card.Content>
			</Card>
    </ScrollView>
  );
};

export default StockInfo;