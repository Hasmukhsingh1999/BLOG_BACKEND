import express from "express";
import { createBlog, createUser, signIn} from "../controllers/user.controller.js";

const router = express.Router();


//REGISTER POST ROUTE ->
router.post("/signup", createUser);


//LOGIN POST ROUTE ->
router.post("/signin",signIn)


//CREATE BLOG -> 
router.post('/create-blog',createBlog)



export default router;
