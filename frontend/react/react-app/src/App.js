import React, { useState } from 'react';
import axios from 'axios';
import { Combobox, Entry, Checkbox, CheckboxWithIndex, EntryCombobox, TwoEntry, TwoEntryCheckbox } from "./combobox";
import ParamBuilder from "./paramBuilder";
import * as utils from './utils';
import { ColumnNames, LimitOptions  } from "./constant";
import './App.css';

function App() {
  const [sortedItems, setSortedItems] = useState([]); // Object is not ordered by select order
  const [loading, setLoading] = useState(false);
  
  // Region
  const [selectedRegion1, setSelectedRegion1] = useState("");
  const [selectedRegion2, setSelectedRegion2] = useState("");
  const [selectedRegion3, setSelectedRegion3] = useState("");
  const [orderBy, setOrderBy] = useState("");
  //FIXME: Other components dependency 
  const [orderFixed, setOrderFixed] = useState(false);
  const [desc, setDesc] = useState("");
  const [limitNum, setLimitNum] = useState('');
  
const columns = ['sido', 'sigungu', 'dong', 'datetime', 'temperature', 'snowfall', 'precipitation'];

  // For Query where
  // FIXME: int to string or something.. not use 3,4,5,6
  const [columnData, setColumnData] = useState([
    { title: ColumnNames[3], minValue: '', maxValue: '', onlyMinChecked: false, onlyMaxChecked: false },
    { title: ColumnNames[4], minValue: '', maxValue: '', onlyMinChecked: false, onlyMaxChecked: false },
    { title: ColumnNames[5], minValue: '', maxValue: '', onlyMinChecked: false, onlyMaxChecked: false },
    { title: ColumnNames[6], minValue: '', maxValue: '', onlyMinChecked: false, onlyMaxChecked: false },
  ]);

  // Output Checkbox to decide columns to see 
  const [checkedItems, setCheckedItems] = useState(
    ColumnNames.map((name) => (
      { label: name, checked: true })),
  );
  
  const setValues = (index, type, value) => {
    const newItems = [...columnData];
    newItems[index][type] = value;
    setColumnData(newItems);
  };
  
  // Uncheck one when other side is checked
  const handleOnlyMaxOrMin = (index, type) => {
    const newItems = [...columnData];
    const otherType = type === 'onlyMinChecked' ? 'onlyMaxChecked' : 'onlyMinChecked';
    
    newItems[index][type] = !newItems[index][type];
    if (newItems[index][type]) {
      newItems[index][otherType] = false;
      // If one is max or min, other cannot be.
      setOrderBy('');
      // FIXME: Other components dependency seems bad.
      setOrderFixed(true);
      setLimitNum('1');
    } else {
      setOrderBy(ColumnNames[0]);
      setOrderFixed(false);
      setLimitNum(LimitOptions[0]);
    }
    // If one is max or min, other cannot be.
    for (let i = 0; i < newItems.length; i++) {
      if (i !== index) {
        newItems[i][type] = false;
        newItems[i][otherType] = false;
      }
    }
    setColumnData(newItems);
  };
  
  const handleCheckboxChange = (index) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index].checked = !updatedCheckedItems[index].checked;
    setCheckedItems(updatedCheckedItems);
  };

  const toggleDesc = () => {
    setDesc(prevState => !prevState);  // 체크박스 상태를 반전
  };

  const buildParams = () => {
    const paramBuilder = new ParamBuilder();
    const checkedLabels = checkedItems.filter(item => item.checked).map(item => utils.translate(item.label));
    console.log('sido', selectedRegion1);
    let params = paramBuilder
      .select(checkedLabels)
      .where("sido", selectedRegion1)
      .where("sigungu", selectedRegion2)
      .where("dong", selectedRegion3)
    
    columnData.forEach((item) => {
      params = params
        .where(item.title, item.minValue, ">=")
        .where(item.title, item.maxValue, "<=")
    });

    columnData.forEach((item) => {
      if (item.onlyMinChecked) {
        params = params
          .orderby(item.title, false);
      } else if (item.onlyMaxChecked) {
        params = params
          .orderby(item.title, true);
      }
    });
      
    params = params
      .orderby(orderBy, desc)
      .limit(limitNum)
      .build()
    
      return params;
  }

  const fetchItems = async () => {
    setLoading(true);
    const params = buildParams();
    try {
      console.log(params);  
      const response = await axios.get(`http://localhost:5000/api/items?${params}`);
      const sortedData = response.data.map(item => {
        const sortedItem = {};
        columns.forEach(col => {
          if (item.hasOwnProperty(col)) {
            sortedItem[col] = item[col];
          } else {
            sortedItem[col] = null;
          }
        });
        return sortedItem;
      });
      setSortedItems(sortedData);
    } catch (error) {
      console.error("There was an error fetching the data!", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => (
    <table border="1">
      <thead>
        <tr>
          <th>#</th> {/* for index */}
          {columns.map((column) => (
            <th key={column}>{utils.translate(column)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((item, index) => (
          <tr key={item.id || index}>
            <td>{index + 1}</td>
            {columns.map((column) => (
              <td key={column}>{item[column]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="App">
      <h1> Website to Search Weather</h1>
      <Combobox label="도/특별시/광역시"
                options={utils.getFirstElements()}
                value={selectedRegion1}
                onChange={(value) => setSelectedRegion1(value)} />      
      <Combobox label="시/군/구"
                options={utils.getSecondElements(selectedRegion1)}
                value={selectedRegion2}
                onChange={(value) => setSelectedRegion2(value)}
                disabled={!selectedRegion1} />
      <Combobox label="읍/면/동"
                options={utils.getThirdElements(selectedRegion1, selectedRegion2)}
                value={selectedRegion3}
                onChange={(value) => setSelectedRegion3(value)}
                disabled={!(selectedRegion1 && selectedRegion2)} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {columnData.map((item, index) => (
          <TwoEntryCheckbox
            key={index}
            title={item.title}
            firstValue={item.minValue}
            firstChanged={(value) => setValues(index, 'minValue', value)}
            secondValue={item.maxValue}
            secondChanged={(value) => setValues(index, 'maxValue', value)}
            disabled={item.onlyMinChecked || item.onlyMaxChecked}
            minChecked={item.onlyMinChecked}
            minChanged={() => handleOnlyMaxOrMin(index, 'onlyMinChecked')}
            maxChecked={item.onlyMaxChecked}
            maxChanged={() => handleOnlyMaxOrMin(index, 'onlyMaxChecked')}          
        />
        ))}
      </div>                                                                      
      <span> Order by</span>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Combobox label= "정렬 순서"
                  options={ ColumnNames }
                  value={orderBy}
                  onChange={setOrderBy}
                  defaultIndex={0}
                  disabled={orderFixed} />
        <Checkbox label="오름차순"
                  checked={desc}
                  onChange={toggleDesc} />
      </div>
      <Combobox label= "보기"
                options={LimitOptions}
                value={limitNum}
                onChange={setLimitNum}
                defaultIndex={2} />        
      <span>Columns to See</span>
      <form style={{ display: 'flex', justifyContent: 'center' }}>
        {checkedItems.map((item, index) => (
          <CheckboxWithIndex
            key={index}
            label={item.label}
            index={index}
            checked={item.checked}
            onChange={handleCheckboxChange}
          />
        ))}
      </form>
      <button onClick={fetchItems}>DB Query</button>
      {loading && <p>Loading...</p>}
      {!loading && sortedItems.length > 0 && renderTable()}
    </div>
  );
}

export default App;


      // <div>
      //   <EntryCombobox 
      //     entryLabel="기온"
      //     entryPlaceholder="ex) -1"
      //     entryValue={temperature}
      //     entryChanged={handleTemperature}
      //     comboOptions={['일치', '이상', '이하', '평균']}
      //     comboValue={tempCondition}
      //     comboboxChanged={setTempCondition}
      //     comboPlaceholder="조건(이상, 이하, 평균)"
      //     comboDisabled={!temperature}      
      //   />
      //   <EntryCombobox 
      //     entryLabel="기온"
      //     entryPlaceholder="ex) -1"
      //     entryValue={temperature}
      //     entryChanged={handleTemperature}
      //     comboOptions={['일치', '이상', '이하', '평균']}
      //     comboValue={tempCondition}
      //     comboboxChanged={setTempCondition}
      //     comboPlaceholder="조건(이상, 이하, 평균)"
      //     comboDisabled={!temperature}      
      //   />
      //   <EntryCombobox 
      //     entryLabel="강수량"
      //     entryPlaceholder="ex) 10"
      //     entryValue={pptn}
      //     entryChanged={handlePptn}
      //     comboOptions={['일치', '이상', '이하', '평균']}
      //     comboValue={pptnCondition}
      //     comboboxChanged={setPptnCondition}
      //     comboPlaceholder="조건(이상, 이하, 평균)"
      //     comboDisabled={!pptn}      
      //   />
      //   <EntryCombobox 
      //     entryLabel="적설량"
      //     entryPlaceholder="ex) 10"
      //     entryValue={snowfall}
      //     entryChanged={handleSnowfall}
      //     comboOptions={['일치', '이상', '이하', '평균']}
      //     comboValue={snowfallCondition}
      //     comboboxChanged={setSnowfallCondition}
      //     comboPlaceholder="조건(이상, 이하, 평균)"
      //     comboDisabled={!snowfall}      
      //   />
      //   <EntryCombobox 
      //     entryLabel="날짜"
      //     entryPlaceholder="ex) 2024-12-12:10"
      //     entryValue={datetime}
      //     entryChanged={handleDatetime}
      //     comboOptions={['이후', '이전', '당일']}
      //     comboValue={datetimeCondition}
      //     comboboxChanged={setDatetimeCondition}
      //     comboPlaceholder="ex) 2024-12-12:10"
      //     comboDisabled={!datetime}
      //   />