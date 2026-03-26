import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales', 'Support'];

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
    department: '',
    phone: '',
    position: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (isEdit) fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      const emp = res.data;
      setForm({
        fullName: emp.fullName || emp.name || '',
        email: emp.email || '',
        password: '',
        role: emp.role || '',
        department: emp.department || '',
        phone: emp.phone || '',
        position: emp.position || '',
      });
    } catch {
      setServerError('Failed to load employee.');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!isEdit && !form.password) newErrors.password = 'Password is required';
    if (!form.role) newErrors.role = 'Please select a role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);

    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;

      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      navigate('/employees');
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to save employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <NavBar onLogout={handleLogout} />
        <p style={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  const field = (label, fieldKey, type = 'text', placeholder = '') => (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={form[fieldKey]}
        placeholder={placeholder}
        onChange={handleChange(fieldKey)}
        style={{ ...styles.input, borderColor: errors[fieldKey] ? '#ef4444' : '#e2e8f0' }}
        onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
        onBlur={(e) => (e.target.style.borderColor = errors[fieldKey] ? '#ef4444' : '#e2e8f0')}
      />
      {errors[fieldKey] && <p style={styles.errorText}>{errors[fieldKey]}</p>}
    </div>
  );

  return (
    <div style={styles.page}>
      <NavBar onLogout={handleLogout} />

      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.headerIcon}>{isEdit ? '✏️' : '👤'}</div>
            <h1 style={styles.title}>{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
            <p style={styles.subtitle}>
              {isEdit ? 'Update employee information below.' : 'Fill in the details to add a new employee.'}
            </p>
          </div>

          {/* Body */}
          <div style={styles.cardBody}>
            <form onSubmit={handleSubmit}>
              <div style={styles.twoCol}>
                {field('Full Name', 'fullName', 'text', 'Enter full name')}
                {field('Email Address', 'email', 'email', 'Enter email')}
              </div>

              <div style={styles.twoCol}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>{isEdit ? 'New Password (optional)' : 'Password'}</label>
                  <input
                    type="password"
                    value={form.password}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Create password'}
                    onChange={handleChange('password')}
                    style={{ ...styles.input, borderColor: errors.password ? '#ef4444' : '#e2e8f0' }}
                    onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                    onBlur={(e) => (e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0')}
                  />
                  {errors.password && <p style={styles.errorText}>{errors.password}</p>}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Role</label>
                  <select
                    value={form.role}
                    onChange={handleChange('role')}
                    style={{
                      ...styles.input,
                      borderColor: errors.role ? '#ef4444' : '#e2e8f0',
                      color: form.role ? '#1e293b' : '#94a3b8',
                    }}
                  >
                    <option value="" disabled>Select role</option>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {errors.role && <p style={styles.errorText}>{errors.role}</p>}
                </div>
              </div>

              <div style={styles.twoCol}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Department</label>
                  <select
                    value={form.department}
                    onChange={handleChange('department')}
                    style={{ ...styles.input, color: form.department ? '#1e293b' : '#94a3b8' }}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                {field('Position / Title', 'position', 'text', 'e.g. Senior Developer')}
              </div>

              {field('Phone Number', 'phone', 'tel', 'e.g. +1 555 000 0000')}

              {serverError && <p style={styles.globalError}>{serverError}</p>}

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate('/employees')}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Employee'}
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
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '680px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
  },
  cardHeader: {
    background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(99,102,241,0.85))',
    padding: '2rem',
    textAlign: 'center',
    color: '#fff',
  },
  headerIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  title: { margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em' },
  subtitle: { margin: 0, fontSize: '0.9rem', opacity: 0.85 },
  cardBody: { background: '#fff', padding: '2rem' },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  fieldGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' },
  input: {
    width: '100%',
    padding: '0.65rem 0.9rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    background: '#f8fafc',
  },
  errorText: { color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' },
  globalError: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: '0.875rem',
    background: '#fef2f2',
    padding: '0.5rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  cancelBtn: {
    padding: '0.7rem 1.5rem',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  submitBtn: {
    padding: '0.7rem 1.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  loadingText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingTop: '3rem' },
};
