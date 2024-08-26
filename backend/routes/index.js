const express = require("express");
const userRouter = require("./user");

const router = express.Router();

router.use("/user", userRouter); //divert to user router

module.exports = router;
