import { Router } from "express";
import { prisma } from "../main";
import multer from "multer";
import { handleAuth } from "../utils/auth";

const app = Router();
const upload = multer({
  dest: "uploads/",
});

app.patch(
  "/update",
  async (req, res, next) => handleAuth(req, res, next),
  upload.single("avatar"),
  async (req, res) => {
    const { name, bio } = req.body;
    if (!name || !bio) {
      return res.status(400).json({
        error: "Please provide a name and bio",
      });
    }
    const owner = await prisma.owner.update({
      where: {
        token: req.headers.authorization,
      },
      data: {
        name,
        bio,
        avatar: req.file?.filename,
      },
      select: {
        name: true,
        bio: true,
        avatar: true,
      },
    });
    res.json(owner);
  }
);

app.get(
  "/",
  async (req, res, next) => handleAuth(req, res, next),
  async (req, res) => {
    const owner = await prisma.owner.findUnique({
      where: {
        token: req.headers.authorization,
      },
      select: {
        name: true,
        bio: true,
        avatar: true,
      },
    });
    res.json(owner);
  }
);

app.get(
  "/avatar",
  async (req, res, next) => handleAuth(req, res, next),
  async (req, res) => {
    const owner = await prisma.owner.findUnique({
      where: {
        token: req.headers.authorization,
      },
      select: {
        avatar: true,
      },
    });
    if (!owner) {
      return res.status(404).json({
        error: "Owner not found",
      });
    }
    if (!owner.avatar) {
      return res.status(404).json({
        error: "Avatar not found",
      });
    }
    res
      .set("Content-Disposition", 'attachment; filename="avatar.png"')
      .sendFile(owner.avatar, { root: "uploads" });
  }
);

export default app;