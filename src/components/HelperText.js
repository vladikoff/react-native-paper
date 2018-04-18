/* @flow */

import * as React from 'react';
import colorModule from 'color';
import { View, Animated, StyleSheet } from 'react-native';
import Text from './Typography/Text';
import withTheme from '../core/withTheme';
import { black, white } from '../styles/colors';
import type { Theme } from '../types';

const helperTextHeight = 16;

type Props = {
  /**
   * Helper text to display.
   */
  helperText?: string,
  /**
   * Whether to style the TextInput with error style.
   */
  hasError?: boolean,
  /**
   * @optional
   * Text to replace the helper text with on error. If none set, will use the helperText value.
   */
  errorText?: string,
  /**
   * Text color to use.
   */
  color?: string,
  /**
   * Optional style to apply to the container.
   */
  style?: any,
  /**
   * @optional
   */
  theme: Theme,
};

type State = {
  errorShown: Animated.Value,
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
 *         <HelperText
 *           helperText="Helper Text"
 *           errorText="Error!"
 *           hasError={this.state.text.length > 12}
 *         />
 *       </View>
 *     );
 *   }
 * }
 * ```
 */
class HelperText extends React.Component<Props, State> {
  static defaultProps = {
    hasError: false,
  };

  state = {
    errorShown: new Animated.Value(this.props.hasError ? 1 : 0),
    };

  state: State;

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasError !== this.props.hasError) {
      (nextProps.hasError ? this._animateFocus : this._animateBlur)(
        this.state.errorShown
      );
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  _timer: any;
  _root: any;
  _setRef: any = (c: Object) => {
    this._root = c;
  };

  _animateFocus = (animatedValue: Animated.Value) => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
    }).start();
  };

  _animateBlur = (animatedValue: Animated.Value) => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 180,
    }).start();
  };

  getHelperTextColor(dark: boolean) {
    return dark
      ? colorModule(white)
          .alpha(0.7)
          .rgb()
          .string()
      : colorModule(black)
          .alpha(0.54)
          .rgb()
          .string();
  }

  renderUnderlineText(text?: string, containerStyle: Object, color: string) {
    return (
      text && (
        <Animated.View style={containerStyle}>
          {text && <Text style={[styles.helperText, { color }]}>{text}</Text>}
        </Animated.View>
      )
    );
  }

  render() {
    const { helperText, hasError, errorText, style, theme, color } = this.props;
    const { colors, dark } = theme;
    const { errorText: errorTextColor } = colors;

    const helperTextColor =
      color || (hasError && errorTextColor) || this.getHelperTextColor(dark);

    const underlineArea = {
      height: Animated.multiply(
        helperTextHeight,
        helperText ? 1 : errorText ? this.state.errorShown : 0
      ),
      width: '100%',
    };

    const helperTextContainer = {
      opacity: errorText
        ? Animated.add(1, Animated.multiply(this.state.errorShown, -1))
        : 1,
    };

    const errorTextContainer = {
      position: 'absolute',
      opacity: this.state.errorShown,
      transform: [
        {
          translateY: this.state.errorShown.interpolate({
            inputRange: [0, 1],
            outputRange: [-helperTextHeight, 0],
          }),
        },
      ],
    };

    return (
      <View style={style}>
        {helperText || errorText ? (
          <Animated.View style={underlineArea}>
            {this.renderUnderlineText(
              helperText,
              helperTextContainer,
              helperTextColor
            )}
            {this.renderUnderlineText(
              errorText,
              errorTextContainer,
              errorTextColor
            )}
          </Animated.View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default withTheme(HelperText);
