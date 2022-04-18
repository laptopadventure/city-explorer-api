'use strict';

const axios = require('axios');
const cache = require('./cache');

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description.toLowerCase();
  }
}

const getWeather = async (req, res, next) => {
  const reg = /[A-Z][a-z]+/;
  const searchQuery = req.query.city;
  const sanitized = searchQuery.match(reg)[0];
  if(!sanitized) {
    res.status(404).send('Could not find the weather lookup for your location.');
    return;
  }
  try {
    const key = `weather-${sanitized}`;
    const call = `https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&city=${sanitized}&lat=${parseInt(req.query.lat)}&lon=${parseInt(req.query.lon)}&days=3&units=I`;
    let forecast;
    if(cache[key] && Date.now() - cache[key].timestamp < 60000) {
      console.log('weather cache hit');
      forecast = cache[key].data;
    } else {
      console.log('weather cache miss');
      const weatherRes = await axios.get(call);
      forecast = weatherRes.data.data.map(day => new Forecast(day.datetime, day.weather.description));
      cache[key] = {
        timestamp: Date.now(),
        data: forecast,
      };
    }
    res.status(200).send(forecast);
  } catch(error) {
    next(error);
  }
};

module.exports = getWeather;
