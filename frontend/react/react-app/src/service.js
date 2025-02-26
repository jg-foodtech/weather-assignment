import axios from 'axios';

const getApiUrl = () => {
    const hostname = window.location.hostname;
  
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
  
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
  
    return `http://${hostname}:5000`;
};

export const fetchWeatherExplain = async (params) => {
    console.log('fetch weather explain', params);
    const response = await axios.get(`${getApiUrl()}/api/weather/explain?${params}`);
    return response.data;
  };

export const fetchWeatherItems = async (params) => {
  const response = await axios.get(`${getApiUrl()}/api/weather/items?${params}`);
  return response.data;
};
// POST To avoid string limitation
export const fetchWeatherItems2 = async (params) => {
  const response = await axios.post(`${getApiUrl()}/api/weather/natural`, { query: params }, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data;
};

export const fetchMinMaxData = async (param) => {
  const response = await axios.get(`${getApiUrl()}/api/weather/minmax?${param}`);
  return response.data;
};