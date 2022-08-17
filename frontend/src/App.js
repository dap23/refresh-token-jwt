import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Users from "./components/Users";
import PersistLogin from "./components/PersistLogin";
import RequireAuth from "./components/RequireAuth";

const ROLES = {
  User: 2001,
  Editor: 1984,
  Admin: 5150,
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route element={<PersistLogin />}>
          <Route index element={<Home />} />
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
