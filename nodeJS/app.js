


const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

const apiToken = '6d2dd889-3fcf-4987-986f-e4679d4b2400';

app.use(cors());

app.get('/cities', async (req, res) => {
  try {
    const response = await axios.get(
      ' https://api.ims.gov.il/v1/envista/stations',
      {
        headers: {
          'Authorization': `ApiToken ${apiToken}`
        }
      }
    );
    res.json(response.data);

  }
  catch (error) {

    console.error('Failed to fetch cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

const monitorNamesToFind = ["Rain", "TDmax", "TDmin"];
const channelIds = [];
const calcWeather = async (data, dateString, stationId) => {

  data.monitors.forEach(monitor => {
    if (monitorNamesToFind.includes(monitor.name)) {
      channelIds.push(monitor.channelId);
    }
    //https://api.ims.gov.il/v1/envista/stations/28/data/daily/2015/10/14 :לדוגמא

  });

  var parts = dateString.split("-");
  var newDateString = parts.join("/");
  console.log(newDateString);

  const promises = [];
  const weatherData = {};
  //channelId = channelIds[1]
  for (const channelId of channelIds) {

    const apiUrl = `https://api.ims.gov.il/v1/envista/stations/${stationId}/data/${channelId}/daily/${newDateString}`;
    console.log(apiUrl,"api");
    //https://api.ims.gov.il/v1/envista/stations/2/data/2/daily/2023/02/26
    promises.push(
      axios.get(apiUrl, {
        headers: {
          'Authorization': `ApiToken ${apiToken}`
        }
      })
        .then(response => {
          
          console.log("value",response.data.data[0].channels[0].value);
          weatherData[channelId] = response.data.data[0].channels[0].value;

        })

    )

  }
  await Promise.all(promises);

  console.log(weatherData);
  const weatherInfo = {}
  weatherInfo["rainfall"] = weatherData[channelIds[0]];
  weatherInfo["temperature"]=(weatherData[channelIds[1]]+weatherData[channelIds[1]])/2 ;
  console.log(weatherInfo);
  return weatherInfo;
}
app.get('/weather', async (req, res) => {
  const { stationId, date } = req.query;
  console.log(stationId, date, "!!!!!!!!!");
  try {
    const response = await axios.get(
      `https://api.ims.gov.il/v1/envista/stations/${stationId}`,
      {
        headers: {
          'Authorization': `ApiToken ${apiToken}`
        }
      }
    );
 
    let weatherInfo=calcWeather(response.data, date, stationId);
    res.json(weatherInfo);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = {
  calcWeather,app 
};