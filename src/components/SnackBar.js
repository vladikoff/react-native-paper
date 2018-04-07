// @flow
import * as React from 'react';
import {
  StyleSheet,
  Animated,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';

import withTheme from '../core/withTheme';
import { grey850, white } from '../styles/colors';
import type { Theme } from '../types';

type Props = {
  /**
   * Whether snackbar is currently visible.
   */
  visible: boolean,
  /**
   * Text that will be displayed inside SnackBar.
   */
  content: string,
  /**
   * object that determines button text and callback for button press. It should contains following properties:
   * `text` - Content of the action button
   * `onPress` - Callback that is called when action button is pressed
   * `color` - Color of the action button
   */
  action?: {
    text: string,
    onPress: () => mixed,
    color?: string,
  },
  /**
   * Duration of the button.
   */
  duration: number,
  /**
   * Callback called when Snackbar is dismissed, user needs to update the `visible` prop.
   */
  onDismiss: () => any,
  contentColor?: string,
  backgroundColor?: string,
  theme: Theme,
};

type State = {
  opacity: Animated.Value,
  yPosition: Animated.Value,
};

const SNACKBAR_ANIMATION_DURATION = 250;

class SnackBar extends React.Component<Props, State> {
  static defaultProps = {
    duration: 3000,
  };

  constructor(props) {
    super(props);

    this.state = {
      opacity: new Animated.Value(0),
      yPosition: new Animated.Value(48),
    };
  }

  hideTimeout: number;

  componentDidMount() {
    if (this.props.visible) {
      this.show();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      this.props.visible ? this.show() : this.hide();
    }
  }

  show = () => {
    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue: 1,
        duration: SNACKBAR_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.yPosition, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.hideTimeout = setTimeout(this.hide, this.props.duration);
    });
  };

  hide = () => {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue: 0,
        duration: SNACKBAR_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.yPosition, {
        toValue: 48,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(this.props.onDismiss);
  };

  render() {
    const {
      content,
      action,
      onDismiss,
      theme: { fonts, colors },
      contentColor,
      backgroundColor,
    } = this.props;

    const buttonRightMargin = action ? 24 : 0;
    const contentRightMargin = action ? 0 : 24;

    return (
      <Animated.View
        style={{
          backgroundColor: backgroundColor || grey850,
          transform: [
            {
              translateY: this.state.yPosition,
            },
          ],
        }}
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
            <Animated.Text
              style={[
                styles.content,
                {
                  fontFamily: fonts.regular,
                  marginRight: contentRightMargin,
                  color: contentColor || white,
                },
              ]}
            >
              {content}
            </Animated.Text>
            {action ? (
              <View
                style={{
                  marginRight: buttonRightMargin,
                }}
              >
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.hide();
                    action.onPress();
                  }}
                >
                  <View>
                    <Text style={{ color: action.color || colors.accent }}>
                      {action.text}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            ) : null}
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: grey850,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    marginLeft: 24,
    marginVertical: 14,
    flexWrap: 'wrap',
    flex: 1,
    fontSize: 14,
  },
});

export default withTheme(SnackBar);
