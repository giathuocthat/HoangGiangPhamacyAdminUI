import React from "react";
import { Dropdown } from "primereact/dropdown";











const CommonSelect = ({
  value,
  options,
  placeholder = "Select",
  onChange,
  className = "",
  disabled = false,
  filter = true,
  optionLabel = "label",
  optionValue = "value"
}) => {
  return (
    <Dropdown
      value={value}
      options={Array.isArray(options) ? options : []}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      filter={filter}
      showClear={false}
      optionLabel={optionLabel}
      optionValue={optionValue}
    />
  );
};

export default CommonSelect;