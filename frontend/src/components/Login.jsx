import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/home.module.css";
import axios from "../api/axios";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

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
        "/login",
        { username, password },
        {
          withCredentials: true,
          headers: { "Content-type": "application/json" },
        }
      );
      setAuth({ user: res?.data?.user, accessToken: res?.data?.accessToken });
      setPassword("");
      setUsername("");
      navigate("/");
    } catch (error) {
      if (error.response.status === 500) {
        setErrMsg("Internal Server Error");
      } else if (error.response.status === 404) {
        setErrMsg("Wrong Credentials!");
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
