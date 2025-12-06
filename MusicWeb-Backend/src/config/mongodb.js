import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on("connected", () => {
        console.log("MongoDB kết nối thành công");
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/musicweb`);
}

export default connectDB;