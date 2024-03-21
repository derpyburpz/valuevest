import { StyleSheet } from 'react-native';

export const tickerStyle = StyleSheet.create({
    tickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3',
    },
    tickerSymbol: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tickerPrice: {
        fontSize: 16,
    },
    tickerChange: {
        fontSize: 16,
        color: 'green',
    },
    tickerChangeNegative: {
        color: 'red',
    },
});