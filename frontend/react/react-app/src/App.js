import React, { useState, useMemo, useEffect  } from 'react';
import ParamBuilder from "./paramBuilder";
import TableDisplay from './tableDisplay';
import { fetchWeatherItems, fetchMinMaxData, fetchWeatherExplain } from './service';
import { TableRegionSection, QueryDataSection, OrderLimitSection, SelectColumnsSection } from "./uiSection";
import * as utils from './utils';
import * as constant from "./constant";
import './App.css';

const initialQueryConfig = {
  table: "",
  region1: "",
  region2: "",
  region3: "",
  orderBy: constant.ColumnNames[0],
  orderFixed: false,
  desc: true,
  limit: constant.LimitOptions[3],
  distinct: false,
};

// FIXME: int to string or something.. not use 3,4,5,6
const initialColumnData = constant.ColumnNames.slice(3, 7).map(name => ({
    name: name, greaterThan: '', lessThan: '', onlyMin: false, onlyMax: false
}));

function App() {
  const [sortedItems, setSortedItems] = useState([]); // Object is not ordered by select order
  const [loading, setLoading] = useState(false);
  const [information, setInformation] = useState("");
  const [minMaxData, setMinMaxData] = useState({});
  const [queryConfig, setQueryConfig] = useState(initialQueryConfig);
  // Better to merge with queryConfig?
  const [columnData, setColumnData] = useState(initialColumnData);
    // Output Checkbox to decide columns to see 
  const [checkedItems, setCheckedItems] = useState(
    constant.ColumnNames.map(name => ({ label: name, checked: true })),
  );
  
  useEffect(() => {
    fetchData();
  }, [queryConfig.table]);

  const checkedLabels = useMemo(
    () => checkedItems.filter(item => item.checked).map(item => utils.translate(item.label)),
    [checkedItems]
  );

  const clearConfig = () => { 
    setQueryConfig(initialQueryConfig);
    setColumnData(initialColumnData);
    setCheckedItems(constant.ColumnNames.map(name => ({ label: name, checked: true })));
  }

  const handleCheckboxChange = index => {
    setCheckedItems(items => items.map((it, i) => i === index ? { ...it, checked: !it.checked } : it));
  };
  
  // Uncheck one when other side is checked
  const handleOnlyMaxOrMin = (index, type) => {
    setColumnData(prev => prev.map((item, i) => {
      if (i === index) {
        const otherType = type === 'onlyMin' ? 'onlyMax' : 'onlyMin';
        if (!item[type]) {
          setQueryConfig({ ...queryConfig, orderBy: '', orderFixed: true, limit: constant.LimitOptions[0] });
          return { ...item, [type]: !item[type], [otherType]: false };
        } else {
          setQueryConfig({ ...queryConfig, orderFixed: false });
          return { ...item, [type]: !item[type], [otherType]: false };
        }
      }
      return { ...item, onlyMin: false, onlyMax: false };
    }));
  };

  const fetchItems = async () => {
    setLoading(true);
    setInformation('');
    
    const paramBuilder = new ParamBuilder();
    if (queryConfig.limit === constant.ShowAll) { 
      const explainParam = paramBuilder.buildExplainQuery(queryConfig, columnData);
      try {
        const data = await fetchWeatherExplain(explainParam);
        const ret = data['count'] ?? 0;
        console.log(data);
        if (ret > 1000) {
          setInformation(`한 번에 표시할 수 있는 데이터는 1000개입니다.\n예상되는 데이터 갯수는 ${ret}입니다.\n필터링을 추가해주세요`);
          return;
        } else {
          setInformation(`데이터 갯수는 ${ret}입니다.`);
        }
        console.log(`데이터 갯수는 ${ret}입니다.`);     
      } catch (error) {
        console.error("Fetching error!", error)
        setInformation(`Fetching error! ${error.message}`);
      } finally {
        //setLoading(false);
      }
    }
    const param = paramBuilder.build(checkedLabels, queryConfig, columnData)
    try { 
      const data = await fetchWeatherItems(param);
      setSortedItems(
        data.map(item => checkedLabels.reduce((acc, col) => {
          acc[col] = item[col] ?? null;
          return acc;
        }, {}))
      );
    } catch (error) {
      console.error("Fetching error!", error)
      setInformation(`Fetching error! ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
   
  const fetchData = async () => {
    try {
      if (!queryConfig.table)
        return;
      const data = await fetchMinMaxData(`from=${utils.translate(queryConfig.table)}`);
      const formated = Object.keys(data).reduce((acc, column) => {
        const columnData = data[column];
          if (column === 'datetime') {
            columnData.min = utils.formatDate2(columnData.min);
            columnData.max = utils.formatDate2(columnData.max);
          }
        acc[column] = columnData;
        return acc;
      }, {});
      setMinMaxData(formated);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="App">
      <h1> Website to Search Weather</h1>
      <TableRegionSection queryConfig={queryConfig} setQueryConfig={setQueryConfig} />
      <QueryDataSection
        columnData={columnData}
        minMaxData={minMaxData}
        handleOnlyMaxOrMin={handleOnlyMaxOrMin}
        setColumnData={setColumnData}
      />                                                        
      <OrderLimitSection queryConfig={queryConfig} setQueryConfig={setQueryConfig} />
      <SelectColumnsSection
        checkedItems={checkedItems}
        handleCheckboxChange={handleCheckboxChange}
      />
      <button onClick={clearConfig}>선택 초기화</button>
      <button onClick={fetchItems} style={{ width: "300px", height: "40px", marginLeft: "300px" }}>검색</button>
      {loading && <p>Loading...</p>}
      <div style={{ marginBottom: "10px"}}>
        { information }
      </div>
      {!loading && sortedItems.length > 0 && (
        <TableDisplay information={information} items={sortedItems} checkedLabels={checkedLabels} />
      )}
    </div>
  );
}

export default App;