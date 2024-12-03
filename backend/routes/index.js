const express = require("express")
const userRouter = require("./user.js")
const router = express.Router()
const accountRouter = require("./account.js")
router.use("/user", userRouter)
router.use("/account", accountRouter)
module.exports = router