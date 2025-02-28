import { fetchWeatherItems, fetchMinMaxData, fetchWeatherItems2, fetchWeatherCount } from './apiService';

import ParamBuilder from '../query/paramBuilder';
import * as utils from '../utils/utils';
import * as constant from '../constants/constant';


/**
 * Processes and updates the fetched data.
 */
const handleFetchedData = (data, state) => {
  const { setLoading, setInformation, setSortedItems, setShowTable, checkedLabels } = state;
  if (!Array.isArray(data)) {
    setLoading(false);
    setInformation(`에러가 발생하였습니다. (예상치 못한 데이터 타입)`);
    return;
  }

  setSortedItems(
    data.map(item => checkedLabels.reduce((acc, col) => {
    acc[col] = item[col] ?? null;
    return acc;
    }, {}))
  );

  setShowTable(true);
};

/**
 * Fetches the count of results if needed.
 */
const fetchCountIfNeeded = async (paramBuilder, state) => {
  const { queryConfig, setLoading, setInformation } = state;
  const countParam = paramBuilder.buildCountQuery(queryConfig);
    const data = await fetchWeatherCount(countParam);
    const ret = data['count'] ?? 0;
  
    if (ret > constant.MAX_RESULT_NUM) {
      setLoading(false);
      setInformation(`조회된 데이터가 ${ret}개입니다. 조건을 추가해주세요.`);
      return null;
    }
  
    setInformation(`조회된 데이터는 ${ret}개입니다.`);
    return ret;
  };
  
/**
 * Checks and builds the query parameters.
 */
  const checkResultNumber = async (isNatural, state) => {
    const { queryConfig, naturalQuery } = state;
    if (isNatural) return `natural=${naturalQuery}`;
  
    const paramBuilder = new ParamBuilder();
    if (queryConfig.limit === constant.SHOW_ALL) {
      const count = await fetchCountIfNeeded(paramBuilder, state);
      if (count === null) return null;
    }
  
    return paramBuilder.build(queryConfig);
  };
  
/**
 * Fetches results based on the query configuration.
 */
  const fetchResults = async (isNatural = false, state) => {
    const { setLoading, setInformation } = state;
    setLoading(true);
    setInformation('');
  
    try {
      const param = await checkResultNumber(isNatural, state);
      if (param === null) return;
  
      const data = isNatural ? await fetchWeatherItems2(param) : await fetchWeatherItems(param);
      handleFetchedData(data, state);
    } catch (error) {
      console.error("Fetching error!", error);
      setInformation(`에러가 발생하였습니다. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

/**
 * Fetches standard query results.
 */
export const fetchItems = (state) => fetchResults(false, state);

/**
 * Fetches query results using natural language processing.
 */
export const fetchItemNatural = (state) => fetchResults(true, state);

/**
 * Fetches initial data such as min/max values for columns.
 */
export const fetchInitialData = async (state) => {
    const { queryConfig, setMinMaxData } = state;
    try {
        if (!queryConfig.table)
        return;
        const data = await fetchMinMaxData(`from=${utils.translate(queryConfig.table)}`);
        const formatted = Object.keys(data).reduce((acc, column) => {
        const columnData = data[column];
            if (column === 'datetime') {
            columnData.min = utils.formatDate2(columnData.min);
            columnData.max = utils.formatDate2(columnData.max);
            }
        acc[column] = columnData;
        return acc;
        }, {});
        setMinMaxData(formatted);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
