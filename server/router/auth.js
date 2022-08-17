const router = require("express").Router();
const {
  handleLogin,
  handleRegister,
  handleRefresh,
  handleLogout,
} = require("../controllers/authControllers");

router.post("/login", handleLogin);
router.post("/register", handleRegister);
router.get("/refresh", handleRefresh);
router.get("/logout", handleLogout);

module.exports = router;
