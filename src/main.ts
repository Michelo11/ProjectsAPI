import express from "express";
import { config } from "dotenv";
import { Owner, PrismaClient } from "@prisma/client";
import multer from "multer";
import cors from "cors";
import profile from "./routes/profile";
import reviews from "./routes/reviews";
import projects from "./routes/projects";

config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/reviews", reviews);
app.use("/profile", profile);
app.use("/projects", projects);
app.use((req, res, next) => {
  const proxy = req.headers["X-RapidAPI-Proxy-Secret"]
  if (proxy === process.env.PROXY_SECRET) {
    next();
  } else {
    res.status(401).json({
      error: "Unauthorized",
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});

export {
  app,
  prisma,
};