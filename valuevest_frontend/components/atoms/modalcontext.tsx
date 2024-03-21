import React from 'react';

interface ModalContextProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

export const ModalContext = React.createContext<ModalContextProps | undefined>(undefined);