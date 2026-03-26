import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #6d28d9 60%, #7c3aed 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    padding: '2.5rem 2rem 2rem',
    width: '350px',
    maxWidth: '90vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 800,
    color: '#6d28d9',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
  },
  message: {
    color: '#4c1d95',
    fontSize: '1.1rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  button: {
    background: 'linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)',
    color: '#fff',
    padding: '0.8rem 2rem',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '1.1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
    transition: 'background 0.2s',
  },
};

export default function NoRoute() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>404 - Page Not Found</h2>
        <p style={styles.message}>
          Sorry, the page you are looking for does not exist.<br />
          You may have mistyped the address or the page may have moved.
        </p>
        <Link to="/" style={styles.button}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
