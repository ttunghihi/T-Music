import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import songRouter from './src/routes/songRoute.js';
import connectDB from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRouter from './src/routes/albumRoute.js';
import userRouter from './src/routes/userRoute.js';
import adminRouter from './src/routes/adminRoute.js';
import premiumRouter from './src/routes/premiumRoute.js';
import playlistRouter from './src/routes/playlistRoute.js';
import podcastRouter from './src/routes/podcastRoute.js';

//app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();


//middlewares
app.use(express.json());
app.use(cors());


//intializing routes

app.use("/api/song", songRouter)
app.use("/api/album", albumRouter)
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter);
app.use("/api/premium", premiumRouter);
app.use("/api/playlist", playlistRouter)
app.use("/api/podcast", podcastRouter)
app.get('/', (req, res) => res.send("API đang hoạt động"))

app.listen(port, () => console.log(`Server đang chạy trên cổng: ${port}`))