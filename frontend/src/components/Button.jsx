import "./Button.css";

function Button({ children, variant = "primary", size = "md", onClick, type = "button", disabled, loading }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
    >
      {loading ? <span className="btn-spinner">⏳</span> : children}
    </button>
  );
}

export default Button;
