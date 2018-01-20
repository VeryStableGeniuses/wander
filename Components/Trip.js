import React from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
});

export default class Trip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
    // console.log('trip props', this.props.schedule);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.props.schedule.name}</Text>
        <Button
          onPress={() => this.props.navigation.navigate('Itinerary', { dayInfo: this.props.schedule })}
          title="View this trip"
        />
      </View>
    );
  }
}

Trip.propTypes = {
  navigation: PropTypes.object,
};
