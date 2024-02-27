const axios = require('axios');
const { calcWeather,app } = require('./app'); 
const supertest = require('supertest');

jest.mock('axios');

/////////////-------------test 1--------------

describe('GET /cities endpoint', () => {
  test('returns cities data when API request is successful', async () => {
    

    const response = await supertest(app).get('/cities');

    expect(response.status).toBe(200);
   
  });
});


/////////////-------------test 2--------------

describe('calcWeather function', () => {
  test('calculates weather information correctly with available data', async () => {
    const responseData = {
      stationId: 2,
      monitors: [
        {
          channelId: 1,
          name: 'Rain',
          units: 'mm'
        },
        {
          channelId: 9,
          name: 'TDmax',
          units: 'degC'
        },
        {
          channelId: 10,
          name: 'TDmin',
          units: 'degC'
        }
      ]
    };

    axios.get.mockResolvedValue({ data: responseData });

    const weatherInfo = await calcWeather(responseData, '2023-02-26', 2);

    expect(weatherInfo).toEqual({
      rainfall: 0,
      temperature: 9.25
    });
  });

 


});
