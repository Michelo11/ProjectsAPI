import express from "express";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import reviews from "./routes/reviews";
import projects from "./routes/projects";

config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/reviews", reviews);
app.use("/projects", projects);

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});

export {
  app,
  prisma,
};