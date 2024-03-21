import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { containerStyle } from './../styles/containerstyle';

interface Props {
    children: ReactNode;
}

const Container: React.FC<Props> = ({ children }) => {
  return <View style={containerStyle.container}>{children}</View>;
};

export default Container;
