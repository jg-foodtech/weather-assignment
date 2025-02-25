import React, { useState, useMemo, useEffect  } from 'react';
import ParamBuilder from "./paramBuilder";
import TableDisplay from './tableDisplay';
import { fetchWeatherItems, fetchMinMaxData } from './service';
import { TableRegionSection, QueryDataSection, OrderLimitSection, SelectColumnsSection } from "./uiSection";
import * as utils from './utils';
import { ColumnNames, LimitOptions  } from "./constant";
import './App.css';

const initialQueryConfig = {
  table: "",
  region1: "",
  region2: "",
  region3: "",
  orderBy: ColumnNames[0],
  orderFixed: false,
  desc: true,
  limit: LimitOptions[3],
  distinct: false,
};

// FIXME: int to string or something.. not use 3,4,5,6
const initialColumnData = ColumnNames.slice(3, 7).map(name => ({
    name: name, greaterThan: '', lessThan: '', onlyMin: false, onlyMax: false
  }))

function App() {
  const [sortedItems, setSortedItems] = useState([]); // Object is not ordered by select order
  const [loading, setLoading] = useState(false);
  const [minMaxData, setMinMaxData] = useState({});
  const [queryConfig, setQueryConfig] = useState(initialQueryConfig);
  // Better to merge with queryConfig?
  const [columnData, setColumnData] = useState(initialColumnData);
    // Output Checkbox to decide columns to see 
  const [checkedItems, setCheckedItems] = useState(
    ColumnNames.map(name => ({ label: name, checked: true })),
  );
  
  useEffect(() => {
    fetchData();
  }, []); 
  
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
    setCheckedItems(ColumnNames.map(name => ({ label: name, checked: true })));
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
          setQueryConfig({ ...queryConfig, orderBy: '', orderFixed: true, limit: LimitOptions[0] });
          return { ...item, [type]: !item[type], [otherType]: false };
        } else {
          setQueryConfig({ ...queryConfig, orderFixed: false });
          return { ...item, [type]: !item[type], [otherType]: false };
        }
      }
      return { ...item, onlyMin: false, onlyMax: false };
    }));
  };

  const buildParams = () => {
    const paramBuilder = new ParamBuilder();
    paramBuilder
      .select(checkedLabels, queryConfig.distinct)
      .from(queryConfig.table)
      .where(ColumnNames[0], queryConfig.region1)
      .where(ColumnNames[1], queryConfig.region2)
      .where(ColumnNames[2], queryConfig.region3)

    columnData.forEach(({ name, greaterThan, lessThan, onlyMin, onlyMax }) => {
      paramBuilder.where(name, greaterThan, ">=").where(name, lessThan, "<=");
      if (onlyMin) paramBuilder.orderBy(name, false);
      if (onlyMax) paramBuilder.orderBy(name, true);
    });
    return paramBuilder.orderBy(queryConfig.orderBy, queryConfig.desc).limit(queryConfig.limit).build();
  }

  const fetchItems = async () => {
    setLoading(true);
    try { 
      const data = await fetchWeatherItems(buildParams());
      setSortedItems(
        data.map(item => checkedLabels.reduce((acc, col) => {
          acc[col] = item[col] ?? null;
          return acc;
        }, {}))
      );
    } catch (error) {
      console.error("Fetching error!", error);
    } finally {
      setLoading(false);
    }
  };
   
  const fetchData = async () => {
    try {
      const data = await fetchMinMaxData(`from=${queryConfig.table}`);
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
      <button onClick={clearConfig}>전부 초기화</button>
      <button onClick={fetchItems} style={{ width: "300px", height: "40px", marginLeft: "300px" }}>검색</button>
      {loading && <p>Loading...</p>}
      {!loading && sortedItems.length > 0 && (
        <TableDisplay items={sortedItems} checkedLabels={checkedLabels} />
      )}
    </div>
  );
}

export default App;