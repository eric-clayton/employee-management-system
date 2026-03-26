// src/Login.jsx
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #6d28d9 60%, #7c3aed 100%)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    padding: "2.5rem 2rem 2rem",
    width: "350px",
    maxWidth: "90vw",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  title: {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: 800,
    color: "#6d28d9",
    marginBottom: "0.5rem",
    letterSpacing: "-0.02em",
  },
  label: {
    display: "block",
    marginBottom: "0.4rem",
    fontWeight: 600,
    color: "#4c1d95",
    fontSize: "1rem",
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "0.7rem",
    fontSize: "1rem",
    outline: "none",
    marginBottom: "0.2rem",
    transition: "border 0.2s",
  },
  error: {
    color: "#ef4444",
    fontSize: "0.92rem",
    marginTop: "0.1rem",
    marginBottom: 0,
    textAlign: "left",
  },
  errorMessage: {
    color: "#b91c1c",
    background: "#fee2e2",
    borderRadius: "6px",
    padding: "0.5rem",
    textAlign: "center",
    marginBottom: "0.5rem",
    fontWeight: 600,
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    background: "linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)",
    color: "#fff",
    padding: "0.9rem",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "1.1rem",
    cursor: "pointer",
    marginTop: "0.5rem",
    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)",
    transition: "background 0.2s",
  },
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Required";
    if (!password) newErrors.password = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validate()) return;
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      navigate("/");
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        {/* Username */}
        <div>
          <label htmlFor="username" style={styles.label}>
            Username
          </label>
          <input
            id="username"
            type="text"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          {errors.username && <p style={styles.error}>{errors.username}</p>}
        </div>
        {/* Password */}
        <div>
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {errors.password && <p style={styles.error}>{errors.password}</p>}
        </div>
        {/* Error message */}
        {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
        {/* Submit */}
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}
