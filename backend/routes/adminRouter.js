

import express from 'express';
import { adminLogin, adminRegister } from '../contollers/userauthcontroller.js';
const userRouter = express.Router();


userRouter.post('/register',adminRegister)
userRouter.post('/login',adminLogin)





export default userRouter;