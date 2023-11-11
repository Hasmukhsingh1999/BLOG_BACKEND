import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import admin from "firebase-admin";
import serviceAccount from "./react-js-blog-website-f2d81-firebase-adminsdk-buh39-364a00ca85.json";
import { getAuth } from "firebase-admin/auth";

import User from "./Schema/User.js";
import { formatDatatoSend, generateUsername } from "./utils/assets.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

mongoose.connect(process.env.MONGO_URL, {
  autoIndex: true,
});

// Importing user routes from user.routes.js
import userRouter from "./routes/user.routes.js";
app.use("/", userRouter);

app.post("/google-auth", async (req, res) => {
  try {
    const { access_token } = req.body;
    const decodedUser = await getAuth().verifyIdToken(access_token);

    let { email, name, picture } = decodedUser;
    picture = picture.replace("s96-c", "s384-c");

    let user = await User.findOne({ "personalInfo.email": email }).select(
      "personalInfo.fullname personalInfo.username personalInfo.profileImg google_auth"
    );

    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            "This email was signed up without Google. Please log in with a password to access the account",
        });
      }
    } else {
      let username = await generateUsername(email);
      user = new User({
        personalInfo: { fullname: name, email, profileImg: picture, username },
        google_auth: true,
      });

      await user.save();
      return res.status(200).json(formatDatatoSend(user));
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT -> ${PORT}`);
});
