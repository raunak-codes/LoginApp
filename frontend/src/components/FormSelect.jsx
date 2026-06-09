import "./FormComponents.css";

/**
 * Generic select/dropdown component
 */
function FormSelect({ label, id, value, onChange, options, placeholder, required, error, hint }) {
  return (
    <div className="form-field">
      {label && <label className="form-label" htmlFor={id}>{label}{required && <span className="form-required">*</span>}</label>}
      <select
        id={id}
        className={`form-control${error ? " form-control--error" : ""}`}
        value={value}
        onChange={onChange}
        required={required}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error-msg">{error}</p>}
    </div>
  );
}

export default FormSelect;
