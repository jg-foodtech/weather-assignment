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

/**
 * Fetches the count of weather data based on query parameters.
 * @param {string} params - Query parameters.
 * @returns {Promise<Object>} The response containing the count.
 * @example
 * {
 *   "count": 12345
 * }
 */
export const fetchWeatherCount = async (params) => {
    const response = await axios.get(`${getApiUrl()}/api/weather/count?${params}`);
    return response.data;
  };

/**
 * Fetches weather data based on query parameters.
 * @param {string} params - Query parameters.
 * @returns {Promise<Object>} The response containing query results.
 * @example
 * {
 *   "results": [
 *     { "column_name_1": value1, "column_name_2": value2, ... },
 *     { "column_name_1": value3, "column_name_2": value4, ... },
 *     ...
 *   ]
 * }
 */
export const fetchWeatherItems = async (params) => {
  const response = await axios.get(`${getApiUrl()}/api/weather/items?${params}`);
  return response.data;
};

/**
 * Fetches weather data using a POST request (this is for natural language string query).
 * @param {string} params - Query string.
 * @returns {Promise<Object>} The response containing query results.
 * @see {@link fetchWeatherItems} for the same response format.
 */
export const fetchWeatherItems2 = async (params) => {
  const response = await axios.post(`${getApiUrl()}/api/weather/natural`, { query: params }, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data;
};


/**
 * Fetches min/max values for weather data columns.
 * @param {string} param - Query parameter specifying the table.
 * @returns {Promise<Object>} The response containing min/max values.
 * @example
 * {
 *   "column_name_1": {
 *     "min": value,
 *     "max": value,
 *     "data_type": "type",
 *     "is_nullable": "YES" or "NO"
 *   },
 *   "column_name_2": {
 *     "min": value,
 *     "max": value,
 *     "data_type": "type",
 *     "is_nullable": "YES" or "NO"
 *   },
 *   ...
 * }
 */
export const fetchMinMaxData = async (param) => {
  const response = await axios.get(`${getApiUrl()}/api/weather/minmax?${param}`);
  return response.data;
};
