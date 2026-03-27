import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import NavBar from "../components/NavBar";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editRow, setEditRow] = useState(null); // employee_id of row being edited
  const [editData, setEditData] = useState({}); // temp data for editing
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let role = "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role || "";
    } catch {
      role = "";
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employee_id) => {
    if (!window.confirm("Delete this employee?")) return;
    setDeletingId(employee_id);
    try {
      await api.delete(`/employees/${employee_id}`);
      setEmployees((prev) => prev.filter((e) => e.employee_id !== employee_id));
    } catch {
      alert("Failed to delete employee.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (emp) => {
    setEditRow(emp.employee_id);
    setEditData({ ...emp });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditCancel = () => {
    setEditRow(null);
    setEditData({});
  };

  const handleEditSave = async (employee_id) => {
    setSavingId(employee_id);
    try {
      const payload = { ...editData, salary: parseFloat(editData.salary) };
      await api.put(`/employees/${employee_id}`, payload);
      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === employee_id ? { ...payload, employee_id } : e,
        ),
      );
      setEditRow(null);
      setEditData({});
    } catch {
      alert("Failed to save changes.");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.department || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Employees</h1>
            <p style={styles.pageSubtitle}>
              {employees.length} total employees
            </p>
          </div>
          {role === "admin" && (
            <Link to="/employeeform" style={styles.addBtn}>
              + Add Employee
            </Link>
          )}
        </div>

        {/* Search */}
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading employees…</p>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🔍</p>
            <p style={styles.emptyText}>
              {search ? "No employees match your search." : "No employees yet."}
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "#",
                    "Name",
                    "Email",
                    "Role",
                    "Department",
                    ...(role === "admin" ? ["Actions"] : []),
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, idx) => {
                  const employee_id = emp.employee_id;
                  const isEditing = editRow === employee_id;
                  return (
                    <tr
                      key={employee_id}
                      style={styles.tr}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ ...styles.td, color: "#94a3b8" }}>
                        {idx + 1}
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600" }}>
                        {isEditing ? (
                          <input
                            value={editData.name || ""}
                            onChange={(e) =>
                              handleEditChange("name", e.target.value)
                            }
                            style={{ width: "100%" }}
                          />
                        ) : (
                          emp.name
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            value={editData.email || ""}
                            onChange={(e) =>
                              handleEditChange("email", e.target.value)
                            }
                            style={{ width: "100%" }}
                          />
                        ) : (
                          emp.email
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            value={editData.position || ""}
                            onChange={(e) =>
                              handleEditChange("position", e.target.value)
                            }
                            style={{ width: "100%" }}
                          />
                        ) : (
                          emp.position
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            value={editData.department || ""}
                            onChange={(e) =>
                              handleEditChange("department", e.target.value)
                            }
                            style={{ width: "100%" }}
                          />
                        ) : (
                          emp.department || "—"
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData.salary || ""}
                            onChange={(e) =>
                              handleEditChange("salary", e.target.value)
                            }
                            style={{ width: "100%" }}
                          />
                        ) : (
                          emp.salary
                        )}
                      </td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <select
                            value={editData.status || "Active"}
                            onChange={(e) =>
                              handleEditChange("status", e.target.value)
                            }
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          emp.status
                        )}
                      </td>
                      {role === "admin" && (
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleEditSave(employee_id)}
                                  disabled={savingId === employee_id}
                                  style={styles.editBtn}
                                >
                                  {savingId === employee_id
                                    ? "Saving…"
                                    : "Save"}
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  style={styles.deleteBtn}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(emp)}
                                  style={styles.editBtn}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(employee_id)}
                                  disabled={deletingId === employee_id}
                                  style={styles.deleteBtn}
                                >
                                  {deletingId === employee_id ? "…" : "Delete"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
  content: { padding: "2.5rem 2rem", maxWidth: "1100px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "1.5rem",
  },
  pageTitle: {
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "800",
    margin: "0 0 0.25rem",
    letterSpacing: "-0.03em",
  },
  pageSubtitle: {
    color: "rgba(255,255,255,0.65)",
    margin: 0,
    fontSize: "0.95rem",
  },
  addBtn: {
    background: "#fff",
    color: "#7c3aed",
    padding: "0.6rem 1.25rem",
    borderRadius: "10px",
    fontWeight: "700",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: "1.25rem",
  },
  searchIcon: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1rem",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 2.75rem",
    borderRadius: "10px",
    border: "none",
    fontSize: "0.95rem",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    outline: "none",
    backdropFilter: "blur(8px)",
    boxSizing: "border-box",
  },
  loadingText: { color: "rgba(255,255,255,0.7)", textAlign: "center" },
  emptyState: { textAlign: "center", paddingTop: "3rem" },
  emptyIcon: { fontSize: "3rem", margin: "0 0 0.5rem" },
  emptyText: { color: "rgba(255,255,255,0.7)", fontSize: "1rem" },
  tableWrapper: {
    background: "rgba(255,255,255,0.97)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "0.85rem 1rem",
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: "700",
    borderBottom: "2px solid #e2e8f0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: "#f8fafc",
  },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
  td: { padding: "0.8rem 1rem", fontSize: "0.9rem", color: "#334155" },
  badge: {
    display: "inline-block",
    padding: "0.2rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  actions: { display: "flex", gap: "0.5rem" },
  editBtn: {
    display: "inline-block",
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    background: "#ede9fe",
    color: "#7c3aed",
    fontWeight: "600",
    fontSize: "0.8rem",
    textDecoration: "none",
  },
  deleteBtn: {
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    fontWeight: "600",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
};
