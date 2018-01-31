import React from 'react';
import { Text, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
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
    this.handleNext = this.handleNext.bind(this);
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
      <ScrollView contentContainerStyle={styles.gatherInterestsContainer} >
        <Text style={styles.gatherInterestsTitleText}>wander</Text>
        <Text style={{ fontSize: 18 }}>Tell us what you like to do when you're on vacation</Text>
        {interests || <Text>loading</Text>}
        <Button
          large
          raised
          buttonStyle={{ backgroundColor: 'green' }}
          title="Next"
          onPress={() => this.props.navigation.navigate('Dashboard')}
        />
      </ScrollView>
    );
  }
}

GatherInterests.navigationOptions = () => ({
  header: null,
});

GatherInterests.propTypes = {
  navigation: PropTypes.object,
};
