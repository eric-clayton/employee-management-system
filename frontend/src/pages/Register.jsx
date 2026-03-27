import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!role) newErrors.role = "Please select a role";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validate()) return;

    try {
      await api.post("/auth/register", { username, email, password, role });
      navigate("/login");
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* Nav */}
      <nav style={styles.nav}>
        {["Home", "Dashboard", "Reports", "My Profile"].map((item) => (
          <Link
            key={item}
            to={`/${item.toLowerCase().replace(" ", "-")}`}
            style={styles.navLink}
          >
            {item}
          </Link>
        ))}
      </nav>

      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.headerIcon}>📋</div>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>
              Join Employee Management System and
              <br />
              get started managing your team!
            </p>
          </div>

          {/* Form Body */}
          <div style={styles.cardBody}>
            <form onSubmit={handleRegister}>
              {/* Username */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  style={styles.input}
                  value={username}
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.username
                      ? "#ef4444"
                      : "#e2e8f0")
                  }
                />
                {errors.username && (
                  <p style={styles.errorText}>{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  style={styles.input}
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.email
                      ? "#ef4444"
                      : "#e2e8f0")
                  }
                />
                {errors.email && <p style={styles.errorText}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={styles.input}
                  value={password}
                  placeholder="Create a password"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.password
                      ? "#ef4444"
                      : "#e2e8f0")
                  }
                />
                {errors.password && (
                  <p style={styles.errorText}>{errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Role</label>
                <select
                  style={{
                    ...styles.input,
                    borderColor: errors.role
                      ? "#ef4444"
                      : role
                        ? "#7c3aed"
                        : "#e2e8f0",
                    color: role ? "#1e293b" : "#94a3b8",
                  }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && <p style={styles.errorText}>{errors.role}</p>}
              </div>

              {errorMessage && <p style={styles.globalError}>{errorMessage}</p>}

              <button
                type="submit"
                style={styles.submitBtn}
                onMouseOver={(e) =>
                  (e.target.style.background =
                    "linear-gradient(135deg, #6d28d9, #4f46e5)")
                }
                onMouseOut={(e) =>
                  (e.target.style.background =
                    "linear-gradient(135deg, #7c3aed, #6366f1)")
                }
              >
                Create Account
              </button>

              <p style={styles.signInText}>
                Already have an account?{" "}
                <Link to="/login" style={styles.signInLink}>
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #6d28d9 60%, #7c3aed 100%)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  nav: {
    display: "flex",
    gap: "2rem",
    padding: "1rem 2rem",
    background: "rgba(0,0,0,0.15)",
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.95rem",
    letterSpacing: "0.02em",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "3rem 1rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
  },
  cardHeader: {
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.85), rgba(99,102,241,0.85))",
    padding: "2rem",
    textAlign: "center",
    color: "#fff",
  },
  headerIcon: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  title: {
    margin: "0 0 0.5rem",
    fontSize: "1.75rem",
    fontWeight: "700",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.9rem",
    opacity: 0.85,
    lineHeight: 1.6,
  },
  cardBody: {
    background: "#fff",
    padding: "2rem",
  },
  fieldGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    marginBottom: "0.4rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "0.65rem 0.9rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    background: "#f8fafc",
    color: "#1e293b", // dark slate
  },
  errorText: {
    color: "#ef4444",
    fontSize: "0.78rem",
    marginTop: "0.3rem",
  },
  globalError: {
    color: "#ef4444",
    textAlign: "center",
    fontSize: "0.875rem",
    marginBottom: "1rem",
    background: "#fef2f2",
    padding: "0.5rem",
    borderRadius: "6px",
  },
  submitBtn: {
    width: "100%",
    padding: "0.8rem",
    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
    marginBottom: "1.25rem",
  },
  signInText: {
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
  },
  signInLink: {
    color: "#7c3aed",
    fontWeight: "600",
    textDecoration: "none",
  },
};
