import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import NavBar from "../components/NavBar";

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "HR",
  "Finance",
  "Operations",
  "Sales",
  "Support",
];

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    salary: "",
    status: "Active",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (isEdit) fetchEmployee();
    // eslint-disable-next-line
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      const emp = res.data;
      setForm({
        name: emp.name || "",
        email: emp.email || "",
        position: emp.position || "",
        department: emp.department || "",
        salary: emp.salary || "",
        status: emp.status || "Active",
      });
    } catch {
      setServerError("Failed to load employee.");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.position.trim()) newErrors.position = "Position is required";
    if (!form.department.trim())
      newErrors.department = "Department is required";
    if (!form.salary || isNaN(form.salary))
      newErrors.salary = "Valid salary is required";
    if (!form.status.trim()) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      let payload = { ...form, salary: parseFloat(form.salary) };
      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
      } else {
        // Generate a unique employee_id (e.g., EMP + random 4-digit number)
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const employee_id = `EMP${randomNum}`;
        // Add createdAt in ISO format
        const createdAt = new Date().toISOString();
        payload = { ...payload, employee_id, createdAt };
        await api.post("/employees", payload);
      }
      navigate("/employees");
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Failed to save employee.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  const field = (label, fieldKey, type = "text", placeholder = "") => (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={form[fieldKey]}
        placeholder={placeholder}
        onChange={handleChange(fieldKey)}
        style={{
          ...styles.input,
          borderColor: errors[fieldKey] ? "#ef4444" : "#e2e8f0",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
        onBlur={(e) =>
          (e.target.style.borderColor = errors[fieldKey]
            ? "#ef4444"
            : "#e2e8f0")
        }
      />
      {errors[fieldKey] && <p style={styles.errorText}>{errors[fieldKey]}</p>}
    </div>
  );

  return (
    <div style={styles.page}>

      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.headerIcon}>{isEdit ? "✏️" : "👤"}</div>
            <h1 style={styles.title}>
              {isEdit ? "Edit Employee" : "Add Employee"}
            </h1>
            <p style={styles.subtitle}>
              {isEdit
                ? "Update employee information below."
                : "Fill in the details to add a new employee."}
            </p>
          </div>
          {/* Body */}
          <div style={styles.cardBody}>
            <form onSubmit={handleSubmit}>
              <div style={styles.twoCol}>
                {field("Name", "name", "text", "Enter name")}
                {field("Email Address", "email", "email", "Enter email")}
              </div>
              <div style={styles.twoCol}>
                {field("Position", "position", "text", "e.g. Developer")}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Department</label>
                  <select
                    value={form.department}
                    onChange={handleChange("department")}
                    style={{
                      ...styles.input,
                      borderColor: errors.department ? "#ef4444" : "#e2e8f0",
                      color: form.department ? "#1e293b" : "#94a3b8",
                    }}
                  >
                    <option value="" disabled>
                      Select department
                    </option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p style={styles.errorText}>{errors.department}</p>
                  )}
                </div>
                {field("Salary", "salary", "number", "e.g. 50000")}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={form.status}
                    onChange={handleChange("status")}
                    style={{
                      ...styles.input,
                      borderColor: errors.status ? "#ef4444" : "#e2e8f0",
                      color: form.status ? "#1e293b" : "#94a3b8",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p style={styles.errorText}>{errors.status}</p>
                  )}
                </div>
              </div>
              {serverError && <p style={styles.globalError}>{serverError}</p>}
              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate("/employees")}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting
                    ? "Saving…"
                    : isEdit
                      ? "Save Changes"
                      : "Add Employee"}
                </button>
              </div>
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
    color: "#1e293b",
  },
  errorText: { color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" },
  globalError: {
    color: "#ef4444",
    textAlign: "center",
    fontSize: "0.875rem",
    background: "#fef2f2",
    padding: "0.5rem",
    borderRadius: "6px",
    marginBottom: "1rem",
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    padding: "0.7rem 1.5rem",
    borderRadius: "8px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#7c3aed",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "0.7rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)",
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  twoCol: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  loadingText: {
    color: "#7c3aed",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "1.1rem",
    marginTop: "3rem",
  },
};
