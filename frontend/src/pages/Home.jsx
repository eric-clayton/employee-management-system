import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Home() {
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/employees');
      const employees = res.data;
      setStats({
        total: employees.length,
        admins: employees.filter((e) => e.role === 'Admin').length,
        users: employees.filter((e) => e.role === 'User').length,
      });
    } catch {
      // stats remain zero
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const statCards = [
    { label: 'Total Employees', value: stats.total, icon: '👥', color: '#7c3aed' },
    { label: 'Admins', value: stats.admins, icon: '🛡️', color: '#6366f1' },
    { label: 'Users', value: stats.users, icon: '👤', color: '#8b5cf6' },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={styles.navBrand}>📋 EMS</span>
          {[
            { label: 'Home', path: '/' },
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Reports', path: '/reports' },
            { label: 'My Profile', path: '/profile' },
          ].map((item) => (
            <Link key={item.label} to={item.path} style={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </nav>

      <div style={styles.content}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Welcome to Employee Management</h1>
          <p style={styles.heroSubtitle}>
            Manage your team efficiently — all in one place.
          </p>
          {role === 'Admin' && (
            <Link to="/employees/new" style={styles.heroBtn}>+ Add Employee</Link>
          )}
        </div>

        {/* Stat Cards */}
        {loading ? (
          <p style={styles.loadingText}>Loading stats…</p>
        ) : (
          <div style={styles.statsGrid}>
            {statCards.map((card) => (
              <div key={card.label} style={{ ...styles.statCard, borderTop: `4px solid ${card.color}` }}>
                <div style={styles.statIcon}>{card.icon}</div>
                <div style={styles.statValue}>{card.value}</div>
                <div style={styles.statLabel}>{card.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div style={styles.actionsSection}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <Link to="/employees" style={styles.actionCard}>
              <span style={styles.actionIcon}>📂</span>
              <span style={styles.actionLabel}>View Employees</span>
            </Link>
            {role === 'Admin' && (
              <Link to="/employees/new" style={styles.actionCard}>
                <span style={styles.actionIcon}>➕</span>
                <span style={styles.actionLabel}>Add Employee</span>
              </Link>
            )}
            <Link to="/dashboard" style={styles.actionCard}>
              <span style={styles.actionIcon}>📊</span>
              <span style={styles.actionLabel}>Dashboard</span>
            </Link>
            <Link to="/reports" style={styles.actionCard}>
              <span style={styles.actionIcon}>📈</span>
              <span style={styles.actionLabel}>Reports</span>
            </Link>
          </div>
        </div>
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
  navBrand: { color: '#fff', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.01em' },
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
  content: { padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '3rem' },
  heroTitle: { color: '#fff', fontSize: '2.25rem', fontWeight: '800', margin: '0 0 0.75rem', letterSpacing: '-0.03em' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', margin: '0 0 1.5rem' },
  heroBtn: {
    display: 'inline-block',
    background: '#fff',
    color: '#7c3aed',
    padding: '0.7rem 1.75rem',
    borderRadius: '10px',
    fontWeight: '700',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.25rem',
    marginBottom: '3rem',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  statIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#1e293b' },
  statLabel: { fontSize: '0.875rem', color: '#64748b', fontWeight: '500', marginTop: '0.25rem' },
  loadingText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: '1rem' },
  actionsSection: { },
  sectionTitle: { color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1rem',
  },
  actionCard: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: '#fff',
    transition: 'background 0.2s',
  },
  actionIcon: { fontSize: '1.75rem' },
  actionLabel: { fontWeight: '600', fontSize: '0.9rem' },
};
