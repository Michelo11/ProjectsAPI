import { Router } from "express";
import { prisma } from "../main";

const app = Router();

app.get("/", async (req, res) => {
    const reviews = await prisma.review.findMany({});
    res.json(reviews);
});

app.post("/create", async (req, res) => {
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
        },
    });
    res.json(review);
});

export default app;