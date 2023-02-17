import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    const { username }: any = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOneBy({ username });

    if (!user) {
      throw new Error("인증되지 않았습니다.");
    }

    res.locals.user = user;

    return next();
  } catch (e) {
    console.log("User Middleware Error: ", e);
    return res.status(400).json({ error: "User Middleware Error" });
  }
};
