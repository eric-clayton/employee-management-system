import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const links = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  const styles = {
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#282c34",
      color: "#fff",
      padding: "0.5rem 2rem",
    },
    navLeft: {
      display: "flex",
      alignItems: "center",
      gap: 24,
    },
    navBrand: {
      fontWeight: 700,
      fontSize: 22,
      marginRight: 24,
    },
    navLink: {
      color: "#fff",
      textDecoration: "none",
      fontWeight: 500,
      fontSize: 16,
      marginRight: 16,
    },
    logoutBtn: {
      background: "#ff5252",
      color: "#fff",
      border: "none",
      borderRadius: 4,
      padding: "8px 18px",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: 16,
    },
  };
  return (
    <nav style={styles.nav}>
      <div style={styles.navLeft}>
        <span style={styles.navBrand}>📋 EMS</span>
        {(
          links || [
            { label: "Home", path: "/" },
            { label: "Dashboard", path: "/dashboard" },
          ]
        ).map((item) => (
          <Link key={item.label} to={item.path} style={styles.navLink}>
            {item.label}
          </Link>
        ))}
      </div>
      {handleLogout && (
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      )}
    </nav>
  );
};

export default NavBar;
