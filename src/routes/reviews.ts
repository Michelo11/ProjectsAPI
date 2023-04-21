import { Router } from "express";
import { prisma } from "../main";
import { handleAuth } from "../utils/auth";

const app = Router();

app.get("/", async (req, res) => {
  const reviews = await prisma.review.findMany({});
  res.json(reviews);
});

app.post(
  "/create",
  async (req, res, next) => handleAuth(req, res, next),
  async (req, res) => {
    const { author, comment, rating } = req.body;
    if (!author || !comment || !rating) {
      return res.status(400).json({
        error: "Please provide a name, description and rating",
      });
    }
    const review = await prisma.review.create({
      data: {
        author,
        comment,
        rating,
        owner: {
          connect: {
            token: req.headers.authorization,
          },
        },
      },
    });
    res.json(review);
  }
);

app.patch(
  "/update/:id",
  async (req, res, next) => handleAuth(req, res, next),
  async (req, res) => {
    const { id } = req.params;
    const { author, comment, rating } = req.body;
    if (!author || !comment || !rating) {
      return res.status(400).json({
        error: "Please provide a name, description and rating",
      });
    }
    let review = await prisma.review.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        owner: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    if (review.owner.token !== req.headers.authorization) {
      return res.status(401).json({
        error: "You are not authorized",
      });
    }

    review = await prisma.review.update({
      where: {
        id: parseInt(id),
      },
      data: {
        author,
        comment,
        rating,
      },
      include: {
        owner: true,
      },
    });
    const { owner, ...rest } = review;
    res.json(rest);
  }
);

export default app;