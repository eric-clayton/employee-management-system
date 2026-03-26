// src/Login.jsx
import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!username) newErrors.username = 'Required';
    if (!password) newErrors.password = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    if (!validate()) return;

    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      const { token, role } = response.data;

      // Store JWT + role
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Redirect to home
      navigate('/');
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || 'Login failed'
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-xl mb-4 text-center">Login</h2>

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full border p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">
              {errors.username}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">
              {errors.password}
            </p>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="text-red-600 mb-3 text-center">
            {errorMessage}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2"
        >
          Login
        </button>
      </form>
    </div>
  );
}