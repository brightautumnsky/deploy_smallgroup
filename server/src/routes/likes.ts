import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import User from "../entities/User";
import Post from "../entities/Post";
import Like from "../entities/Like";
import Comment from "../entities/Comment";

const vote = async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: "올바르지 않은 투표값입니다." });
  }

  try {
    const user: User = res.locals.user;
    let post: Post = await Post.findOneByOrFail({ identifier, slug });
    let like: Like | undefined;
    let comment: Comment;

    if (commentIdentifier) {
      // 댓글 식별자가 있는 경우 댓글의 like
      comment = await Comment.findOneByOrFail({
        identifier: commentIdentifier,
      });
      like = await Like.findOneBy({
        username: user.username,
        commentId: comment.id,
      });
    } else {
      // 게시글 식별자가 있는 경우 게시글의 like
      like = await Like.findOneBy({ username: user.username, postId: post.id });
    }

    if (!like && value === 0) {
      // 테이블에 like이 없는데 유저가 같은 투표값을 누른 경우
      return res.status(404).json({ error: "투표값을 찾을 수 없습니다." });
    } else if (!like) {
      // like 정보가 없는 경우 새로운 인스턴스 생성
      like = new Like();
      like.user = user;
      like.value = value;

      if (comment) {
        like.comment = comment;
      } else {
        like.post = post;
      }
      await like.save();
    } else if (value === 0) {
      // 같은 투푯값을 클릭한 경우
      like.remove();
    } else if (like.value !== value) {
      // 다른 투푯값을 클릭한 경우
      like.value = value;
      await like.save();
    }

    post = await Post.findOneOrFail({
      where: {
        identifier,
        slug,
      },
      relations: ["comments", "comments.likes", "group", "likes"],
    });

    post.setUserLike(user);
    post.comments.forEach((c) => c.setUserLike(user));

    return res.json(post);
  } catch (e) {
    console.log("VoteError: ", e);
    return res.status(500).json({ error: "VoteError" });
  }
};

const router = Router();

router.post("/", userMiddleware, authMiddleware, vote);

export default router;
