import React from 'react';
import {
  Animated,
  Easing,
  View,
  Modal,
  AsyncStorage,
} from 'react-native';
import { Button, Icon, Text, Card } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import openMap from 'react-native-open-maps';
import DateTimePicker from 'react-native-modal-datetime-picker';
import PropTypes from 'prop-types';
import axios from 'axios';
import { keys } from '../config';
import { styles, rowStyle } from './Styles';
import { typeIds } from '../SampleData/Types';

export default class Row extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      extraData: {},
      modalVisible: false,
      isDateTimePickerVisible: false,
      time: '',
      text: '',
    };

    this.openNewMap = this.openNewMap.bind(this);
    this.dislikeEvent = this.dislikeEvent.bind(this);

    this.active = new Animated.Value(0);
  }

  componentWillMount() {
    if (this.props.data.placeId) {
      axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${this.props.data.placeId}&key=${keys.googleMapsAPI}`)
        .then((res) => {
          this.setState({ extraData: res.data.result });
        })
        .catch(err => console.error('google api error', err));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this.active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  openNewMap() {
    openMap({ latitude: this.props.data.latlng.lat, longitude: this.props.data.latlng.lng });
  }

  dislikeEvent() {
    this.state.extraData.types.forEach((type) => {
      if (typeIds[type]) {
        AsyncStorage.getItem('Token').then((res) => {
          const savedToken = JSON.parse(res);
          axios({
            method: 'post',
            url: 'http://18.218.102.64/user_like',
            headers: {
              authorization: savedToken,
              'Content-Type': 'application/json',
            },
            data: { id_type: typeIds[type], like: false },
          })
            .catch((err) => {
              console.error(`select interest post error ${err}`);
            });
        });
      }
    });
  }

  openModal() {
    this.setState({ modalVisible: true });
  }

  closeModal() {
    this.setState({ modalVisible: false });
  }

  showDateTimePicker() {
    this.setState({ isDateTimePickerVisible: true });
  }

  hideDateTimePicker() {
    this.setState({ isDateTimePickerVisible: false });
  }

  handleDatePicked(time) {
    this.setState({ time });
    this.hideDateTimePicker();
  }

  render() {
    const { data } = this.props;
    const { text } = this.state;
    const modalInfo = this.state.extraData || {};
    let openHoursText;

    if (modalInfo.opening_hours !== undefined || null) {
      openHoursText = modalInfo.opening_hours.weekday_text.map(item => (<Text>{item}</Text>))
    }

    return (
      <Animated.View style={[
          styles.row,
          rowStyle,
        ]}
      >
        <Icon
          name="plus-circle"
          type="font-awesome"
          color="#f50"
          style={{ padding: 2 }}
          onPress={this.openModal}
        />
        <View>
          <Modal
            visible={this.state.modalVisible}

            animationType="slide"

            onRequestClose={() => this.closeModal()}
          >
            <View style={styles.modalContainer}>
              <View style={styles.innerContainer}>
                <Card title={modalInfo.name !== undefined ? modalInfo.name : '...loading'}>
                  <Text>Phone Number: {'\n'} {modalInfo.formatted_phone_number !== undefined ? modalInfo.formatted_phone_number : '...loading'}{'\n'}</Text>
                  <Text>Address: {'\n'} {modalInfo.formatted_address !== undefined ? modalInfo.formatted_address : '...loading'}{'\n'}</Text>
                  <Text>Open Hours
                    {openHoursText}
                  </Text>
                  <View>
                    <TextField
                      label="Leave yourself some notes about the event"
                      value={text}
                      onChangeText={text => this.setState({ text })}
                    />
                  </View>
                  <View>
                    <Button
                      onPress={this.showDateTimePicker}
                      title="pick a start time"
                    />
                    <View>
                      <DateTimePicker
                        isVisible={this.state.isDateTimePickerVisible}
                        onConfirm={this.handleDatePicked}
                        onCancel={this.hideDateTimePicker}
                        mode="time"
                      />
                    </View>
                  </View>
                  <Button
                    title="View this event in your native maps app"
                    onPress={this.openNewMap}
                  />
                  <Button
                    title="I don't like this kind of event"
                    onPress={this.dislikeEvent}
                  />
                  <Button
                    onPress={() => this.closeModal()}
                    title="Close modal"
                  />
                </Card>
              </View>
            </View>
          </Modal>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.text}>{data.name}</Text>
        </View>
      </Animated.View>
    );
  }
}

Row.propTypes = {
  // name: PropTypes.string
  data: PropTypes.object,
};
