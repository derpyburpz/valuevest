export type RootStackParamList = {
  Home: undefined;
  Watchlist: undefined;
  News: undefined;
  Portfolio: undefined;
  Valuator: undefined;
  Profile: undefined;
  Search: undefined;
  Login: undefined;
  Signup: undefined;
  StockInfo: { ticker: string; key: string };
  AuthSplash: undefined;
  AuthStack: { screen: string; };
  AppStack: { screen: string; };
  App: undefined;
  NotAuthenticated: undefined;
};