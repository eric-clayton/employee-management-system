import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const NavBar = ({ onLogout }) => (
  <nav style={styles.nav}>
    <div style={styles.navLeft}>
      <span style={styles.navBrand}>📋 EMS</span>
      {[
        { label: 'Home', path: '/' },
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Reports', path: '/reports' },
        { label: 'My Profile', path: '/profile' },
      ].map((item) => (
        <Link key={item.label} to={item.path} style={styles.navLink}>{item.label}</Link>
      ))}
    </div>
    <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
  </nav>
);

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => (e.id || e._id) !== id));
    } catch {
      alert('Failed to delete employee.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.fullName || e.name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <NavBar onLogout={handleLogout} />

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Employees</h1>
            <p style={styles.pageSubtitle}>{employees.length} total employees</p>
          </div>
          {role === 'Admin' && (
            <Link to="/employees/new" style={styles.addBtn}>+ Add Employee</Link>
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
            <p style={styles.emptyText}>{search ? 'No employees match your search.' : 'No employees yet.'}</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['#', 'Name', 'Email', 'Role', 'Department', ...(role === 'Admin' ? ['Actions'] : [])].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, idx) => {
                  const id = emp.id || emp._id;
                  return (
                    <tr key={id} style={styles.tr}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...styles.td, color: '#94a3b8' }}>{idx + 1}</td>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{emp.fullName || emp.name}</td>
                      <td style={styles.td}>{emp.email}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: emp.role === 'Admin' ? '#ede9fe' : '#f0fdf4',
                          color: emp.role === 'Admin' ? '#7c3aed' : '#16a34a',
                        }}>
                          {emp.role}
                        </span>
                      </td>
                      <td style={styles.td}>{emp.department || '—'}</td>
                      {role === 'Admin' && (
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <Link to={`/employees/edit/${id}`} style={styles.editBtn}>Edit</Link>
                            <button
                              onClick={() => handleDelete(id)}
                              disabled={deletingId === id}
                              style={styles.deleteBtn}
                            >
                              {deletingId === id ? '…' : 'Delete'}
                            </button>
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
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #6d28d9 60%, #7c3aed 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: 'rgba(0,0,0,0.2)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '1.75rem' },
  navBrand: { color: '#fff', fontWeight: '800', fontSize: '1.1rem' },
  navLink: { color: '#e2d9f3', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  content: { padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' },
  pageTitle: { color: '#fff', fontSize: '2rem', fontWeight: '800', margin: '0 0 0.25rem', letterSpacing: '-0.03em' },
  pageSubtitle: { color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '0.95rem' },
  addBtn: {
    background: '#fff',
    color: '#7c3aed',
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    fontWeight: '700',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '1.25rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    borderRadius: '10px',
    border: 'none',
    fontSize: '0.95rem',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    outline: 'none',
    backdropFilter: 'blur(8px)',
    boxSizing: 'border-box',
  },
  loadingText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  emptyState: { textAlign: 'center', paddingTop: '3rem' },
  emptyIcon: { fontSize: '3rem', margin: '0 0 0.5rem' },
  emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: '1rem' },
  tableWrapper: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '0.85rem 1rem',
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: '700',
    borderBottom: '2px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: '#f8fafc',
  },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' },
  td: { padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#334155' },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  actions: { display: 'flex', gap: '0.5rem' },
  editBtn: {
    display: 'inline-block',
    padding: '0.3rem 0.75rem',
    borderRadius: '6px',
    background: '#ede9fe',
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: '0.8rem',
    textDecoration: 'none',
  },
  deleteBtn: {
    padding: '0.3rem 0.75rem',
    borderRadius: '6px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};
