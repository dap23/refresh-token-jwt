import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/home.module.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [errMsg, setErrMsg] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const userRef = useRef("");
  const errRef = useRef("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [password, username, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/register",
        { username, email, password },
        {
          withCredentials: true,
          headers: { "Content-type": "application/json" },
        }
      );
      console.log(res);
      setPassword("");
      setUsername("");
      setEmail("");
      navigate("/login");
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
      <form className={styles.formReg} onSubmit={handleSubmit}>
        <h1>Sign Up</h1>
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
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
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
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Login
          </Link>
        </p>
        <p ref={errRef} className={styles.error}>
          {errMsg && errMsg}
        </p>
      </form>
    </div>
  );
};

export default Register;
