import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import { Button, Header } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import axios from 'axios';
import PropTypes from 'prop-types';
import Interest from './Interest';
import { styles } from './Styles';
import { typePlurals } from '../SampleData/Types';

export default class GatherInterests extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      types: [],
    };
  }

  componentWillMount() {
    // Get all the event types out of the database
    axios.get('http://18.218.102.64/types')
      .then(response => this.setState({ types: response.data.map(type => type) }))
      .catch(error => console.error(error));
  }

  render() {
    // Map over the types and create an Interest component for each, which is essentially a button
    const interests = this.state.types.map(type => (
      <Interest
        name={typePlurals[type.name]}
        type={type}
        navigation={this.props.navigation}
        key={typePlurals[type.name]}
      />));
    return (
      <View>
        <Header
        statusBarProps={{ barStyle: 'light-content' }}
        outerContainerStyles={{ backgroundColor: 'black' }}
        centerComponent={{ text: 'wander', style: { color: 'white', fontSize: 30 } }}
        // leftComponent={<Icon
        //   name="home"
        //   color="white"
        // />
      />
        <ScrollView contentContainerStyle={styles.gatherInterestsContainer} >
          <Text style={styles.gatherInterestsTitleText}>wander</Text>
          <Text style={{ fontSize: 18 }}>Tell us what you like to do when you're on vacation</Text>
          {interests || <Text>loading</Text>}
          <Button
            large
            buttonStyle={{ 
              backgroundColor: '#0b81e8',
              width: 300,
              marginVertical: 5,
              borderRadius: 10,
              marginTop: 10,
              borderColor: 'black',
              borderWidth: 2,
              marginBottom: 100
            }}
            title="Next"
            onPress={() => this.props.navigation
              .dispatch(NavigationActions.reset({
                index: 0,
                actions:
                  [NavigationActions.navigate({ routeName: 'Dashboard' })],
              }))}
          />
        </ScrollView>
        </View>
    );
  }
}

GatherInterests.navigationOptions = () => ({
  header: null,
});

GatherInterests.propTypes = {
  navigation: PropTypes.object,
};
