import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";
// import Users from "./models/UserModel.js";

dotenv.config();
const app = express();

try {
  await db.authenticate();
  // jika koneksi berhasil
  console.log("Database connected");
  /* jika tidak memiliki tabel users didalam database
    maka secara otomatis akan mengenerate*/
  // await Users.sync();
} catch (error) {
  console.error(error);
}

// origin = domain yang diizinkan untuk dapat mengakses API
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
// agar dapat menerima data dalam format json
app.use(express.json());
// sebagai middleware
app.use(router);

app.listen(5000, () => console.log("Server running at port 5000"));
