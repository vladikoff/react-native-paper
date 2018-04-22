/* @flow */

import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Colors, withTheme, Button } from 'react-native-paper';
import type { Theme } from 'react-native-paper/types';

type Props = {
  theme: Theme,
};

type State = {
  visible: boolean,
};

class SnackbarExample extends React.Component<Props, State> {
  static title = 'Snackbar';

  state = {
    visible: false,
  };

  render() {
    const {
      theme: {
        colors: { background },
      },
    } = this.props;
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View>
          <Button onPress={() => this.setState({ visible: true })}>Show</Button>
          <Button onPress={() => this.setState({ visible: false })}>
            Hide
          </Button>
        </View>
        <Snackbar
          visible={this.state.visible}
          onDismiss={() => this.setState({ visible: false })}
          action={{
            text: 'Undo',
            onPress: () => {
              this.setState({ visible: false });
            },
          }}
          duration={Snackbar.DURATION_INDEFINITE}
        >
          Put your message here
        </Snackbar>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey200,
    justifyContent: 'space-between',
  },
});

export default withTheme(SnackbarExample);
