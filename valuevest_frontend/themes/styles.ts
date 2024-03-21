// Was homestyle.ts
import { StyleSheet } from "react-native";
import { COLORS, FONT, SIZES } from "./index";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    padding: 16,
  },
  userName: {
    fontFamily: FONT.regular,
    fontSize: SIZES.large,
    color: COLORS.secondary,
  },
  welcomeMessage: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    marginTop: 2,
  },
  searchContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: SIZES.large,
    height: 50,
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginRight: SIZES.small,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.medium,
    height: "100%",
  },
  searchInput: {
    fontFamily: FONT.regular,
    width: "100%",
    height: "100%",
    paddingHorizontal: SIZES.medium,
  },
  searchBtn: {
    width: 50,
    height: "100%",
    backgroundColor: COLORS.tertiary,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnImage: {
    width: "50%",
    height: "50%",
    tintColor: COLORS.white,
  },
  tabsContainer: {
    width: "100%",
    marginTop: SIZES.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  asset: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 5,
  },  
  expandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandText: {
    marginRight: 8,
  },
  text: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 0, 
    left: 0,
    right: 0,
    zIndex: 1
  }
  }
);

export default styles;