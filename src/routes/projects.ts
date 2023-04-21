import { Router, Request } from "express";
import { prisma } from "../main";
import multer from "multer";
import { handleAuth } from "../utils/auth";

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

app.post(
  "/create",
  async (req: Request, res, next) => handleAuth(req, res, next),
  upload.array("images"),
  async (req, res) => {
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
        owner: {
          connect: {
            token: req.headers.authorization,
          },
        },
      },
      include: {
        images: true,
      },
    });
    res.json(project);
  }
);

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

app.patch(
  "/update/:id",
  upload.array("images"),
  async (req: Request, res, next) => handleAuth(req, res, next),
  async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !description) {
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
    let project = await prisma.project.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        images: true,
        owner: true,
      },
    });
    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }
    if (project.owner.token !== req.headers.authorization) {
      return res.status(401).json({
        error: "You are not authorized",
      });
    }
    project = await prisma.project.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        description,
        images: {
          create: images,
        },
      },
      include: {
        images: true,
        owner: true,
      },
    });
    const { owner, ...rest } = project;
    res.json(rest);
  }
);

export default app;