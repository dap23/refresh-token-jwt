import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/index.module.css";
import axios from "../api/axios";
import useLogout from "../hooks/useLogout";

const Home = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  const handleClick = async (e) => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.top}>
          <h3>Welcome to JWT Learn</h3>
        </div>
        <div className={styles.mid}>
          <ul>
            <span>Private route</span>
            <li>
              <Link className={styles.link} to="/admin">
                Admin
              </Link>
            </li>
            <li>
              <Link className={styles.link} to="/users">
                User
              </Link>
            </li>
          </ul>
          <ul>
            <span>Public route</span>
            <li>
              <Link className={styles.link} to="/login">
                Login
              </Link>
            </li>
            <li>
              <Link className={styles.link} to="/register">
                Register
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.bot} style={{ gap: "10px" }}>
          <button onClick={handleClick}>Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
