import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/home.module.css";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [errMsg, setErrMsg] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const userRef = useRef("");
  const errRef = useRef("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [password, username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/auth/login",
        { username, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      const accessToken = res?.data?.accessToken;
      const user = res?.data?.user;
      setAuth({ accessToken, user });
      setPassword("");
      setUsername("");
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.originalStatus) {
        setErrMsg("Server no response");
      } else if (err.originalStatus === 400) {
        setErrMsg("Missing username and password");
      } else if (err.originalStatus === 401) {
        setErrMsg("Unauthorized");
      } else if (err.originalStatus === 404) {
        setErrMsg("Wrong Credentials");
      }
      errRef.current.focus();
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        <div className={styles.input}>
          <div className={styles["input-group"]}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              autoComplete="off"
              ref={userRef}
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
            />
          </div>
          <div className={styles["input-group"]}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
        </div>
        <button>Submit</button>
        <p>
          Did not have an account?{" "}
          <Link to="/register" className={styles.link}>
            Register
          </Link>
        </p>
        <p ref={errRef} className={styles.error}>
          {errMsg && errMsg}
        </p>
      </form>
    </div>
  );
};

export default Login;
