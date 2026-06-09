import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import "../components/Layout.css";
import "./Search.css";

function Search() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: token },
      });
      setResults(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => doSearch(q), 350);
  };

  const total = results ? results.employees.length + results.assets.length + results.departments.length : 0;

  return (
    <Layout>
      <div className="page-header">
        <h2>Global Search</h2>
        <p>Search across employees, assets, and departments simultaneously.</p>
      </div>

      <div className="search-bar-wrapper">
        <span className="search-bar-icon">🔍</span>
        <input
          id="global-search-input"
          className="search-bar-input"
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search employees, assets, departments…"
          autoFocus
        />
        {loading && <span className="search-bar-spinner">⏳</span>}
      </div>

      {results !== null && (
        <div className="search-results">
          {total === 0 && (
            <div className="search-empty">No results found for "<strong>{query}</strong>"</div>
          )}

          {/* Employees */}
          {results.employees.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">👥 Employees ({results.employees.length})</div>
              {results.employees.map((emp) => (
                <div
                  key={emp.id}
                  className="search-result-item"
                  onClick={() => navigate(`/employees/edit/${emp.id}`)}
                >
                  <div className="search-result-main">{emp.name}</div>
                  <div className="search-result-meta">
                    {emp.email} · {emp.department_name} · {emp.designation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assets */}
          {results.assets.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">💻 Assets ({results.assets.length})</div>
              {results.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="search-result-item"
                  onClick={() => navigate(`/assets/${asset.id}/history`)}
                >
                  <div className="search-result-main">
                    {asset.asset_name}
                    <StatusBadge status={asset.status} style={{ marginLeft: 10 }} />
                  </div>
                  <div className="search-result-meta">
                    {asset.asset_code} · {asset.asset_type}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Departments */}
          {results.departments.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">🏢 Departments ({results.departments.length})</div>
              {results.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="search-result-item"
                  onClick={() => navigate("/departments")}
                >
                  <div className="search-result-main">{dept.department_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Search;
