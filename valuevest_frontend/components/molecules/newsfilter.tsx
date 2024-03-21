// Need to add a manual search option
import React, { useState } from 'react';
import { View, Modal, ScrollView, Pressable } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import { FilterModalProps } from './../../types';


const NewsFilterModal: React.FC<FilterModalProps> = ({ visible, onApply, onClose }) => {

  const [selected, setSelected] = useState<string[]>([]);
  const filters = [
    'Apple', 'Microsoft', 'Amazon', 'Google', 'Facebook', 
    'Tesla', 'NVIDIA', 'AMD', 'Intel', 'IBM',
    'Johnson & Johnson', 'Pfizer', 'Moderna', 'AstraZeneca', 'Novavax',
    'JPMorgan Chase', 'Goldman Sachs', 'Visa', 'Mastercard', 'PayPal'
  ];
  

  const onCheckboxPress = (type: string) => {
    if (type === 'All') {
      setSelected(['All']);
    } else {
      if (selected.includes(type)) {
        setSelected(selected.filter(t => t !== type));
      } else {
        setSelected(selected.includes('All') ? [type] : [...selected, type]);
      }
    }
  }  

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 50}}>
        {filters.map((filter) => (
          <Checkbox.Item
            key={filter}
            label={filter}
            status={selected.includes(filter) ? 'checked' : 'unchecked'}
            onPress={() => onCheckboxPress(filter)}
          />
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Button onPress={() => {
          onApply(selected); 
          onClose();
        }}>
          Apply
        </Button>

        <Button onPress={onClose}>
          Cancel
        </Button>
        </View>
      </ScrollView>
    </Modal>
  );
  
};

export default NewsFilterModal;