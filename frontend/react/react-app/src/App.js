import React, { useState, useMemo, useEffect  } from 'react';
import ParamBuilder from "./paramBuilder";
import TableDisplay from './tableDisplay';
import { fetchWeatherItems, fetchMinMaxData, fetchWeatherExplain, fetchWeatherItems2 } from './service';
import { TableRegionSection, QueryDataSection, OrderLimitSection, SelectColumnsSection } from "./uiSection";
import { generateNaturalLanguageQuery } from "./queryGenerator";
import * as utils from './utils';
import * as constant from "./constant";
import './App.css';

const initialQueryConfig = {
  table: "",
  columnData: constant.COLUMN_NAMES.map((name, index) => ({
    name: name,
    rangable: index >= constant.REGION_INDEX_LIMIT,
    ...(index < constant.REGION_INDEX_LIMIT 
      ? { region: "" } // selected regions
      : { greaterThan: '', lessThan: '', onlyMin: false, onlyMax: false } // selected conditions
    ),
    checked: true
  })),
  orderBy: constant.COLUMN_NAMES[0],
  orderFixed: false,
  desc: true,
  limit: constant.LIMIT_OPTIONS[constant.LIMIT_OPTIONS.length - 1],
  distinct: false,
};

function App() {
  const [sortedItems, setSortedItems] = useState([]); // Object is not ordered by select order
  const [loading, setLoading] = useState(false);
  const [minMaxData, setMinMaxData] = useState({});
  const [queryConfig, setQueryConfig] = useState(initialQueryConfig);
  const [naturalQuery, setNaturalQuery] = useState("");
  const [information, setInformation] = useState("");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    fetchData();
  }, [queryConfig.table]);

  useEffect(() => {
    setNaturalQuery(generateNaturalLanguageQuery(queryConfig));
  }, [queryConfig]);

  // To adjust column order when showing query results
  const checkedLabels = useMemo(
    () => queryConfig.columnData
      .filter(item => item.checked)
      .map(item => utils.translate(item.name)),
    [queryConfig.columnData]
  );

  const clearConfig = () => { 
    setQueryConfig(initialQueryConfig);
    setInformation();
    setShowTable(false);
  };

  const handleCheckboxChange = index => {
    setQueryConfig(prev => ({
      ...prev,
      columnData: prev.columnData.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  // When user choose to query min or max value of data, automatically change other properly.
  const handleOnlyMaxOrMin = (name, type) => {
    setQueryConfig(prev => {
      const updatedColumnData = prev.columnData.map((item, index) => {
        if (item.name === name) {
          const otherType = type === "onlyMin" ? "onlyMax" : "onlyMin";
  
          return {
            ...item,
            [type]: !item[type],
            [otherType]: false,
            checked: true,
          };
        }
        return { ...item, onlyMin: false, onlyMax: false };
      });
  
      const selectedColumn = updatedColumnData;
  
      return {
        ...prev,
        columnData: updatedColumnData,
        ...(selectedColumn.onlyMin || selectedColumn.onlyMax
          ? { orderBy: selectedColumn.name, orderFixed: true, limit: constant.LIMIT_OPTIONS[0] }
          : { orderFixed: false }
        )
      };
    });
  };

  const fetchItems = async () => {
    setLoading(true);
    setInformation('');
    
    const paramBuilder = new ParamBuilder();
    if (queryConfig.limit === constant.SHOW_ALL) { 
      const explainParam = paramBuilder.buildExplainQuery(queryConfig);
      try {
        const data = await fetchWeatherExplain(explainParam);
        const ret = data['count'] ?? 0;
        
        if (ret > 1000000) {
          setLoading(false);
          setInformation(`조회된 데이터가 ${ret}개입니다. 조건을 추가해주세요.`);
          return;
        }
        else
           setInformation(`조회된 데이터는 ${ret}개입니다.`);
      } catch (error) {
        console.error("Fetching error!", error)
        setInformation(`에러가 발생하였습니다. ${error.message}`);
        return;
      } finally {
      }
    }
    const param = paramBuilder.build(queryConfig)
    console.log(param);
    try { 
      const data = await fetchWeatherItems(param);
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
    } catch (error) {
      console.error("Fetching error!", error)
      setInformation(`에러가 발생하였습니다. ${error.message}`);
      return;
    } finally {
      setLoading(false);
    }
  };

  const fetchItems2 = async () => {
    setLoading(true);
    setInformation('');
    try { 
      const data = await fetchWeatherItems2(naturalQuery);
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
    } catch (error) {
      console.error("Fetching error!", error)
      setInformation(`에러가 발생하였습니다. ${error.message}`);
      return;
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
        columnData={queryConfig.columnData}
        setColumnData={(newData) => setQueryConfig(prev => ({ ...prev, columnData: newData }))}
        minMaxData={minMaxData}
        handleOnlyMaxOrMin={handleOnlyMaxOrMin}
      />                                                        
      <OrderLimitSection queryConfig={queryConfig} setQueryConfig={setQueryConfig} />
      <SelectColumnsSection
        columnData={queryConfig.columnData}
        setData={handleCheckboxChange}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "30px" }}>
        <button onClick={clearConfig}>선택 초기화</button>
      </div>
      <div style={{ fontSize: "10px", whiteSpace: "pre-line", marginBottom: "10px"}}>
        { naturalQuery }
      </div>
      <button onClick={fetchItems} style={{ width: "400px", height: "50px"}}>검색</button>
      {loading && <p>Loading...</p>}
      <div style={{ marginBottom: "10px"}}>
        { information }
      </div>
      {!loading && sortedItems.length > 0 && showTable && (
        <TableDisplay items={sortedItems} checkedLabels={checkedLabels} />
      )}
    </div>
  );
}

export default App;