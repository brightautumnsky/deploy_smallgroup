import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Group from "../entities/Group";
import Post from "../entities/Post";
import Comment from "../entities/Comment";

const createPost = async (req: Request, res: Response) => {
  const { title, body, group } = req.body;
  if (title.trim() === "") {
    return res.status(400).json({ title: "제목을 비워둘 수 없습니다." });
  }

  const user = res.locals.user;

  try {
    const groupRecord = await Group.findOneByOrFail({ name: group });
    const post = new Post();
    post.title = title;
    post.body = body;
    post.user = user;
    post.group = groupRecord;

    await post.save();

    return res.json(post);
  } catch (e) {
    console.log("CreatePost Error: ", e);
    return res.status(500).json({ error: "CreatePost Error" });
  }
};

const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneOrFail({
      where: { identifier, slug },
      relations: ["group", "likes"],
    });

    if (res.locals.user) {
      post.setUserLike(res.locals.user);
    }

    return res.send(post);
  } catch (e) {
    console.log("GetPost Error: ", e);
    return res.status(404).json({ error: "GetPost Error" });
  }
};

const createPostComment = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const body = req.body.body;

  try {
    const post = await Post.findOneByOrFail({ identifier, slug });
    const comment = new Comment();

    comment.body = body;
    comment.post = post;
    comment.user = res.locals.user;

    if (res.locals.user) {
      post.setUserLike(res.locals.user);
    }

    await comment.save();

    return res.json(comment);
  } catch (e) {
    console.log("CreateComment Error: ", e);

    return res.status(404).json({ error: "CreatePostComment Error" });
  }
};

const getPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneByOrFail({ identifier, slug });
    const comments = await Comment.find({
      where: { postId: post.id },
      order: { createdAt: "DESC" },
      relations: ["likes"],
    });

    if (res.locals.user) {
      comments.forEach((comment) => comment.setUserLike(res.locals.user));
    }

    return res.json(comments);
  } catch (e) {
    console.log("GetPostComments Error: ", e);
    return res.status(500).json({ error: "GetPostComments Error" });
  }
};

const getPosts = async (req: Request, res: Response) => {
  const currentPage: number = (req.query.page || 0) as number;
  const perPage: number = (req.query.count || 5) as number;

  try {
    const posts = await Post.find({
      order: { createdAt: "DESC" },
      relations: ["group", "likes", "comments"],
      skip: currentPage * perPage,
      take: perPage,
    });

    if (res.locals.user) {
      posts.forEach((post) => post.setUserLike(res.locals.user));
    }

    return res.json(posts);
  } catch (e) {
    console.log("GetPosts Error: ", e);
  }
};

const deletePost = async (req: Request, res: Response) => {
  const { identifier } = req.params;

  try {
    // 해당 게시글
    const post = await Post.findOneByOrFail({ identifier });

    const dp = await Post.createQueryBuilder()
      .delete()
      .from(Post)
      .where({ identifier: post.identifier })
      .execute();

    if (!post) {
      return;
    }

    return res.json(dp);
  } catch (e) {
    console.log("DeletePost Error: ", e);
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const { identifier } = req.params;

  const comment = await Comment.findOneByOrFail({ identifier });

  const cm = await Comment.createQueryBuilder()
    .delete()
    .from(Comment)
    .where({ identifier: comment.identifier })
    .execute();

  if (!cm) {
    return;
  }

  return res.json(cm);
};

const searchPosts = async (req: Request, res: Response) => {
  const { searchKey } = req.body;

  try {
    const posts = await Post.find({
      where: { title: searchKey },
      order: { createdAt: "DESC" },
      relations: ["group", "likes", "comments"],
    });

    if (res.locals.user) {
      posts.forEach((post) => post.setUserLike(res.locals.user));
    }

    return res.json(posts);
  } catch (e) {
    console.log("SearchPosts Error: ", e);
  }
};

const router = Router();

router.get("/:identifier/:slug", userMiddleware, getPost);
router.post("/", userMiddleware, authMiddleware, createPost);
router.get("/:identifier/:slug/comments", userMiddleware, getPostComments);
router.post("/:identifier/:slug/comments", userMiddleware, createPostComment);
router.get("/", userMiddleware, getPosts);
router.get("/delete/:identifier", userMiddleware, deletePost);
router.get("/delete/:identifier/comment", userMiddleware, deleteComment);
router.post("/search", userMiddleware, searchPosts);

export default router;
