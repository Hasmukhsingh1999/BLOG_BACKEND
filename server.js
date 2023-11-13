import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import cloudinary from 'cloudinary';

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
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000) +
      path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been uploaded");
});


// const cloudinary = require('cloudinary').v2;


// Configure Cloudinary with your credentials
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// const storage = multer.memoryStorage(); 
// const upload = multer({ storage: storage });

// app.post('/api/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded.' });
//     }

//     const result = await cloudinary.uploader.upload_stream(
//       (error, result) => {
//         if (error) {
//           console.error('Error uploading to Cloudinary:', error);
//           return res.status(500).json({ error: 'Failed to upload file.' });
//         }
        

//         res.status(200).json({
//           success: true,
//           message: 'File has been uploaded.',
          
//         });
//       }
//     ).end(req.file.buffer);

//   } catch (error) {
//     console.error('Error uploading to Cloudinary:', error);
//     res.status(500).json({ error: 'Failed to upload file.' });
//   }
// });




// Importing user routes from user.routes.js
import userRouter from "./routes/user.routes.js";
app.use("/", userRouter);

app.listen(PORT, () => {
  console.log(`Server listening on PORT -> ${PORT}`);
});
