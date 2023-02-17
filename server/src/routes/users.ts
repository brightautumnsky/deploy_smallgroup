import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import User from "../entities/User";
import Post from "../entities/Post";
import Comment from "../entities/Comment";

const getUserData = async (req: Request, res: Response) => {
  const username = req.params.username;

  try {
    const user = await User.findOneOrFail({
      where: { username },
      select: ["username", "createdAt"],
    });

    // 작성 게시글 불러오기
    const posts = await Post.find({
      where: { username },
      relations: ["comments", "likes", "group"],
    });

    const comments = await Comment.find({
      where: { username },
      relations: ["post"],
    });

    if (res.locals.user) {
      const { user } = res.locals;
      posts.forEach((post) => post.setUserLike);
      comments.forEach((comment) => comment.setUserLike(user));
    }

    let userData: any[] = [];
    posts.forEach((post) => userData.push({ type: "Post", ...post.toJSON() }));
    comments.forEach((comment) =>
      userData.push({ type: "Comment", ...comment.toJSON() })
    );

    // 최신 정보로 정렬
    userData.sort((a, b) => {
      if (b.createdAt > a.createdAt) {
        return 1;
      }
      if (b.createdAt < a.createdAt) {
        return -1;
      }
    });

    return res.json({ user, userData });
  } catch (e) {
    console.log("GetUser Error: ", e);
    return res.status(500).json({ error: "GetUser Error" });
  }
};

const router = Router();

router.get("/:username", userMiddleware, authMiddleware, getUserData);

export default router;
