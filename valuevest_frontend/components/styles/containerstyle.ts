import { StyleSheet } from 'react-native';

export const containerStyle = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingBottom: 10
  },
  containerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 5,
    marginLeft: 10,
    marginTop: 10,
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 5,
    marginLeft: 15,
    marginTop: 10,
    fontSize: 20,
    fontWeight: '600',
  },
  
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  containerTextBold: {
    fontWeight: 'bold',
    fontSize: 30,
    marginLeft: 15,
  },
  containerTextGreen: {
    color: 'limegreen',
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  containerTextRed: {
    color: 'red',
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  containerTextBlack: {
    color: 'black',
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginLeft: 15,
    marginTop: 10,
  },
  iconRight: {
    alignSelf: 'flex-end',
    fontSize: 35,
    fontWeight: 'bold',
    marginRight: 5,
    marginLeft: 5,
    marginTop: 5,
  },
});
