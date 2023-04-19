import { Router } from "express";
import { prisma } from "../main";
import multer from "multer";

const app = Router();
const upload = multer({
  dest: "uploads/",
});

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
      path: file.filename,
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

app.get("/images/:id", async (req, res) => {
  const { id } = req.params;
  const image = await prisma.image.findUnique({
    where: {
      id: Number(id),
    },
  });
  if (!image) {
    return res.status(404).json({
      error: "Image not found",
    });
  }
  res
    .set("Content-Disposition", 'attachment; filename="' + image.name + '"')
    .sendFile(image.path, { root: "uploads" });
});

export default app;