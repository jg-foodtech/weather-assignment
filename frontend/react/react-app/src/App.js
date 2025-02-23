import React, { useState } from 'react';
import axios from 'axios';
import { Combobox, Entry, Checkbox, EntryCombobox } from "./combobox";
import ParamBuilder from "./paramBuilder";
import * as utils from './utils';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Region
  const [selectedRegion1, setSelectedRegion1] = useState("");
  const [selectedRegion2, setSelectedRegion2] = useState("");
  const [selectedRegion3, setSelectedRegion3] = useState("");

  // Entry
  const [pptn, setPptn] = useState('');
  const [snowfall, setSnowfall] = useState('');
  const [temperature, setTemperature] = useState('');
  const [datetime, setDatetime] = useState('');

  // Combobox
  const [tempCondition, setTempCondition] = useState("");
  const [pptnCondition, setPptnCondition] = useState("");
  const [snowfallCondition, setSnowfallCondition] = useState("");
  const [datetimeCondition, setDatetimeCondition] = useState("");

  // Checkbox
  const [checkedItems, setCheckedItems] = useState([ 
    { label: '도/특별시/광역시', checked: true },
    { label: '시/군/구', checked: true },
    { label: '읍/면/동', checked: true },
    { label: '날짜', checked: true },
    { label: '기온', checked: true },
    { label: '적설량', checked: true },
    { label: '강수량', checked: true },
  ]);

  const handleSnowfall = (value) => {
    setSnowfall(value);
  };
  const handleTemperature = (value) => {
    setTemperature(value);
  };
  const handlePptn = (value) => {
    setPptn(value);
  };
  const handleDatetime = (value) => {
    setDatetime(value);
  };

  const handleCheckboxChange = (index) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index].checked = !updatedCheckedItems[index].checked;
    setCheckedItems(updatedCheckedItems);
  };

  const fetchItems = async () => {
    setLoading(true);
	const paramBuilder = new ParamBuilder();
    const checkedLabels = checkedItems.filter(item => item.checked).map(item => utils.korToEng(item.label));
    console.log('sido', selectedRegion1);
    const params = paramBuilder
      .select(checkedLabels)
      .where("sido", selectedRegion1)
      .where("sigungu", selectedRegion2)
      .where("dong", selectedRegion3)
      .where("datetime", datetime, datetimeCondition)
      .where("temperature", temperature, tempCondition)
      .where("precipitation", pptn, pptnCondition)
      .where("snowfall", snowfall, snowfallCondition)
      .orderby("sido", true)
      .limit(10)
      .build()
    
    try {
      //const params = "?select=sido,sigungu,dong&where=datetime>2024-12-22:00&where=temperature<=-22&order=sido&desc=true&limit=10";
      console.log(params);
      const response = await axios.get(`http://localhost:5000/api/items?${params}`);
      setItems(response.data);
    } catch (error) {
      console.error("There was an error fetching the data!", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1> Website to Search Weather</h1>
      <div>
      <Combobox label="도/특별시/광역시"
                options={utils.getFirstElements()}
                value={selectedRegion1}
                onChange={(value) => { console.log("chosend:", value);setSelectedRegion1(value)}} />
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
      <div>
        <EntryCombobox 
          entryLabel="기온"
          entryPlaceholder="ex) -1"
          entryValue={temperature}
          entryChanged={handleTemperature}
          comboLabel="조건(이상, 이하, 평균)"
          comboOptions={['일치', '이상', '이하', '평균']}
          comboValue={tempCondition}
          comboboxChanged={setTempCondition}
          comboDisabled={!temperature}      
        />
        <EntryCombobox 
          entryLabel="강수량"
          entryPlaceholder="ex) 10"
          entryValue={pptn}
          entryChanged={handlePptn}
          comboLabel="조건(이상, 이하, 평균)"
          comboOptions={['일치', '이상', '이하', '평균']}
          comboValue={pptnCondition}
          comboboxChanged={setPptnCondition}
          comboDisabled={!pptn}      
        />
        <EntryCombobox 
          entryLabel="적설량"
          entryPlaceholder="ex) 10"
          entryValue={snowfall}
          entryChanged={handleSnowfall}
          comboLabel="조건(이상, 이하, 평균)"
          comboOptions={['일치', '이상', '이하', '평균']}
          comboValue={snowfallCondition}
          comboboxChanged={setSnowfallCondition}
          comboDisabled={!snowfall}      
        />
        <EntryCombobox 
          entryLabel="날짜"
          entryPlaceholder="ex) 2024-12-12:10"
          entryValue={datetime}
          entryChanged={handleDatetime}
          comboLabel="ex) 2024-12-12:10"
          comboOptions={['이후', '이전', '당일']}
          comboValue={datetimeCondition}
          comboboxChanged={setDatetimeCondition}
          comboDisabled={!datetime}
        />
      </div>                                                                        
      <h1>Items List</h1>
      <h2>출력을 원하는 데이터</h2>
      <form style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {checkedItems.map((item, index) => (
          <Checkbox
            key={index}
            label={item.label}
            index={index}
            checked={item.checked}
            onChange={handleCheckboxChange}
          />
        ))}
      </form>
    </div>
      <button onClick={fetchItems}>DB Query</button>
      {loading && <p>Loading...</p>}
      {!loading && items.length > 0 && (
        <table border="1">
          <thead>
            <tr>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
//              <th>5</th>
//              <th>6</th>
//              <th>7</th>
//              <th>8</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.id1}</td>
                <td>{item.id2}</td>
//                <td>{item.id3}</td>
//                <td>{item.id4}</td>
//                <td>{item.id5}</td>
//                <td>{item.id6}</td>
//                <td>{item.id7}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
