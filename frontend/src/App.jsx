import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Employees from "./pages/Employees";
import Dashboard from "./pages/Dashboard";
import EmployeeForm from "./pages/EmployeeForm";
import NoRoute from "./pages/NoRoute";

import { useEffect } from "react";
import NavBar from "./components/NavBar";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    // If not logged in and not already on /login or /register, redirect to /login
    if (
      !token &&
      location.pathname !== "/login" &&
      location.pathname !== "/register"
    ) {
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  // Hide NavBar on login/register
  const hideNav =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employeeform" element={<EmployeeForm />} />
        <Route path="*" element={<NoRoute />} />
      </Routes>
    </>
  );
}

export default App;
