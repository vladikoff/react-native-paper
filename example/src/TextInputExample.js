/* @flow */

import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, HelperText, withTheme } from 'react-native-paper';
import type { Theme } from 'react-native-paper/types';

type Props = {
  theme: Theme,
};

type State = {
  text: string,
  errorInputText: string,
};

class TextInputExample extends React.Component<Props, State> {
  static title = 'TextInput';

  state = {
    text: '',
    errorInputText: '',
  };

  render() {
    const {
      theme: {
        colors: { background },
      },
    } = this.props;
    return (
      <ScrollView style={[styles.container, { backgroundColor: background }]}>
        <TextInput
          style={styles.inputContainerStyle}
          label="Normal input"
          placeholder="Type something"
          value={this.state.text}
          onChangeText={text => this.setState({ text })}
        />
        <View style={styles.inputContainerStyle}>
          <TextInput
            label="Input with helper text"
            placeholder="Type more than three characters"
            value={this.state.errorInputText}
            hasError={this.state.errorInputText.length > 3}
            onChangeText={errorInputText => this.setState({ errorInputText })}
          />
          <HelperText
            helperText="Helper text"
            errorText="Error text"
            hasError={this.state.errorInputText.length > 3}
          />
        </View>
        <TextInput
          disabled
          style={styles.inputContainerStyle}
          label="Disabled Input"
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  inputContainerStyle: {
    margin: 8,
  },
});

export default withTheme(TextInputExample);
