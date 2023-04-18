import express from "express";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import multer from "multer";

config();

const prisma = new PrismaClient();
const app = express();
const upload = multer({
  dest: "uploads/",
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      images: true,
    },
  });
  res.json(projects);
});

app.post("/create", upload.array("images"), async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description || !req.files) {
    return res.status(400).json({
      error: "Please provide a name and description",
    });
  }
  const images = [];
  for (const file of req.files as any) {
    images.push({
      name: file.originalname,
    });
  }
  const project = await prisma.project.create({
    data: {
      name,
      description,
      images: {
        create: images,
      },
    },
    include: {
      images: true,
    },
  });
  res.json(project);
});

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
