import bcrypt from "bcryptjs";
import User from "../Schema/User.js";
import { formatDatatoSend, generateUsername } from "../utils/assets.js";
import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";

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
          return res.status(403).json({
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

export const createBlog = async (req, res, next) => {
  let authorId = req.user;
  let { title, banner, content, des, tags, draft } = req.body;
  if (!title.length) {
    return res
      .status(405)
      .json({ error: "You must provide a title to publish the blog" });
  }
  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide a blog description under 200 characters.",
      });
    }

    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide a blog banner to publish it" });
    }
    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it." });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  // Fix string replacement
  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  let blog = new Blog({
    title,
    des,
    banner,
    content,
    tags,
    author: authorId,
    blog_id,
    draft: Boolean(draft),
  });

  blog
    .save()
    .then((blog) => {
      let incrementVal = draft ? 0 : 1;

      User.findByIdAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog.blog_id });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ error: "Failed to update total posts number" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
