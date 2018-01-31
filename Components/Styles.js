import { StyleSheet, Platform, Animated, Dimensions } from 'react-native';

const window = Dimensions.get('window');

module.exports.styles = StyleSheet.create({
  // Dashboard page
  dashboardContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  dashboardImageBackground: {
    backgroundColor: '#000000',
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  // Event page
  eventContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Login page
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  loginButton: {
    backgroundColor: '#0e416d',
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  loginInput: {
    marginTop: 4,
    color: 'white',
    textAlign: 'center',
  },
  // New Itinerary page
  newItineraryContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Trip page
  tripContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  tripModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 127, 127, 0.75)',
  },
  tripModalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  tripModalButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Schedule page
  scheduleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
    }),
  },
  scheduleList: {
    flex: 1,
  },
  scheduleContentContainer: {
    width: window.width,

    ...Platform.select({
      ios: {
        paddingHorizontal: 30,
      },

      android: {
        paddingHorizontal: 0,
      },
    }),
  },
  // GatherInterests page
  gatherInterestsContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  gatherInterestsTitleText: {
    backgroundColor: '#fff',
    alignItems: 'center',
    fontSize: 60,
    fontWeight: 'bold',
  },
  // Signup page
  signupContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupFormInput: {
    height: 40,
    width: 300,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
  },
  // Row.js
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    height: 90,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 25,

    ...Platform.select({
      ios: {
        width: window.width - 30 * 2,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: { height: 2, width: 2 },
        shadowRadius: 2,
      },

      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 30,
      },
    }),
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    alignItems: 'center',
    padding: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(127, 127, 127, 0.75)',
  },
  innerContainer: {
    alignItems: 'center',
  },
});

this.active = new Animated.Value(0);

module.exports.rowStyle = {
  ...Platform.select({
    ios: {
      transform: [{
        scale: this.active.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      }],
      shadowRadius: this.active.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 10],
      }),
    },

    android: {
      transform: [{
        scale: this.active.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.07],
        }),
      }],
      elevation: this.active.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 6],
      }),
    },
  }),
};
