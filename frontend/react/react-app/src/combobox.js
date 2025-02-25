import { useEffect } from 'react';

const Combobox = ({ options, label, value, onChange, placeholder="선택 안함", disabled=false, defaultIndex }) => {
  useEffect(() => {
    if (defaultIndex !== undefined && !value && options.length > 0) {
      onChange(options[defaultIndex]);
    }
  }, [options, value, defaultIndex, onChange]);

  return (
    <div key = {label} style = {{ marginBottom: '3px'}}>
      <label>{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value) }
        disabled={disabled}
      >
      <option value="" disabled hidden>
        {placeholder}
      </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

const Entry = ({ label, placeholder, value, onChange }) => {
  return (
    <div>
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(s) => onChange(s.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

const TwoEntryCheckbox = ({ title, firstValue, firstChanged, secondValue, secondChanged, disabled, minChecked, minChanged, maxChecked, maxChanged }) => {
  useEffect(() => {
    // Remove entries if min or max is selected
    if ((maxChecked || minChecked) && (firstValue !== '' || secondValue !== '')) {
      firstChanged('');
      secondChanged('');
    }
  }, [maxChecked, minChecked, firstChanged, secondChanged, firstValue, secondValue]);

  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' }}>
      <span>{ title }</span>
      <div>
        <input
          type="text"
          style={{ width: '80px' }}
          value={firstValue}
          onChange={(s) => firstChanged(s.target.value)}
          placeholder={`최소 ${title}`}
          disabled={disabled}
        />
        <label>{"이상"}</label>
      </div>
      <div>
        <input
          type="text"
          style={{ width: '80px' }}
          value={secondValue}
          onChange={(s) => secondChanged(s.target.value)}
          placeholder={`최대 ${title}`}
          disabled={disabled}
        />
        <label>{"이하"}</label>        
      </div>
      <Checkbox
        label={"최소"}
        checked={minChecked}
        onChange={minChanged}
      />
      <Checkbox
        label={"최대"}
        checked={maxChecked}
        onChange={maxChanged}
    />
    </div>
  );
}

const TwoEntry = ({ title, firstValue, firstChanged, secondValue, secondChanged }) => {
  return (
    <div>
      <span>{ title }</span>
      <div>
        <input
          type="text"
          style={{ width: '80px' }}
          value={firstValue}
          onChange={(s) => firstChanged(s.target.value)}
          placeholder={`최소 ${title}`}
        />
        <label>{"이상"}</label>
      </div>
      <div>
        <input
          type="text"
          style={{ width: '80px' }}
          value={secondValue}
          onChange={(s) => secondChanged(s.target.value)}
          placeholder={`최대 ${title}`}
        />
        <label>{"이하"}</label>        
      </div>
    </div>
  );
}

const Checkbox = ({ label, checked, onChange, disabled = false }) => {
  return (
    <div style={{ marginLeft: '10px', marginRight: '10px' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label>{label}</label>
    </div>
  );
};

const CheckboxWithIndex = ({ label, checked, index, onChange }) => {
  return (
    <div key = {index} style={{ marginRight: '20px' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(index)}
      />
      <label>{label}</label>
    </div>
  );
};

const EntryCombobox = ({ entryLabel, entryPlaceholder, entryChanged, comboLabel, comboOptions, comboValue, comboboxChanged, comboPlaceholder, comboDisabled }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <Entry 
        label={entryLabel} 
        placeholder={entryPlaceholder}
        onChange={entryChanged} 
      />
      <Combobox 
        label={comboLabel}
        options={comboOptions} 
        value={comboValue} 
        onChange={comboboxChanged}
        placeholder={comboPlaceholder}
        disabled={comboDisabled}
      />
    </div>
  );
};

export { Combobox, Checkbox, Entry, CheckboxWithIndex, EntryCombobox, TwoEntry, TwoEntryCheckbox }