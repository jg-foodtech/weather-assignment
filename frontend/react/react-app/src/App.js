import React, { useState, useMemo, useEffect  } from 'react';

import { TableRegionSection, QueryDataSection, OrderLimitSection, SelectColumnsSection } from "./ui/uiSection";
import TableDisplay from './ui/tableDisplay';
import { generateNaturalLanguageQuery, generateNaturalLanguageQueryEng } from "./query/queryGenerator";
import { fetchItems, fetchItemNatural, fetchInitialData } from './services/fetchService';
import * as utils from './utils/utils';
import * as constant from "./constants/constant";
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
  const [sortedItems, setSortedItems] = useState([]); // Stores sorted query results
  const [loading, setLoading] = useState(false);  // Stores loading state
  const [minMaxData, setMinMaxData] = useState({}); // Stores min/max values for each column
  const [queryConfig, setQueryConfig] = useState(initialQueryConfig); // Stores query config
  const [naturalQuery, setNaturalQuery] = useState(""); // Stores natural laungage from selected buttons
  const [information, setInformation] = useState(""); // Stores user messages
  const [showTable, setShowTable] = useState(false); // Controls table visibility

  // Memoized checked column labels
  const checkedLabels = useMemo(
    () => queryConfig.columnData
      .filter(item => item.checked)
      .map(item => utils.translate(item.name)),
    [queryConfig.columnData]
  );

  const state = {
    queryConfig,
    naturalQuery,
    checkedLabels,
    setLoading,
    setInformation,
    setSortedItems,
    setShowTable,
    setMinMaxData
  };
  
  const handleFetchItems = () => fetchItems(state);
  const handleFetchItemNatural = () => fetchItemNatural(state);

  // Fetch min/max data when table changes
  useEffect(() => {
    fetchInitialData(state);
  }, [queryConfig.table]);

  // Update natural language query when query configuration changes
  useEffect(() => {
    setNaturalQuery(generateNaturalLanguageQueryEng(queryConfig));
  }, [queryConfig]);


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

  // Adjust query configuration when min/max selection is changed
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
      <div style={{ display: "flex", justifyContent: "center", marginLeft: "550px", marginBottom: "10px" }}>
        <button onClick={clearConfig}>선택 초기화</button>
      </div>
      <div style={{ fontSize: "10px", whiteSpace: "pre-line", marginBottom: "10px"}}>
        { naturalQuery }
      </div>
      <button onClick={handleFetchItems} style={{ width: "400px", height: "50px"}}>검색</button>
      <button onClick={handleFetchItemNatural} style={{ width: "400px", height: "50px"}}>검색(자연어)</button>
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
