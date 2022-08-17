const router = require("express").Router();
const userControllers = require("../controllers/userControllers");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/rolesList");

router
  .route("/")
  .get(userControllers.getAllUsers)
  .delete(verifyRoles(ROLES_LIST.Admin), userControllers.deleteUser);
router
  .route("/:id")
  .get(verifyRoles(ROLES_LIST.Admin), userControllers.getUser);

module.exports = router;
