import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NavBar from "../components/NavBar";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
  const deptMap = employees.reduce((acc, e) => {
    const dept = e.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const recent = [...employees].slice(-5).reverse();

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Dashboard</h1>
        <p style={styles.pageSubtitle}>Overview of your workforce</p>
        {loading ? (
          <p style={styles.loadingText}>Loading data…</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={styles.cardRow}>
              {[
                {
                  label: "Total Employees",
                  value: employees.length,
                  icon: "👥",
                  color: "#7c3aed",
                },
                {
                  label: "Departments",
                  value: Object.keys(deptMap).length,
                  icon: "🏢",
                  color: "#a855f7",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    ...styles.summaryCard,
                    borderTop: `4px solid ${card.color}`,
                  }}
                >
                  <div style={styles.cardIconRow}>
                    <span style={styles.cardIcon}>{card.icon}</span>
                    <span style={{ ...styles.cardValue, color: card.color }}>
                      {card.value}
                    </span>
                  </div>
                  <div style={styles.cardLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Department breakdown */}
            {Object.keys(deptMap).length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Employees by Department</h2>
                <div style={styles.glassCard}>
                  {Object.entries(deptMap).map(([dept, count]) => (
                    <div key={dept} style={styles.deptRow}>
                      <span style={styles.deptName}>{dept}</span>
                      <div style={styles.deptBarTrack}>
                        <div
                          style={{
                            height: "100%",
                            width: `${(count / employees.length) * 100}%`,
                            background:
                              "linear-gradient(90deg, #7c3aed, #a855f7)",
                            borderRadius: "4px",
                            minWidth: "4px",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                      <span style={styles.deptCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Employees */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Recently Added</h2>
              <div style={styles.glassCard}>
                {recent.length === 0 ? (
                  <p style={styles.emptyText}>No employees yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {["Name", "Email", "Role", "Department"].map((h) => (
                          <th key={h} style={styles.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((emp) => (
                        <tr key={emp.id || emp._id} style={styles.tr}>
                          <td style={styles.td}>{emp.fullName || emp.name}</td>
                          <td style={styles.td}>{emp.email}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                background:
                                  emp.role === "Admin" ? "#ede9fe" : "#f0fdf4",
                                color:
                                  emp.role === "Admin" ? "#7c3aed" : "#16a34a",
                              }}
                            >
                              {emp.role}
                            </span>
                          </td>
                          <td style={styles.td}>{emp.department || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
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
  pageTitle: {
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "800",
    margin: "0 0 0.25rem",
    letterSpacing: "-0.03em",
  },
  pageSubtitle: {
    color: "rgba(255,255,255,0.65)",
    margin: "0 0 2rem",
    fontSize: "1rem",
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: "1rem",
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.25rem",
    marginBottom: "2.5rem",
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  cardIconRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  cardIcon: { fontSize: "1.5rem" },
  cardValue: { fontSize: "1.75rem", fontWeight: "800" },
  cardLabel: { fontSize: "0.8rem", color: "#64748b", fontWeight: "500" },
  section: { marginBottom: "2.5rem" },
  sectionTitle: {
    color: "#fff",
    fontSize: "1.15rem",
    fontWeight: "700",
    marginBottom: "0.85rem",
  },
  glassCard: {
    background: "rgba(255,255,255,0.97)",
    borderRadius: "14px",
    padding: "1.5rem",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  },
  barLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: "#475569",
    marginBottom: "0.5rem",
  },
  barTrack: {
    display: "flex",
    height: "16px",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#f1f5f9",
  },
  barFill: { height: "100%", transition: "width 0.5s ease" },
  barLegend: {
    marginTop: "0.75rem",
    fontSize: "0.82rem",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  legendDot: (bg) => ({
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: bg,
    verticalAlign: "middle",
  }),
  deptRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.75rem",
  },
  deptName: {
    width: "120px",
    fontSize: "0.875rem",
    color: "#334155",
    fontWeight: "500",
    flexShrink: 0,
  },
  deptBarTrack: {
    flex: 1,
    height: "10px",
    background: "#f1f5f9",
    borderRadius: "5px",
    overflow: "hidden",
  },
  deptCount: {
    width: "24px",
    textAlign: "right",
    fontSize: "0.875rem",
    color: "#475569",
    fontWeight: "600",
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
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    margin: 0,
    fontSize: "1rem",
  },
};
