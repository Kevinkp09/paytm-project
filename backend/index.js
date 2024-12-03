const express = require("express")
const cors = require("cors")
const app = express()
const mainRouter = require("./routes/index.js")

app.use(cors())
app.use(express.json())
app.use("/api/v1", mainRouter)

app.listen(3000, console.log("app is listening on port 3000"))