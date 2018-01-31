import React from 'react';
import { StyleSheet, Text, View, AsyncStorage } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';
import axios from 'axios';
import PropTypes from 'prop-types';

// Honestly, most of this component was copied and pasted from the docs
// But it works. Don't touch it
export default class QRScanner extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
    };
  }

  async componentWillMount() {
    // Ask for camera permission first thing
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  handleBarCodeRead({ data }) {
    // Make a request to join in on a trip, using the trip number you got from the qr code
    // and the user's token to get the id
    AsyncStorage.getItem('Token')
      .then((token) => {
        const body = { scheduleId: data };
        return axios({
          url: 'http://18.218.102.64/join_schedule',
          method: 'post',
          headers: {
            authorization: JSON.parse(token),
            'Content-Type': 'application/json',
          },
          data: body,
        });
      })
      // Send the user back to the dashboard. They should see the new schedule immediately
      .then(() => this.props.navigation.navigate('Dashboard'))
      .catch(err => console.error(err));
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={{ flex: 1 }}>
        <BarCodeScanner
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          onBarCodeRead={this.handleBarCodeRead}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }
}

QRScanner.propTypes = {
  navigation: PropTypes.object,
};
