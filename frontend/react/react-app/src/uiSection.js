// src/components/QuerySection.js
import React from 'react';
import { Combobox, Checkbox, TwoEntryCheckbox, CheckboxWithIndex } from './combobox';
import { TableNames, LimitOptions, ColumnNames } from './constant';
import * as utils from './utils';

export const TableRegionSection = ({ queryConfig, setQueryConfig }) => {
  return (
    <div className="query-section">
      <Combobox
        label="검색을 원하는 테이블"
        options={TableNames}
        value={queryConfig.table}
        onChange={value => setQueryConfig(prev => ({ ...prev, table: value }))}
        defaultIndex={0}
      />
      <Combobox
        label="도/특별시/광역시"
        options={utils.getFirstElements()}
        value={queryConfig.region1}
        onChange={value => setQueryConfig(prev => ({ ...prev, region1: value }))}
      />
      <Combobox
        label="시/군/구"
        options={utils.getSecondElements(queryConfig.region1)}
        value={queryConfig.region2}
        onChange={value => setQueryConfig(prev => ({ ...prev, region2: value }))}
        disabled={!queryConfig.region1}
      />
      <Combobox
        label="읍/면/동"
        options={utils.getThirdElements(queryConfig.region1, queryConfig.region2)}
        value={queryConfig.region3}
        onChange={value => setQueryConfig(prev => ({ ...prev, region3: value }))}
        disabled={!(queryConfig.region1 && queryConfig.region2)}
      />
    </div>
  );
};

export const OrderLimitSection = ({ queryConfig, setQueryConfig }) => {
  return (
    <div className="table-option" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <Combobox label= "정렬 기준"
              options={ ColumnNames }
              value={queryConfig.orderBy}
              onChange={value => setQueryConfig(c => ({ ...c, orderBy: value }))}
              defaultIndex={queryConfig.orderBy}
              disabled={queryConfig.orderFixed} />
    <Checkbox label="내림차순"
              checked={queryConfig.desc}
              disabled={queryConfig.orderFixed}
              onChange={() => setQueryConfig(c => ({ ...c, desc: !c.desc }))} />
    <Combobox label= "보기"
              options={LimitOptions}
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
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    {columnData.map((item, index) => (
      <div key={index} style={{ minHeight: '20px', marginBottom: '10px', textAlign: 'center' }}>
        <div style = {{minHeight: '15px'}}>
          {minMaxData[utils.translate(item.name)] ? (
          <div style={{ fontSize: '9px', color: '#666' }}>
            {`( ${minMaxData[utils.translate(item.name)].min} , ${minMaxData[utils.translate(item.name)].max} )`}{' '}
          </div>
          ) : (
            <span> &nbsp; </span>
          )}
        </div>
        <TwoEntryCheckbox
          key={index}
          title={item.name}
          firstValue={item.greaterThan}
          firstChanged={(value) => setColumnData(data => data.map((d, i) => i === index ? { ...d, greaterThan: value } : d))}
          secondValue={item.lessThan}
          secondChanged={(value) => setColumnData(data => data.map((d, i) => i === index ? { ...d, lessThan: value } : d))}
          disabled={item.onlyMin || item.onlyMax}
          minChecked={item.onlyMin}
          minChanged={() => handleOnlyMaxOrMin(index, 'onlyMin')}
          maxChecked={item.onlyMax}
          maxChanged={() => handleOnlyMaxOrMin(index, 'onlyMax')}          
        />
      </div>
    ))}
  </div> 
  )
};

export const SelectColumnsSection = ({ checkedItems, handleCheckboxChange }) => {
  return (
    <form style={{ display: 'flex', justifyContent: 'center', marginBottom: "20px" }}>
    {checkedItems.map((item, index) => (
      <CheckboxWithIndex
        key={index}
        label={item.label}
        index={index}
        checked={item.checked}
        onChange={() => handleCheckboxChange(index)}
      />
    ))}
    </form>
  );
}