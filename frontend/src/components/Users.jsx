import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/index.module.css";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useEffect } from "react";

const Users = () => {
  const [user, setUser] = useState();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const res = await axiosPrivate.get("/users", {
          signal: controller.signal,
        });
        console.log(res.data);
        isMounted && setUser(res.data);
      } catch (err) {
        console.log(err);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    getUsers();
  }, []);

  const handleBack = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.top}>
          <h3>This only for Admin</h3>
        </div>
        <div className={styles.mid}>
          {user?.length ? (
            <ul>
              {user?.map((data, i) => (
                <li key={i}>{data?.username}</li>
              ))}
            </ul>
          ) : (
            <p>No users to display</p>
          )}
        </div>
        <div className={styles.bot}>
          <button onClick={handleBack}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default Users;
