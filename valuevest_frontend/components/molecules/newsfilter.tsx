import React, { useState } from 'react';
import { View, Modal, ScrollView } from 'react-native';
import { Button, Checkbox, TextInput } from 'react-native-paper';
import { FilterModalProps } from './../../types';

const NewsFilterModal: React.FC<FilterModalProps> = ({ visible, onApply, onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [manualSearch, setManualSearch] = useState('');

  const filters = ['Business', 'Entertainment', 'General', 'Health', 'Science', 'Technology']

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
        <TextInput
          label="Manual Search"
          value={manualSearch}
          onChangeText={setManualSearch}
          style={{ marginBottom: 20 }}
        />
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
            setManualSearch('');
            onClose();
          }}>
            Cancel
          </Button>
          <Button onPress={() => {
            const allFilters = [...selected];
            if (manualSearch.trim() !== '') {
              allFilters.push(manualSearch.trim());
            }
            onApply(allFilters);
            onClose();
          }}>
            Apply
          </Button>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default NewsFilterModal;