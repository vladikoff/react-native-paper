/* @flow */
import * as React from 'react';
import {
  StyleSheet,
  Animated,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';

import ThemedPortal from './Portal/ThemedPortal';
import withTheme from '../core/withTheme';
import { white } from '../styles/colors';
import type { Theme } from '../types';

type Props = {
  /**
   * Whether snackbar is currently visible.
   */
  visible: boolean,
  /**
   * Text that will be displayed inside SnackBar.
   */
  children: string | React.Node,
  /**
   * Object that determines button text and callback for button press. It should contains following properties:
   * - `text` - Content of the action button
   * - `onPress` - Callback that is called when action button is pressed, user needs to update the `visible` prop.
   * - `color` - Color of the action button
   */
  action?: {
    text: string,
    onPress: () => mixed,
  },
  /**
   * The duration for which the Snackbar is shown
   * It can take following values:
   * - `'indefinite'` - SnackBar will hide only when user tap it.
   * - `'short'` - SnackBar will hide after 2 seconds.
   * - `'long'` - SnackBar will hide after 3.5 seconds.
   */
  duration?: 'indefinite' | 'short' | 'long',
  /**
   * Callback called when Snackbar is dismissed, user needs to update the `visible` prop.
   */
  onDismiss: () => mixed,
  style?: any,
  theme: Theme,
};

type State = {
  opacity: Animated.Value,
  yPosition: Animated.Value,
};

const SNACKBAR_ANIMATION_DURATION = 250;
const DURATION_SHORT = 2000;
const DURATION_LONG = 3500;

/**
 * Snackbar provide brief feedback about an operation through a message at the bottom of the screen.
 *
 * <div class="screenshots">
 *   <img class="medium" src="screenshots/snackbar.gif" />
 * </div>
 *
 * ## Usage
 * ```js
 * import React from 'react';
 * import { Snackbar, StyleSheet } from 'react-native-paper';
 *
 * export default class MyComponent extends React.Component {
 *   state = {
 *     visible: false,
 *   };
 *
 *   render() {
 *     const { visible } = this.state;
 *     return (
 *       <View style={styles.container}>
 *         <View>
 *           <Button onPress={() => this.setState({ visible: true })}>Show</Button>
 *           <Button onPress={() => this.setState({ visible: false })}>Hide</Button>
 *         </View>
 *         <Snackbar
 *           visible={this.state.visible}
 *           onDismiss={() => this.setState({ visible: false })}
 *           action={{
 *             text: 'Undo',
 *             onPress: () => {
 *               this.setState({ visible: false });
 *             },
 *           }}
 *         >
 *           Put your message here
 *         </Snackbar>
 *       </View>
 *     );
 *   }
 * }
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     justifyContent: 'space-between',
 *   },
 * });
 * ```
 */
class Snackbar extends React.Component<Props, State> {
  static defaultProps = {
    duration: DURATION_LONG,
  };

  state = {
    opacity: new Animated.Value(0),
    yPosition: new Animated.Value(48),
  };

  _hideTimeout: any;

  componentDidMount() {
    if (this.props.visible) {
      this._show();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      this.props.visible ? this._show() : this._hide();
    }
  }

  _show = () => {
    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue: 1,
        duration: SNACKBAR_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.yPosition, {
        toValue: 0,
        duration: SNACKBAR_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const { duration } = this.props;
      if (duration !== 'indefinite') {
        this._hideTimeout = setTimeout(
          this.props.onDismiss,
          duration === 'short' ? DURATION_SHORT : DURATION_LONG
        );
      }
    });
  };

  _hide = () => {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
    }
    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue: 0,
        duration: SNACKBAR_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.yPosition, {
        toValue: 48,
        duration: SNACKBAR_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  };

  render() {
    const { children, action, onDismiss, theme, style } = this.props;

    const { fonts, colors } = theme;

    const buttonRightMargin = action ? 24 : 0;
    const contentRightMargin = action ? 0 : 24;

    return (
      <ThemedPortal theme={theme}>
        <Animated.View
          style={[
            styles.wrapper,
            {
              transform: [
                {
                  translateY: this.state.yPosition,
                },
              ],
            },
            style,
          ]}
        >
          <TouchableWithoutFeedback onPress={onDismiss}>
            <Animated.View
              style={[
                styles.container,
                {
                  opacity: this.state.opacity.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [0, 0.2, 1],
                  }),
                },
              ]}
            >
              <Text
                style={[
                  styles.content,
                  {
                    fontFamily: fonts.regular,
                    marginRight: contentRightMargin,
                  },
                ]}
              >
                {children}
              </Text>
              {action ? (
                <View
                  style={{
                    marginRight: buttonRightMargin,
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => {
                      action.onPress();
                      this._hide();
                    }}
                  >
                    <View>
                      <Text style={{ color: colors.accent }}>
                        {action.text.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              ) : null}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </ThemedPortal>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#323232',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    color: white,
    marginLeft: 24,
    marginVertical: 14,
    flexWrap: 'wrap',
    flex: 1,
  },
});

export default withTheme(Snackbar);
