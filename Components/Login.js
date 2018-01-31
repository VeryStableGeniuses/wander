import React from 'react';
import { StyleSheet, ImageBackground, Text, View, AsyncStorage } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FormInput, Button } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import NYC from '../img/NYC.jpg';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  button: {
    backgroundColor: '#fff',
  },
  title: {
    paddingBottom: 16,
    textAlign: 'center',
    color: '#404d5b',
    fontSize: 40,
    fontWeight: 'bold',
    opacity: 0.8,
    backgroundColor: '#000000',
  },
  input: {
    marginTop: 4,
    color: 'white',
    textAlign: 'center',
  },
});

export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
    this.login = this.login.bind(this);
  }

  login() {
    // Get the stuff that we need for the login request
    const user = { email: this.state.email, password: this.state.password };
    // Make a request to the login route
    axios.post('http://18.218.102.64/login', user)
      .then((res) => {
        // If the password is incorrect, do some error handling
        if (res.data === 'Password is incorrect') {
          alert('Sorry, there was a problem with your email/password combination. Please try again. Remember, email AND password are case sensitive');
          // Otherwise, save the token on the user's device and send them to the dashboard
        } else {
          const token = res.data.slice(4);
          AsyncStorage.setItem('Token', JSON.stringify(token));
          this.props.navigation
          // This prevents the user from having the ability to go back
            .dispatch(NavigationActions.reset({
              index: 0,
              actions:
                [NavigationActions.navigate({ routeName: 'Dashboard' })],
            }));
        }
      })
      .catch((err) => {
        console.error('Login error ', err);
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
        source={NYC}
      >
        <View style={{ height: 100 }} />
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
          <Text style={{ fontSize: 30, color: 'white' }}>email</Text>
          <FormInput
            keyboardType="email-address"
            style={styles.input}
            onChangeText={text => this.setState({ email: text })}
            placeholder="enter email"
            placeholderTextColor="black"
            autoCapitalize="none"
          />
          <Text style={{ fontSize: 30, color: 'white' }}>password</Text>
          <FormInput
            style={styles.input}
            onChangeText={text => this.setState({ password: text })}
            placeholder="enter password"
            placeholderTextColor="white"
            secureTextEntry
          />

          <Button
            large
            raised
            buttonStyle={{
              backgroundColor: '#0e416d',
              borderRadius: 10,
              alignSelf: 'flex-end',
              marginTop: 10,
            }}
            onPress={this.login}
            title="login"
            icon={{ name: 'home', size: 32 }}
          />

          <Button
            large
            raised
            buttonStyle={{
              backgroundColor: '#0e416d',
              borderRadius: 10,
              alignSelf: 'flex-end',
              position: 'relative',
              marginTop: 10,
            }}
            onPress={() => this.props.navigation.navigate('Signup')}
            icon={{ name: 'edit', size: 32 }}
            title="signup"
          />
        </KeyboardAwareScrollView>
      </ImageBackground>
    );
  }
}

Login.navigationOptions = () => ({
  header: null,
});

Login.propTypes = {
  navigation: PropTypes.object,
};
