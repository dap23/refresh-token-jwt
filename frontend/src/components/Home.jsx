import React from "react";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";

const Home = () => {
  const { auth } = useAuth();
  const user = auth?.user;

  const handleRefresh = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get("/refresh", { withCredentials: true });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1>Hi, {user?.username}</h1>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
};

export default Home;
