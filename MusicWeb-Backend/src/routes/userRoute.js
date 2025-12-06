// routes/userRoute.js
import express from 'express';
import {
  registerUser,
  loginUser,
  listUsers,
  removeUser,
  upgradeUserToPremium,
  toggleLikeSong,
  getMyLikedSongs,
  sendOtpToEmail,
  verifyOtp,
  googleLogin
} from '../controllers/userController.js';
import authenticate from '../middleware/authenticate.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// protected user actions
userRouter.post('/like/:songId', authenticate, toggleLikeSong);
userRouter.get('/likes', authenticate, getMyLikedSongs);

// admin-ish actions (you may want additional admin check in middleware)
userRouter.get('/list', listUsers);
userRouter.post('/remove', removeUser);
userRouter.post('/upgrade', upgradeUserToPremium);

userRouter.post('/send-otp', sendOtpToEmail);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/google-login', googleLogin);


export default userRouter;
