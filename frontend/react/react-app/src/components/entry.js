import React, { useState } from 'react';

function Entry({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={entered}
        placeholder={placeholder}
      />
    </div>
  );
}

export default Entry;