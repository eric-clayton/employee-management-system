import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import "./Employees.css";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editRow, setEditRow] = useState(null); // employee_id of row being edited
  const [editData, setEditData] = useState({}); // temp data for editing
  const [savingId, setSavingId] = useState(null);
  const [orderBy, setOrderBy] = useState("name");
  const [orderDir, setOrderDir] = useState("asc");
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
    // eslint-disable-next-line
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

  // Enhanced search: name, department, or role (position)
  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.name || "").toLowerCase().includes(q) ||
      (e.department || "").toLowerCase().includes(q) ||
      (e.position || "").toLowerCase().includes(q)
    );
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[orderBy] ?? "";
    let bVal = b[orderBy] ?? "";
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();
    if (aVal < bVal) return orderDir === "asc" ? -1 : 1;
    if (aVal > bVal) return orderDir === "asc" ? 1 : -1;
    return 0;
  });

  // Helper for toggling sort
  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDir(orderDir === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrderDir("asc");
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-content">
        <div className="employees-header">
          <div>
            <h1 className="employees-title">Employees</h1>
            <p className="employees-subtitle">
              {employees.length} total employees
            </p>
          </div>
          {role === "admin" && (
            <Link to="/employeeform" className="employees-add-btn">
              + Add Employee
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="employees-search-wrapper">
          <span className="employees-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, department, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="employees-search-input"
          />
        </div>

        {loading ? (
          <p className="employees-loading-text">Loading employees…</p>
        ) : filtered.length === 0 ? (
          <div className="employees-empty-state">
            <p className="employees-empty-icon">🔍</p>
            <p className="employees-empty-text">
              {search ? "No employees match your search." : "No employees yet."}
            </p>
          </div>
        ) : (
          <div className="employees-table-wrapper">
            <table className="employees-table">
              <thead>
                <tr>
                  <th className="employees-th">#</th>
                  <th
                    className="employees-th"
                    onClick={() => handleSort("name")}
                  >
                    Name{" "}
                    {orderBy === "name" && (orderDir === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    className="employees-th"
                    onClick={() => handleSort("email")}
                  >
                    Email{" "}
                    {orderBy === "email" && (orderDir === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    className="employees-th"
                    onClick={() => handleSort("position")}
                  >
                    Role{" "}
                    {orderBy === "position" && (orderDir === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    className="employees-th"
                    onClick={() => handleSort("department")}
                  >
                    Department{" "}
                    {orderBy === "department" &&
                      (orderDir === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    className="employees-th"
                    onClick={() => handleSort("salary")}
                  >
                    Salary{" "}
                    {orderBy === "salary" && (orderDir === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    className="employees-th"
                    onClick={() => handleSort("status")}
                  >
                    Status{" "}
                    {orderBy === "status" && (orderDir === "asc" ? "▲" : "▼")}
                  </th>
                  {role === "admin" && (
                    <th className="employees-th">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sorted.map((emp, idx) => {
                  const employee_id = emp.employee_id;
                  const isEditing = editRow === employee_id;
                  return (
                    <tr
                      key={employee_id}
                      className="employees-tr"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td className="employees-td" style={{ color: "#94a3b8" }}>
                        {idx + 1}
                      </td>
                      <td className="employees-td" style={{ fontWeight: 600 }}>
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
                      <td className="employees-td">
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
                      <td className="employees-td">
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
                      <td className="employees-td">
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
                      <td className="employees-td">
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
                      <td className="employees-td">
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
                        <td className="employees-td">
                          <div className="employees-actions">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleEditSave(employee_id)}
                                  disabled={savingId === employee_id}
                                  className="employees-edit-btn"
                                >
                                  {savingId === employee_id
                                    ? "Saving…"
                                    : "Save"}
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="employees-delete-btn"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(emp)}
                                  className="employees-edit-btn"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(employee_id)}
                                  disabled={deletingId === employee_id}
                                  className="employees-delete-btn"
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
