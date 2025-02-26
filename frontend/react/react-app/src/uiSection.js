// src/components/QuerySection.js
import React from 'react';
import { Combobox, Checkbox, TwoEntryCheckbox, CheckboxWithIndex } from './combobox';
import * as constant from "./constant";
import * as utils from './utils';

export const TableRegionSection = ({ queryConfig, setQueryConfig }) => {
  return (
    <div className="query-section" 
         style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <Combobox
        label="검색을 원하는 테이블"
        options={constant.TABLE_NAMES}
        value={queryConfig.table}
        onChange={v => setQueryConfig(prev => ({ ...prev, table: v }))}
        defaultIndex={0}
        width="300px"
      />
      <Combobox
        label="도/특별시/광역시"
        options={utils.getFirstElements()}
        value={queryConfig.columnData[0].region}
        onChange={v =>
          setQueryConfig(prev => ({
            ...prev,
            columnData: prev.columnData.map((item, index) =>
              index === 0 ? { ...item, region: v } : item
            )
          }))
        }
        width="300px"
      />
      <Combobox
        label="시/군/구"
        options={utils.getSecondElements(queryConfig.columnData[0].region)}
        value={queryConfig.columnData[1].region}
        onChange={v =>
          setQueryConfig(prev => ({
            ...prev,
            columnData: prev.columnData.map((item, index) =>
              index === 1 ? { ...item, region: v } : item
            )
          }))
        }
        disabled={!queryConfig.columnData[0].region}
        width="300px"
      />
      <Combobox
        label="읍/면/동"
        options={utils.getThirdElements(queryConfig.columnData[0].region, 
                                        queryConfig.columnData[1].region)}
        value={queryConfig.columnData[2].region}
        onChange={v =>
          setQueryConfig(prev => ({
            ...prev,
            columnData: prev.columnData.map((item, index) =>
              index === 2 ? { ...item, region: v } : item
            )
          }))
        }
        disabled={!(queryConfig.columnData[0].region && queryConfig.columnData[1].region)}
        width="300px"
      />
    </div>
  );
};

export const OrderLimitSection = ({ queryConfig, setQueryConfig }) => {
  return (
    <div className="table-option" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <Combobox label= "정렬 기준"
              options={ constant.COLUMN_NAMES }
              value={queryConfig.orderBy}
              onChange={value => setQueryConfig(c => ({ ...c, orderBy: value }))}
              defaultIndex={queryConfig.orderBy}
              disabled={queryConfig.orderFixed} />
    <Checkbox label="내림차순"
              checked={queryConfig.desc}
              disabled={queryConfig.orderFixed}
              onChange={() => setQueryConfig(c => ({ ...c, desc: !c.desc }))} />
    <Combobox label= "검색 갯수"
              options={constant.LIMIT_OPTIONS}
              value={queryConfig.limit}
              onChange={value => setQueryConfig(c => ({ ...c, limit: value }))}
              defaultIndex={queryConfig.LimitOptions}
              />       
    <Checkbox label="중복 제거"
              checked={queryConfig.distinct}
              onChange={() => setQueryConfig(c => ({ ...c, distinct: !c.distinct }))} /> 
    </div>
  );
}

export const QueryDataSection = ({ columnData, setColumnData, minMaxData, handleOnlyMaxOrMin }) => {
  const updateColumnData = (name, key, value) => {
    setColumnData(columnData.map(column =>
      column.name === name ? { ...column, [key]: value } : column))
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {columnData.filter(column => column.rangable).map(item => (
        <div key={item.name} style={{ minHeight: '20px', marginBottom: '10px', textAlign: 'center' }}>
          
          <div style={{ minHeight: '15px' }}>
            {minMaxData[utils.translate(item.name)] ? (
              <div style={{ fontSize: '9px', color: '#999' }}>
                {`( ${minMaxData[utils.translate(item.name)].min} , ${minMaxData[utils.translate(item.name)].max} )`}
              </div>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>

          <TwoEntryCheckbox
            title={item.name}
            firstValue={item.greaterThan}
            firstChanged={value => updateColumnData(item.name, "greaterThan", value)}
            secondValue={item.lessThan}
            secondChanged={value => updateColumnData(item.name, "lessThan", value)}
            disabled={item.onlyMin || item.onlyMax}
            minChecked={item.onlyMin}
            minChanged={() => handleOnlyMaxOrMin(item.name, 'onlyMin')}
            maxChecked={item.onlyMax}
            maxChanged={() => handleOnlyMaxOrMin(item.name, 'onlyMax')}
          />
        </div>
      ))}
    </div>
  );
};


export const SelectColumnsSection = ({ columnData, setData }) => {
  return (
    <form style={{ display: 'flex', justifyContent: 'center', marginBottom: "20px" }}>
    {columnData.map((item, index) => (
      <CheckboxWithIndex
        key={index}
        label={item.name}
        index={index}
        checked={item.checked}
        onChange={() => setData(index)}
      />
    ))}
    </form>
  );
}