// export type Stock = {
//     id: string | number | null | undefined;
//     company_name: string;
//     exchange_ticker: string;
//     price: number;
//     shares: number;
//     sic_code: string;
//     country: string;
//     industry_group: string;
//     cost_of_capital: number;
//     cost_of_equity: number;
//     return_on_equity: number;
//     intrinsic_value: number;
//     growth: number;
//     model: string;
//     weighted_average_cost_of_capital: number;
//     enterprise_value: number;
//     equity_value: number;
//     terminal_value: number;
//     discounted_tv: number;
//     book_value_of_equity_per_share: number;
//     discounted_excess_returns: number;
//     count: number;
//     price_change: number;
//     latest_price: number;
//     key: string;
// }
export type Stock = {
  id: string | number | null | undefined;
  company_name: string;
  exchange_ticker: string;
  sector: string;
  country: string;
  current_price: number;
  high_price: number;
  low_price: number;
  market_cap: number;
  pe_ratio: number;
  ps_ratio: number;
  pb_ratio: number;
  p_fcf_ratio: number;
  p_ocf_ratio: number;
  ev_revenue: number;
  ev_ebitda: number;
  ev_ebit: number;
  ev_fcf: number;
  debt_equity: number;
  debt_ebitda: number;
  debt_fcf: number;
  quick_ratio: number;
  current_ratio: number;
  asset_turnover: number;
  return_on_equity: number;
  return_on_assets: number;
  return_on_invested_capital: number;
  earnings_yield: number;
  free_cash_flow_yield: number;
  dividend_yield: number;
  payout_ratio: number;
  buyback_yield: number;
  total_return: number;
  industry_group: string;
  cost_of_capital: number;
  cost_of_equity: number;
  intrinsic_value: number;
  growth: number;
  model: string;
  weighted_average_cost_of_capital: number;
  enterprise_value: number;
  equity_value: number;
  terminal_value: number;
  discounted_tv: number;
  book_value_of_equity_per_share: number;
  discounted_excess_returns: number;
  count: number;
  price_change: number;
  latest_price: number;
  shares: number;
  key: string;
};

export interface Article {
    urlToImage: string;
    title: string;
    description: string;
    url: string;
    q: string;
    category: string;
    source: {
      name: string;
    };
}

export interface BottomTabsProps {
    fetchWatchlist: () => Promise<void>;
}

export interface FilterModalProps {
visible: boolean;
onApply: (filters: string[]) => void; 
onClose: () => void;
}

export interface SettingsProps {
    showSettings: () => void;
  }