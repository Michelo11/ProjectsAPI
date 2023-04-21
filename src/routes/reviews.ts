import { Router } from "express";
import { prisma } from "../main";
import { handleAuth } from "../utils/auth";
import { randomUUID } from "crypto";

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

app.post(
  "/invite",
  async (req, res, next) => handleAuth(req, res, next),
  async (req, res) => {
    const token = randomUUID();

    const invitation = await prisma.reviewInvitation.create({
      data: {
        token,
        owner: {
          connect: {
            token: req.headers.authorization,
          },
        },
      },
    });

    res.json(invitation);
  }
);

app.post(
  "/invite/:token",
  async (req, res, next) => handleAuth(req, res, next),
  async (req, res) => {
    const { token } = req.params;
    const { author, comment, rating } = req.body;
    if (!author || !comment || !rating) {
      return res.status(400).json({
        error: "Please provide a name, description and rating",
      });
    } else if (!token) {
      return res.status(400).json({
        error: "Please provide a token",
      });
    }

    const invitation = await prisma.reviewInvitation.findUnique({
      where: {
        token,
      },
      include: {
        owner: true,
      },
    });

    if (!invitation) {
      return res.status(404).json({
        error: "Invitation not found",
      });
    }

    const review = await prisma.review.create({
      data: {
        author,
        comment,
        rating,
        owner: {
          connect: {
            token: invitation.owner.token,
          },
        },
      },
    });

    res.json(review);

    await prisma.reviewInvitation.delete({
      where: {
        token,
      },
    });
  }
);

export default app;