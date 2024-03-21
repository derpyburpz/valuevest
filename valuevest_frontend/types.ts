export type Stock = {
    id: string | number | null | undefined;
    company_name: string;
    exchange_ticker: string;
    price: number;
    shares: number;
    sic_code: string;
    country: string;
    industry_group: string;
    cost_of_capital: number;
    cost_of_equity: number;
    return_on_equity: number;
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
    key: string;
}

export interface Article {
    urlToImage: string;
    title: string;
    description: string;
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