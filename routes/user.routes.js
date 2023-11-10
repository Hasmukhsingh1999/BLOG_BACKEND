import express from "express";
import { createUser} from "../controllers/user.controller.js";

const router = express.Router();


//REIGITER POST ROUTE ->
router.post("/signup", createUser);


export default router;
