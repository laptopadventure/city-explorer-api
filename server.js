'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
app.use(cors());

const PORT = process.env.PORT || 3002;

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

app.get('/weather', async (req, res, next) => {
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
    const res = await axios.get(call);
    console.log(res.data.data);
    forecast = res.data.data.map(day => new Forecast(day.datetime, day.weather.description));
  } catch(error) {
    next(error);
  }
  res.status(200).send(forecast);
});

app.get('/', (req, res) => {
  res.send('home');
});

app.get('*', (req, res) => {
  res.status(404).send('No end point.');
});

app.use((error, req, res, next) => {
  res.status(500).send(error.message);
});

app.listen(PORT, () => console.log(`PORT ${PORT} up`));
