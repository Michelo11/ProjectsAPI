import { NextFunction, Request, Response } from "express";
import { prisma } from "../main";

export async function handleAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({
            error: "You are not authorized",
        });
    }
    const user = await prisma.owner.findUnique({
        where: {
            token,
        },
    });
    if (!user) {
        return res.status(401).json({
            error: "You are not authorized",
        });
    }
    next();
}