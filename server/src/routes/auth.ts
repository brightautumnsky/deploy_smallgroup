import { isEmpty, validate } from "class-validator";
import { Router, Request, Response } from "express";
import User from "../entities/User";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import bcrypt from "bcryptjs";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, curtError: any) => {
    prev[curtError.property] = Object.entries(curtError.constraints)[0][1];
    return prev;
  }, {});
};

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    if (emailUser) {
      errors.email = "이미 가입된 이메일 주소입니다.";
    }
    if (usernameUser) {
      errors.username = "이미 가입된 유저 아이디입니다.";
    }

    // 에러 response 리턴
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    // Entity에서 정의한 조건으로 유효성 검사
    errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json(mapError(errors));
    }

    await user.save();
    return res.json(user);
  } catch (e) {
    console.log("Auth Error: ", e);
    return res.status(400).json({ e });
  }
};

const login = async (req: Request, res: Response) => {
  const { password, username } = req.body;

  try {
    let errors: any = {};
    // 공란 에러
    if (isEmpty(username)) {
      errors.username = "아이디를 입력해주세요.";
    }

    if (isEmpty(password)) {
      errors.password = "비밀번호를 입력해주세요.";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOneBy({ username });

    // 유저 불일치
    if (!user) {
      return res.status(400).json({ username: "등록되지 않은 아이디입니다." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    // 패스워드 불일치
    if (!passwordMatches) {
      return res
        .status(400)
        .json({ password: "비밀번호가 일치하지 않습니다." });
    }

    // 비밀번호 일치
    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    // 쿠키에 토큰 저장
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    );
    return res.json({ user, token });
  } catch (e) {
    console.log("Login Error: ", e);
    return res.status(500).json(e);
  }
};

const me = async (req: Request, res: Response) => {
  return res.json(res.locals.user);
};

const logout = async (req: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );

  res.status(200).json({ success: true });
};

const router = Router();
router.get("/me", userMiddleware, authMiddleware, me);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", userMiddleware, authMiddleware, logout);

export default router;
