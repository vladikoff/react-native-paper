/* @flow */

import * as React from 'react';
import {
  View,
  Animated,
  TextInput as NativeTextInput,
  StyleSheet,
} from 'react-native';
import Text from './Typography/Text';
import withTheme from '../core/withTheme';
import type { Theme } from '../types';

const AnimatedText = Animated.createAnimatedComponent(Text);

const MINIMIZED_LABEL_Y_OFFSET = -22;
const MAXIMIZED_LABEL_FONT_SIZE = 16;
const MINIMIZED_LABEL_FONT_SIZE = 12;
const LABEL_WIGGLE_X_OFFSET = 4;

type Props = {
  /**
   * If true, user won't be able to interact with the component.
   */
  disabled?: boolean,
  /**
   * The text to use for the floating label.
   */
  label?: string,
  /**
   * Placeholder for the input.
   */
  placeholder?: string,
  /**
   * Whether to style the TextInput with error style.
   */
  hasError?: boolean,
  /**
   * Callback that is called when the text input's text changes. Changed text is passed as an argument to the callback handler.
   */
  onChangeText?: Function,
  /**
   * Underline color of the input.
   */
  underlineColor?: string,
  /**
   * Whether the input can have multiple lines.
   */
  multiline?: boolean,
  /**
   * The number of lines to show in the input (Android only).
   */
  numberOfLines?: number,
  /**
   * Callback that is called when the text input is focused.
   */
  onFocus?: Function,
  /**
   * Callback that is called when the text input is blurred.
   */
  onBlur?: Function,
  /**
   * Value of the text input.
   */
  value?: string,
  style?: any,
  /**
   * @optional
   */
  theme: Theme,
};

type State = {
  focused: Animated.Value,
  errorShown: Animated.Value,
  placeholder: ?string,
};

/**
 * TextInputs allow users to input text.
 *
 * <div class="screenshots">
 *   <figure>
 *     <img src="screenshots/textinput.unfocused.png" />
 *     <figcaption>Unfocused</span>
 *   </figure>
 *   <figure>
 *     <img src="screenshots/textinput.focused.png" />
 *     <figcaption>Focused</figcaption>
 *   </figure>
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { TextInput } from 'react-native-paper';
 *
 * class MyComponent extends React.Component {
 *   state = {
 *     text: ''
 *   };
 *
 *   render(){
 *     return (
 *       <TextInput
 *         label='Email'
 *         value={this.state.text}
 *         onChangeText={text => this.setState({ text })}
 *       />
 *     );
 *   }
 * }
 * ```
 *
 * @extends TextInput props https://facebook.github.io/react-native/docs/textinput.html#props
 *
 */

