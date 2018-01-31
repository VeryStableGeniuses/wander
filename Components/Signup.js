import React from 'react';
import { ImageBackground, AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FormInput, Button } from 'react-native-elements';
import axios from 'axios';
import { NavigationActions } from 'react-navigation';
import Chicago from '../img/Chicago.jpg';
import { styles } from './Styles';

export default class Signup extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      username: '',
    };
    this.signup = this.signup.bind(this);
  }
  signup() {
    // We only need email, password, and username to create a user
    const user = {
      email: this.state.email,
      password: this.state.password,
      username: this.state.username,
    };
    axios.post('http://18.218.102.64/signup', user)
      .then((res) => {
        // If the user wasn't created, give the user the option to try again
        if (res.data === 'User was not created') {
          alert('There was a problem. Please try again');
        // Otherwise, save their token and send them to GatherInterests
        } else {
          AsyncStorage.setItem('Token', JSON.stringify(res.data));
          this.props.navigation
            .dispatch(NavigationActions.reset({
              index: 0,
              actions:
                [NavigationActions.navigate({ routeName: 'GatherInterests' })],
            }));
        }
      })
      .catch((err) => {
        console.error('signup error ', err);
      });
  }
  render() {
    return (
      <ImageBackground
        style={{
          backgroundColor: '#000000',
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
        }}
        source={Chicago}
      >
        <KeyboardAwareScrollView contentContainerStyle={styles.signupContainer}>
          <FormInput
            style={styles.signupFormInput}
            keyboardType="email-address"
            onChangeText={text => this.setState({ email: text })}
            placeholder="Enter your email address"
            placeholderTextColor="white"
          />
          <FormInput
            style={styles.signupFormInput}
            placeholder="Enter a username"
            placeholderTextColor="white"
            onChangeText={text => this.setState({ username: text })}
          />
          <FormInput
            style={styles.signupFormInput}
            placeholder="Enter a password"
            placeholderTextColor="white"
            secureTextEntry
            onChangeText={text => this.setState({ password: text })}
          />
          <Button
            large
            raised
            buttonStyle={{ backgroundColor: '#0e416d', borderRadius: 10, marginTop: 10 }}
            title="Create your account"
            onPress={this.signup}
          />
        </KeyboardAwareScrollView>
      </ImageBackground>
    );
  }
}

Signup.navigationOptions = () => ({
  header: null,
});

Signup.propTypes = {
  navigation: PropTypes.object,
};
