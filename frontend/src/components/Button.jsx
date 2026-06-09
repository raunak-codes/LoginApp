import "./Button.css";

function Button({ children, variant = "primary", size = "md", onClick, type = "button", disabled }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
