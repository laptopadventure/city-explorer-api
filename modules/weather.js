'use strict';

const axios = require('axios');

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
  let forecast;
  try {
    const call = `https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&city=${sanitized}&lat=${parseInt(req.query.lat)}&lon=${parseInt(req.query.lon)}&days=3&units=I`;
    const weatherRes = await axios.get(call);
    forecast = weatherRes.data.data.map(day => new Forecast(day.datetime, day.weather.description));
    res.status(200).send(forecast);
  } catch(error) {
    next(error);
  }
};

module.exports = getWeather;
