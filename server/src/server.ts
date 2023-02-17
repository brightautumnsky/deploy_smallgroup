import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";

import authRoutes from "./routes/auth";
import groupsRoutes from "./routes/groups";
import PostsRoutes from "./routes/posts";
import LikesRoutes from "./routes/likes";
import UsersRoutes from "./routes/users";

import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
const origin = process.env.ORIGIN;
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin, credentials: true }));
app.use(cookieParser());

app.get("/", (_, res) => res.send("running..."));
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/posts", PostsRoutes);
app.use("/api/likes", LikesRoutes);
app.use("/api/users/", UsersRoutes);

app.use(express.static("public"));

let port = process.env.PORT;
app.listen(port, async () => {
  console.log(`server running at http://localhost:${port}`);

  // 데이터베이스 연결 확인
  AppDataSource.initialize()
    .then(async () => {
      console.log("database initialized...");
    })
    .catch((error) => console.log(error));
});
