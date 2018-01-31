import React from 'react';
import { Text, View, ImageBackground, AsyncStorage, Alert } from 'react-native';
import { Button, Header, Icon } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import axios from 'axios';
import PropTypes from 'prop-types';
import Trip from './Trip';
import goldenGate from '../img/GoldenGate.jpg';
import { styles } from './Styles';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Schedules the user is attending, as creator or attender
      schedules: [],
      // Schedules the user has been invited to, but has yet to accept
      invitedSchedules: [],
    };
    this.signout = this.signout.bind(this);
    this.acceptTrip = this.acceptTrip.bind(this);
    this.rejectTrip = this.rejectTrip.bind(this);
  }

  componentWillMount() {
    // Get the authentication token from storage
    AsyncStorage.getItem('Token')
      // Make a request to get the user's schedules from the database
      .then(res => axios.get('http://18.218.102.64/dashboard', { headers: { authorization: JSON.parse(res) } }))
      .then((res) => {
        // We only have the schedule id, so we need another request to get the name of each schedule
        res.data.forEach((userSchedule) => {
          axios.get(`http://18.218.102.64/schedule/${userSchedule.id_schedule}`)
            .then((response) => {
              const schedule = response.data;
              // Once we have the extra information, we only need bits of it,
              // so we filter those out here
              const fullSchedule = {
                id: userSchedule.id_schedule,
                status: userSchedule.status,
                name: schedule.name,
              };
              // Users can be invitees, attenders, or creators, so we have to sort it accordingly
              if (fullSchedule.status === 'invited') {
                // Users will recieve an alert for these
                this.setState({
                  invitedSchedules: this.state.invitedSchedules.concat([fullSchedule]),
                });
              } else if (fullSchedule.status === 'attending' || fullSchedule.status === 'creator') {
                // These will be listed as trips they're attending
                this.setState({ schedules: this.state.schedules.concat([fullSchedule]) });
              }
            })
            .catch(err => console.error('error', err));
        });
      })
      .catch(error => console.error('error', error));
  }

  componentDidMount() {
    // First thing, we send the user an alert if they have a new schedule
    this.state.invitedSchedules.forEach((schedule) => {
      Alert.alert(
        'You\'ve been invited on a trip!',
        `Would you like to join on this trip to ${schedule.name}?`,
        [
          { text: 'Yes!', onPress: () => this.acceptTrip(schedule) },
          { text: 'No thanks', onPress: () => this.rejectTrip(schedule) },
        ],
      );
    });
  }

  acceptTrip(trip) {
    // This route changes the user status from "invited" to "attending" in the database
    AsyncStorage.getItem('Token')
      .then(token => axios.post('http://18.218.102.64/accept_invite', { scheduleId: trip.id, accepted: true, headers: { authorization: token } }))
      .then(() => {
        // The trip is immediately added, so that they won't have to refresh to see it
        this.setState({ schedules: this.state.schedules.concat(trip) });
      })
      .catch(err => console.error(err));
  }

  rejectTrip(trip) {
    // This route deletes the entry linking user and schedule
    AsyncStorage.getItem('Token')
      .then(token => axios.post('http://18.218.102.64/accept_invite', { scheduleId: trip.id, accepted: false, headers: { authorization: token } }))
      .then(success => console.log(success))
      .catch(err => console.error(err));
  }

  signout() {
    axios.get('http://18.218.102.64/logout')
      .then((res) => {
        console.log(res.data);
        // Destroys the token so that the user is no longer authorized
        AsyncStorage.removeItem('Token');
        // Take the user back to the login page without the ability to hit a back button
        this.props.navigation
          .dispatch(NavigationActions.reset({
            index: 0,
            actions:
              [NavigationActions.navigate({ routeName: 'Login' })],
          }));
      })
      .catch(err => console.error(err));
  }

  render() {
    // Build out the trip components from the schedules recieved from the database
    const trips = this.state.schedules
      .map(event =>
        (<Trip
          navigation={this.props.navigation}
          schedule={event}
          key={event.name}
        />));
    return (
      <ImageBackground
        style={styles.dashboardImageBackground}
        source={goldenGate}
      >
        <Header
          statusBarProps={{ barStyle: 'light-content' }}
          outerContainerStyles={{ backgroundColor: '#0e416d' }}
          centerComponent={{ text: 'wander', style: { color: '#fff', fontSize: 30 } }}
          leftComponent={<Icon
            name="home"
            color="#fff"
          />}
        />
        <View style={styles.dashboardContainer}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Home</Text>
            {trips}
            <Button
              title="Plan a new trip"
              buttonStyle={{ backgroundColor: '#0e416d', borderRadius: 10 }}
              onPress={() => this.props.navigation.navigate('NewItinerary')}
            />
          </View>
          <Button
            small
            raised
            buttonStyle={{ backgroundColor: '#0e416d', borderRadius: 10 }}
            style={{ alignItems: 'flex-end', position: 'absolute', bottom: -100 }}
            title="Sign out"
            onPress={this.signout}
          />
          <Button
            title="Scan a QR code"
            onPress={() => this.props.navigation.navigate('QRScanner')}
          />
        </View>
      </ImageBackground>
    );
  }
}

Dashboard.navigationOptions = () => ({
  header: null,
});

Dashboard.propTypes = {
  navigation: PropTypes.object,
};
