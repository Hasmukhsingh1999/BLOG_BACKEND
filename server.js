import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import multer from 'multer';
import path from 'path'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true,
});



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1000000) + path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});


const upload = multer({storage:storage});
app.post("/api/upload",upload.single("file"),(req,res)=>{
  res.status(200).json("File has been uploaded")
})

// Importing user routes from user.routes.js
import userRouter from "./routes/user.routes.js";
app.use("/", userRouter);


app.listen(PORT, () => {
  console.log(`Server listening on PORT -> ${PORT}`);
});
