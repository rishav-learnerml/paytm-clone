const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const mainRouter = require("./routes/index");

const port = process.env.PORT;

app.use("/api/v1", mainRouter);

app.listen(port, () => {
  console.log(`Server Running on localhost:${port}`);
});
