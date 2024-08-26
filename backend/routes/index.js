const express = require("express");
const userRouter = require("./user");
const accountRouter = require("./account");

const router = express.Router();

router.use("/user", userRouter); //divert to user router
router.use("/account", accountRouter); //divert to user router

module.exports = router;
