import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import admin from 'firebase-admin';
import serviceAccount from './react-js-blog-website-f2d81-firebase-adminsdk-buh39-364a00ca85.json';
import {getAuth} from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true,
});


// Importing user routes from user.routes.js
import userRouter from "./routes/user.routes.js";
import User from "./Schema/User.js";
app.use("/", userRouter);


app.post("/googel-auth",async(req,res)=>{
  let {access_token} = req.body;
  getAuth().verifyIdToken(access_token).then(async(decodedUser)=>{
    let {email,name,picture} = decodedUser;
    picture = picture.replace("s96-c","s384-c");
    let user = await User.findOne({"personalInfo.email":email}).select("personalInfo.fullname personalInfo.fullname")
  })
})

app.listen(PORT, () => {
  console.log(`Server listening on PORT -> ${PORT}`);
});