class TextInput extends React.Component<Props, State> {
  static defaultProps = {
    disabled: false,
    hasError: false,
    multiline: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      focused: new Animated.Value(0),
      errorShown: new Animated.Value(props.hasError ? 1 : 0),
      placeholder: '',
    };
  }

  state: State;

  componentWillReceiveProps(nextProps) {
    if (nextProps.hasError !== this.props.hasError) {
      (nextProps.hasError ? this._animateFocus : this._animateBlur)(
        this.state.errorShown
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.value !== this.props.value ||
        prevProps.placeholder !== this.props.placeholder) &&
      this.props.value === ''
    ) {
      this._setPlaceholder();
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  _setPlaceholder = () => {
    clearTimeout(this._timer);

    this._timer = setTimeout(
      () =>
        this.setState({
          placeholder: this.props.placeholder,
        }),
      50
    );
  };

  _removePlaceholder = () =>
    this.setState({
      placeholder: '',
    });

  _timer: TimeoutID;

  _root: NativeTextInput;

  _animateFocus = (animatedValue: Animated.Value) => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
    }).start(this._setPlaceholder);
  };

  _animateBlur = (animatedValue: Animated.Value) => {
    this._removePlaceholder();
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 180,
    }).start();
  };

  _handleFocus = (...args) => {
    this._animateFocus(this.state.focused);
    if (this.props.onFocus) {
      this.props.onFocus(...args);
    }
  };

  _handleBlur = (...args) => {
    this._animateBlur(this.state.focused);
    if (this.props.onBlur) {
      this.props.onBlur(...args);
    }
  };

  setNativeProps(...args) {
    return this._root.setNativeProps(...args);
  }

  isFocused(...args) {
    return this._root.isFocused(...args);
  }

  clear(...args) {
    return this._root.clear(...args);
  }

  focus(...args) {
    return this._root.focus(...args);
  }

  blur(...args) {
    return this._root.blur(...args);
  }

  render() {
    const {
      value,
      disabled,
      label,
      hasError,
      underlineColor,
      style,
      theme,
      ...rest
    } = this.props;
    const { colors, fonts } = theme;
    const fontFamily = fonts.regular;
    const {
      primary: primaryColor,
      disabled: inactiveColor,
      error: errorColor,
      errorText: errorTextColor,
    } = colors;

    let inputTextColor, labelColor, bottomLineColor;

    if (!disabled) {
      inputTextColor = colors.text;
      labelColor = (hasError && errorTextColor) || primaryColor;
      bottomLineColor = underlineColor || primaryColor;
    } else {
      inputTextColor = labelColor = bottomLineColor = inactiveColor;
    }

    const labelColorAnimation = this.state.focused.interpolate({
      inputRange: [0, 1],
      outputRange: [inactiveColor, labelColor],
    });

    /* Wiggle when error appears and label is minimized */
    const labelTranslateX =
      value && hasError
        ? this.state.errorShown.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, LABEL_WIGGLE_X_OFFSET, 0],
          })
        : 0;

    /* Move label to top if value is set */
    const labelTranslateY = value
      ? MINIMIZED_LABEL_Y_OFFSET
      : this.state.focused.interpolate({
          inputRange: [0, 1],
          outputRange: [0, MINIMIZED_LABEL_Y_OFFSET],
        });

    const labelFontSize = value
      ? MINIMIZED_LABEL_FONT_SIZE
      : this.state.focused.interpolate({
          inputRange: [0, 1],
          outputRange: [MAXIMIZED_LABEL_FONT_SIZE, MINIMIZED_LABEL_FONT_SIZE],
        });

    const labelStyle = {
      color: labelColorAnimation,
      fontFamily,
      fontSize: labelFontSize,
      transform: [
        { translateX: labelTranslateX },
        { translateY: labelTranslateY },
      ],
    };

    const getBottomLineStyle = (
      color: string,
      animatedValue: Animated.Value
    ) => ({
      backgroundColor: color,
      transform: [{ scaleX: animatedValue }],
      opacity: animatedValue.interpolate({
        inputRange: [0, 0.1, 1],
        outputRange: [0, 1, 1],
      }),
    });

    return (
      <View style={style}>
        <AnimatedText
          pointerEvents="none"
          style={[styles.placeholder, labelStyle]}
        >
          {label}
        </AnimatedText>
        <NativeTextInput
          {...rest}
          ref={c => {
            this._root = c;
          }}
          value={value}
          placeholder={this.state.placeholder}
          placeholderTextColor={colors.placeholder}
          editable={!disabled}
          selectionColor={labelColor}
          onFocus={this._handleFocus}
          onBlur={this._handleBlur}
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            rest.multiline && styles.multiline,
            {
              color: inputTextColor,
              fontFamily,
            },
          ]}
        />
        <View pointerEvents="none" style={styles.bottomLineContainer}>
          <View
            style={[
              styles.bottomLine,
              { backgroundColor: hasError ? errorColor : inactiveColor },
            ]}
          />
          <Animated.View
            style={[
              styles.bottomLine,
              styles.focusLine,
              getBottomLineStyle(bottomLineColor, this.state.focused),
            ]}
          />
          <Animated.View
            style={[
              styles.bottomLine,
              styles.focusLine,
              getBottomLineStyle(
                errorColor,
                // $FlowFixMe$
                Animated.multiply(this.state.focused, this.state.errorShown)
              ),
            ]}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    left: 0,
    top: 38,
    fontSize: 16,
  },
  input: {
    minHeight: 64,
    paddingTop: 20,
    paddingBottom: 0,
    marginTop: 8,
    marginBottom: -4,
  },
  multiline: {
    paddingTop: 30,
  },
  bottomLineContainer: {
    marginBottom: 4,
    height: StyleSheet.hairlineWidth * 4,
  },
  bottomLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: StyleSheet.hairlineWidth,
  },
  focusLine: {
    height: StyleSheet.hairlineWidth * 4,
  },
});

export default withTheme(TextInput);
