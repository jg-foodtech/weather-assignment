// Checkbox.js
import React from 'react';

const Checkbox = ({ label, index, checked, onChange }) => {
  return (
    <div style={{ marginRight: '20px' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(index)}
      />
      <label>{label}</label>
    </div>
  );
};

export default Checkbox;