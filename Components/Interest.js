import React from 'react';
import { AsyncStorage } from 'react-native';
import { Button } from 'react-native-elements';
import axios from 'axios';
import PropTypes from 'prop-types';
import { icons } from '../SampleData/Types';

export default class Interest extends React.Component {
  constructor(props) {
    super(props);
    this.selectInterest = this.selectInterest.bind(this);
    this.state = {
      // Keep track of whether or not a button has been selected
      status: false,
    };
  }

  selectInterest() {
    // Toggle the status so that the style changes
    this.setState({ status: !this.state.status });
    // Add an entry to the database showing that this user likes this type of event
    AsyncStorage.getItem('Token').then((res) => {
      const savedToken = JSON.parse(res);
      if (this.state.status) {
        axios({
          method: 'post',
          url: 'http://18.218.102.64/user_like',
          headers: {
            authorization: savedToken,
            'Content-Type': 'application/json',
          },
          data: { id_type: this.props.type.id, like: true },
        })
          .then((response) => {
          })
          .catch((err) => {
            console.error(`select interest post error ${err}`);
          });
      } else {
        axios({
          method: 'delete',
          url: 'http://18.218.102.64/user_like',
          headers: {
            authorization: savedToken,
          },
          params: { id_type: this.props.type.id, like: false },
        })
          .then((response) => {
            console.log(`user like delete response ${response}`);
          })
          .catch((err) => {
            console.error(`select interest delete error ${err}`);
          });
      }
    });
  }

  render() {
    return (
      <Button
        large
        raised
        buttonStyle={{ backgroundColor: this.state.status ? '#0b81e8' : '#0e416d', width: 500, marginVertical: 5 }}
        onPress={this.selectInterest}
        icon={{ name: icons[this.props.type.name], type: 'font-awesome' }}
        title={this.props.name}
      />
    );
  }
}

Interest.propTypes = {
  name: PropTypes.string,
  type: PropTypes.object,
};
