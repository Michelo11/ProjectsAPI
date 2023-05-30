import { NextFunction, Request, Response } from "express";
import { prisma } from "../main";

export async function handleAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-rapidapi-user"] as string;
    if (!token) {
        return res.status(401).json({
            error: "You are not authorized",
        });
    }
    let user = await prisma.owner.findUnique({
        where: {
            token,
        },
    });
    if (!user) {
        user = await prisma.owner.create({
            data: {
                token,
            },
        });
    }
    next();
}
