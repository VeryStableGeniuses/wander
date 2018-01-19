const axios = require('axios');
// const google = require('./SampleData/google');
// const predictHQ = require('./SampleData/google');
// const zomato = require('./SampleData/zomato');
const { keys } = require('./config');



// Get the restaurants from Zomato data
// const { restaurants } = zomato;

// console.log(predictHQ);

const attractionTimes = {
  amusement_park: 12,
  aquarium: 3,
  art_gallery: 3,
  book_store: 1,
  bowling_alley: 2,
  casino: 3,
  clothing_store: 1,
  point_of_interest: 3,
  shopping_mall: 3,
  library: 2,
  movie_theater: 3,
  museum: 5,
  night_club: 3,
  park: 1,
  stadium: 5,
  zoo: 5,
};

// Helper function to get the distance between two locations with lat/lng
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1)
    * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  dist *= 1.609344;
  return dist;
};

// Helper function to rank the likelihood that a user is interested in an event balanced with
// how close that event is to the most recent event
const makeRankings = (googleData, predictHQ, interests, dislikes) => {
  const possibilities = googleData.results
    .filter((event) => {
      for (let i = 0; i < event.types.length; i++) {
        if (interests.includes(event.types[i]) && event.name !== 'Walking Tours' && !dislikes.includes(event.types[i])) {
          return event;
        }
      }
    })
    .sort((a, b) => b.rating - a.rating);

  let sortedByDistance = possibilities.slice(1);
  sortedByDistance.forEach((event) => {
    event.distanceFromTopRated = calculateDistance(
      possibilities[0].geometry.location.lat,
      possibilities[0].geometry.location.lng,
      event.geometry.location.lat,
      event.geometry.location.lng,
    );
  });
  sortedByDistance = sortedByDistance.sort((a, b) =>
    a.distanceFromTopRated - b.distanceFromTopRated);

  sortedByDistance.forEach((event) => {
    event.ranking = (event.rating - event.distanceFromTopRated) / 5;
  });

  sortedByDistance.unshift(possibilities[0]);

  return sortedByDistance;
};

const findRestaurant = (location, time, restaurants) => {
  restaurants.forEach(restaurant =>
    calculateDistance(
      location.geometry.location.lat,
      location.geometry.location.lng,
      Number(restaurant.restaurant.location.latitude),
      Number(restaurant.restaurant.location.longitude),
    ));
  const sorted = restaurants.sort((a, b) => a.distanceFromTopRated - b.distanceFromTopRated);
  if (time === 9) {
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].restaurant.cuisines.includes('breakfast') || sorted[i].restaurant.cuisines.includes('bakery') || sorted[i].restaurant.cuisines.includes('donuts')) {
        const result = sorted[i];
        sorted.splice(i, 1);
        return result;
      }
    }
  } else {
    const result = sorted[0];
    sorted.splice(0, 1);
    return result;
  }
};

const checkIfOpen = (event, currentDay, currentTime, cb) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  axios.get(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${event.place_id}&key=${keys.googleMapsAPI}`)
    .then((response) => {
      if (response.result.opening_hours.periods[currentDay].open.time / 100 > currentTime
        && response.result.opening_hours.periods[currentDay].open.time / 100 < currentTime + 2) {
        cb(true);
      } else {
        cb(false);
      }
    });
  // cb(true);
};

// Helper function to fill out the day
const fillDay = (day, rankedList, interests, currentDay, restaurants) => {
  let currentTime = 9;
  const meals = [9, 12, 19];
  let nextMeal = 0;
  let currentEvent = 0;
  let lastPlaced = rankedList[0];
  let liveEventCount = 0;
  while (currentTime < 22 && currentEvent < rankedList.length) {
    if (currentTime >= meals[nextMeal]) {
      day[`${currentTime}-${++currentTime}`] = findRestaurant(lastPlaced, currentTime, restaurants);
      nextMeal += 1;
    } else if (currentTime += attractionTimes[rankedList[currentEvent].types[0]] < meals[nextMeal] - currentTime) {
      if (currentTime < 18) {
        day[`${currentTime}-${currentTime += attractionTimes[rankedList[currentEvent].types[0] || ++currentTime]}`] = rankedList[currentEvent];
        lastPlaced = rankedList[currentEvent];
        rankedList.splice(currentEvent, 1);
        currentEvent = 0;
      } else {
        if (rankedList[currentEvent].types.includes('park')) {
          currentEvent += 1;
        } else if (liveEventCount === 0 && interests.includes('music')) {
          // Eventually PredictHQ events will go here, but it's harder than we
          // thought and I think getting live data is more important than PredictHQ
          day[`${currentTime}-${currentTime += attractionTimes[rankedList[currentEvent].types[0] || ++currentTime]}`] = rankedList[currentEvent];
          lastPlaced = rankedList[currentEvent];
          rankedList.splice(currentEvent, 1);
          currentEvent = 0;
          liveEventCount += 1;
        } else {
          day[`${currentTime}-${currentTime += attractionTimes[rankedList[currentEvent].types[0] || ++currentTime]}`] = rankedList[currentEvent];
          lastPlaced = rankedList[currentEvent];
          rankedList.splice(currentEvent, 1);
          currentEvent = 0;
        }
      }
    } else {
      currentEvent += 1;
    }
  }
};

// Here's where the magic happens
const scheduleBuilder = (startDate, endDate, google, restaurantData, user, cb) => {
  // Get the user's interests and dislikes, store them in arrays
  const interests = ['museum', 'park', 'point_of_interest', 'music'];
  const dislikes = ['aquarium', 'casino'];
  console.log('google', google);

  // Figure out what the current day of the week is to check if it's open then
  let currentDay = startDate.getDay();

  // Initialize the empty schedule object
  const schedule = {};

  // Get the total number of days that the user will be in the destination
  const numberOfDays =
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Fill the schedule with "day" objects
  for (let i = 1; i < numberOfDays + 2; i += 1) {
    schedule[`day_${i}`] = {};
  }

  // This is just here so that the function can actually run
  const predictHQPlaceHolder = true;

  // Make the ranked list
  const sortedAndRated = makeRankings(google, predictHQPlaceHolder, interests, dislikes);

  // Go through each day, fill it out with events
  const days = Object.keys(schedule);
  days.forEach((day) => {
    fillDay(schedule[day], sortedAndRated, interests, currentDay, restaurantData.restaurants);
    currentDay = currentDay < 7 ? currentDay + 1 : 0;
  });
  cb(schedule);
};

const getSchedule = (startDate, endDate, location) => {
  const query = location.split(' ').join('+');
  const config = {
    headers: {
      'user-key': '0cae7c1f9c26610b03bd4ee152340b02',
    },
  };
  return Promise.all([
    axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+point+of+interest&language=en&key=${keys.googlePlacesAPI}`),
    axios.get(`https://developers.zomato.com/api/v2.1/search?q=${query}&sort=rating`, config),
  ])
    .then(([restaurants, googlePlaces]) => scheduleBuilder(startDate, endDate, restaurants.data, googlePlaces.data, 'user', (schedule) => console.log(schedule)))
    .catch(err => console.error(err));
};


const one = new Date('February 10, 2018 00:00:00');
const two = new Date('Febrauary 13, 2018 00:00:00');
// console.log(scheduleBuilder(one, two));

module.exports.getSchedule = getSchedule(one, two, query);