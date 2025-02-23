const Combobox = ({ options, label, value, onChange, disabled }) => {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value) } disabled={disabled}>
        <option value="">Select an option</option>
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

const EntryCombobox = ({ entryLabel, entryPlaceholder, entryChanged, comboLabel, comboOptions, comboValue, comboboxChanged, comboDisabled }) => {
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
        disabled={comboDisabled}
      />
    </div>
  );
};

export { Combobox, Entry, Checkbox, EntryCombobox }