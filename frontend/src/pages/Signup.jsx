import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import "./Auth.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/signup`, form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <Building2 size={32} className="auth-brand-icon" />
            <span>PeopleDesk</span>
          </div>
          <p className="auth-tagline">
            Your HR,<br />your way.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>Create account</h2>
          <p className="auth-sub">Get started with PeopleDesk</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                placeholder="John Doe"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <a href="/">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
