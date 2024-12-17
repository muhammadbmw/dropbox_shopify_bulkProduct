const express = require("express");
const router = express.Router();
const {
  dropboxAuth,
  dropboxCallback,
} = require("../controllers/dropboxController");

router.get("/", dropboxAuth);

router.get("/callback", dropboxCallback);

module.exports = router;
