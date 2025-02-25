import React from 'react';
import * as utils from './utils';

const TableDisplay = ({ items, checkedLabels }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <table className="data-table" border="1">
        <thead>
          <tr>
            <th>#</th>
              {checkedLabels.map((column) => (
                <th key={column}>{utils.translate(column)}</th>
              ))}
            </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td>{index + 1}</td>
                {checkedLabels.map((column) => (
                  <td key={column}>
                    { column === "datetime"
                      ? utils.formatDate(item[column]) 
                      : item[column] }
                  </td>
                  ))
                }
            </tr>
          ))}
        </tbody>
      </table> 
    </div>
  );
}
export default TableDisplay;