import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import "./db";
import authRouter from "./routers/auth";

const cors = require("cors");
const app = express();
const port = process.env.PORT||8997;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("src/public"));

app.use("/auth",authRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
