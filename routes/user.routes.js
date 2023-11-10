import express from "express";
import { createUser, signIn} from "../controllers/user.controller.js";

const router = express.Router();


//REGISTER POST ROUTE ->
router.post("/signup", createUser);


//LOGIN POST ROUTE ->
router.post("/signin",signIn)



export default router;
