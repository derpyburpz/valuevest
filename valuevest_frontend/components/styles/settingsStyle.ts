import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    closeButton: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    settingsSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    button: {
      marginHorizontal: 20,
      marginVertical: 10,
    },
  });