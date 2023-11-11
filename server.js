import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true,
});

// Importing user routes from user.routes.js
import userRouter from "./routes/user.routes.js";
app.use("/", userRouter);


app.listen(PORT, () => {
  console.log(`Server listening on PORT -> ${PORT}`);
});
