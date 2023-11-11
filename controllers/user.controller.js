import bcrypt from "bcryptjs";
import User from "../Schema/User.js";
import { formatDatatoSend, generateUsername } from "../utils/assets.js";

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

export const createUser = async (req, res, next) => {
  try {
    const { fullname, password, email } = req.body;

    // Validate inputs
    if (fullname.length < 3) {
      return res
        .status(403)
        .json({ error: "Fullname must be at least 3 letters long!" });
    }

    if (!email.length) {
      return res.status(403).json({ error: "Enter Email" });
    }

    if (!emailRegex.test(email)) {
      return res.status(403).json({ error: "Email is invalid" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(403).json({ error: "Password is invalid" });
    }

    // Hash the password
    bcrypt.hash(password, 10, async (err, hash_password) => {
      if (err) {
        throw err;
      }
      let username = await generateUsername(email);

      // Create a new user instance
      const user = new User({
        personalInfo: {
          fullname,
          email,
          password: hash_password,
          username,
        },
      });

      // Save the user to the database
      try {
        const savedUser = await user.save();
        return res.status(200).json(formatDatatoSend(savedUser));
      } catch (error) {
        if (error.code === 11000) {
          return res.status(500).json({ error: "Email already existed" });
        }
        return res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const signIn = (req, res, next) => {
  let { email, password } = req.body;
  User.findOne({ "personalInfo.email": email })
    .select("+personalInfo.password")
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }

      bcrypt.compare(password, user.personalInfo.password, (err, result) => {
        if (err) {
          console.error("Error during password comparison:", err);
          return res
            .status(403)
            .json({
              error: "Error occurred while logging in, please try again",
            });
        }
        if (!result) {
          return res.status(403).json({ error: "Incorrect password" });
        } else {
          return res.status(200).json(formatDatatoSend(user));
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
      return res
        .status(500)
        .json({ error: "Error occurred while logging in, please try again" });
    });
};
