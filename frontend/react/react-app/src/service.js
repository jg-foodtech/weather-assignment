import axios from 'axios';

const serverAddress = "http://localhost:5000";

export const fetchWeatherItems = async (params) => {
  const response = await axios.get(`${serverAddress}/api/weather/items?${params}`);
  return response.data;
};

export const fetchMinMaxData = async (param) => {
  const response = await axios.get(`${serverAddress}/api/weather/minmax?${param}`);
  return response.data;
};