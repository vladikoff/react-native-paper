/* @flow */

import * as React from 'react';
import color from 'color';
import { Animated, StyleSheet } from 'react-native';
import Text from './Typography/Text';
import withTheme from '../core/withTheme';
import type { Theme } from '../types';

type Props = {
  /**
   * Type of the helper text. One of: 'error' or 'text'. Defaults to 'info'.
   */
  type: 'error' | 'info',
  /**
   * Whether to display the helper text.
   */
  visible?: boolean,
  /**
   * Additional style to apply to the container.
   */
  style?: any,
  /**
   * Text content.
   */
  children: React.Node,
  /**
   * @optional
   */
  theme: Theme,
};

type State = {
  shown: Animated.Value,
  textHeight: number,
};

/**
 * Helper text is used in conjuction with input elements to provide additional hints for the user.
 *
 * <div class="screenshots">
 *   <figure>
 *     <img src="screenshots/textinput-helpertext.png" />
 *     <figcaption>Without error</span>
 *   </figure>
 *   <figure>
 *     <img src="screenshots/textinput-helpertext-error.png" />
 *     <figcaption>With error</figcaption>
 *   </figure>
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { HelperText, TextInput } from 'react-native-paper';
 *
 * class MyComponent extends React.Component {
 *   state = {
 *     text: ''
 *   };
 *
 *   render(){
 *     return (
 *       <View>
 *         <TextInput
 *           label="Email"
 *           value={this.state.text}
 *           onChangeText={text => this.setState({ text })}
 *         />
 *         <HelperText type='info'>
             Info text
           </HelperText>
 *
 *       </View>
 *     );
 *   }
 * }
 * ```
 */
class HelperText extends React.PureComponent<Props, State> {
  static defaultProps = {
    type: 'info',
    visible: true,
  };

  state = {
    shown: new Animated.Value(this.props.visible ? 1 : 0),
    textHeight: 0,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        this._animateFocus();
      } else {
        this._animateBlur();
      }
    }
  }

  _animateFocus = () => {
    Animated.timing(this.state.shown, {
      toValue: 1,
      duration: 150,
    }).start();
  };

  _animateBlur = () => {
    Animated.timing(this.state.shown, {
      toValue: 0,
      duration: 180,
    }).start();
  };

  _getTextColor = () => {
    const {
      colors: { text, error },
      dark,
    } = this.props.theme;
    switch (this.props.type) {
      case 'error':
        return error;
      case 'info':
      default:
        return color(text)
          .alpha(dark ? 0.7 : 0.54)
          .rgb()
          .string();
    }
  };

  _onTextLayout = ({ nativeEvent }) => {
    this.setState({ textHeight: nativeEvent.layout.height });
  };

  render() {
    const { style, type, visible } = this.props;
    const textContainerStyle = {
      paddingVertical: 4,
      opacity: this.state.shown,
      transform:
        visible && type === 'error'
          ? [
              {
                translateY: this.state.shown.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-this.state.textHeight, 0],
                }),
              },
            ]
          : [],
    };

    return (
      <Animated.View style={[textContainerStyle, style]}>
        <Text
          onLayout={this._onTextLayout}
          style={[styles.text, { color: this._getTextColor() }]}
        >
          {this.props.children}
        </Text>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
  },
});

export default withTheme(HelperText);
