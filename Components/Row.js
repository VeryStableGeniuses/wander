import React from 'react';
import {
  Animated,
  Easing,
  Dimensions,
  Platform,
  View,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import { Button, Icon, Text, Card } from 'react-native-elements';
import { SlideAnimation } from 'react-native-popup-dialog';
import axios from 'axios';
import { keys } from '../config';
import { styles } from './Styles';


const window = Dimensions.get('window');

const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});

export default class Row extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      extraData: {},
      modalVisible: false,
    };

    this._active = new Animated.Value(0);

    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),
    };
  }

  componentWillMount() {
    if (this.props.data.placeId) {
      axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${this.props.data.placeId}&key=${keys.googleMapsAPI}`)
        .then((res) => {
          this.setState({ extraData: res.data.result });
          // console.log(res.data);
        })
        .catch(err => console.error('google api error', err));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  openModal() {
    this.setState({ modalVisible: true });
  }

  closeModal() {
    this.setState({ modalVisible: false });
  }


  render() {
    const { data } = this.props;

    // console.log(this.state.extraData, 'from extra data');
    // const modalInfo = this.state.extraData;

    const modalInfo  =  this.state.extraData || {};

    // console.log( modalInfo.opening_hours.weekday_text );

    return (
      <Animated.View style={[
          styles.row,
          this._style,
        ]}
      >
        <Icon
          name="plus-circle"
          type="font-awesome"
          color="#f50"
          style={{ padding: 2 }}
          onPress={() => {
            this.openModal()
            }
          }
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
                  <Text>Phone Number: {modalInfo.formatted_phone_number !== undefined ? modalInfo.formatted_phone_number : '...loading'}</Text>
                  <Text>{modalInfo.formatted_address !== undefined ? modalInfo.formatted_address : '...loading'}</Text>
                  <Text>Open Hours {""}{modalInfo.rating}</Text>
                </Card>
                <Button
                  onPress={() => this.closeModal()}
                  title="Close modal"
                />
              </View>
            </View>
          </Modal>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.text}>{data.name}</Text>
        </View>
        {/* <Image source={{uri: data.image}} style={styles.image} /> */}
      </Animated.View>
    );
  }
}
