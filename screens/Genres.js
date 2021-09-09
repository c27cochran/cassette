import React from 'react';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Block, Text, theme, Icon } from "galio-framework";
import materialTheme from '../constants/Theme';

export default class Genres extends React.Component {
  state = {};

  render() {
    return (
      <View
        style={styles.settings}
      >
      </View>
    );
  }
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
  }
});
