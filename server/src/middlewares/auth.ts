import { NextFunction, Request, Response } from "express";
import User from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User | undefined = res.locals.user;

    if (!user) {
      throw new Error("인증되지 않았습니다.");
    }

    return next();
  } catch (e) {
    console.log("Auth Middleware Error: ", e);
    return res.status(400).json({ error: "Auth Middleware Error" });
  }
};
