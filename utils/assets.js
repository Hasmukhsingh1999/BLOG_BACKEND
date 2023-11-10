import { nanoid } from "nanoid";
import User from "../Schema/User.js";
import jwt from  'jsonwebtoken';


export const formatDatatoSend = (user) => {
  const access_token = jwt.sign({
    id:user._id,
  },process.env.JWT_SECRET);

    return {
      access_token,
      profileImg: user.personalInfo.profileImg,
      username: user.personalInfo.username,
      fullname: user.personalInfo.fullname,
    };
  };
  
export  const generateUsername = async (email) => {
    let username = email.split("@")[0];
    let isUsernameNotUnique = await User.exists({
      "personalInfo.username": username,
    }).then((result) => result);
    isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";
  
    return username;
  };