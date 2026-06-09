import "./FormComponents.css";

/**
 * Generic text / number / date / email / password input
 */
function FormInput({ label, id, type = "text", value, onChange, placeholder, required, error, hint }) {
  return (
    <div className="form-field">
      {label && <label className="form-label" htmlFor={id}>{label}{required && <span className="form-required">*</span>}</label>}
      <input
        id={id}
        type={type}
        className={`form-control${error ? " form-control--error" : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error-msg">{error}</p>}
    </div>
  );
}

export default FormInput;
