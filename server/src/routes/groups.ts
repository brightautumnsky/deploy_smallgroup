import { Router, Request, Response, NextFunction } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import User from "../entities/User";
import Group from "../entities/Group";
import Post from "../entities/Post";
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import multer, { FileFilterCallback } from "multer";
import { makeId } from "../utils/helpers";
import path from "path";
import { readFile, unlinkSync } from "fs";

const createGroup = async (req: Request, res: Response, next) => {
  const { name, interests, description } = req.body;

  try {
    let errors: any = {};
    if (isEmpty(name)) {
      errors.name = "소모임 이름을 정해주세요.";
    }
    if (isEmpty(interests)) {
      errors.name = "소모임 관심사를 정해주세요.";
    }

    const group = await AppDataSource.getRepository(Group)
      .createQueryBuilder("group")
      .where("lower(group.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (group) {
      errors.name = "동일한 소모임 이름이 존재합니다.";
    }

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (e) {
    console.log("Create Group Error: ", e);
    return res
      .status(500)
      .json({ error: "소모임 만들기 중 오류가 발생했습니다." });
  }

  try {
    const user: User = res.locals.user;

    const group = new Group();
    group.name = name;
    group.interests = interests;
    group.description = description;
    group.user = user;

    await group.save();
    return res.json(group);
  } catch (e) {
    console.log("Create Group Error: ", e);
    return res
      .status(500)
      .json({ error: "소모임 만들기 중 오류가 발생했습니다." });
  }
};

const topGroups = async (req: Request, res: Response) => {
  try {
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' ||g."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const groups = await AppDataSource.createQueryBuilder()
      .select(
        `g.interests, g.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Group, "g")
      .leftJoin(Post, "p", `g.name = p."groupName"`)
      .groupBy('g.interests, g.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();

    return res.json(groups);
  } catch (e) {
    console.log("Top Groups Error: ", e);
    return res
      .status(500)
      .json({ error: "상위 소모임 정렬 중 오류가 발생했습니다." });
  }
};

const getGroup = async (req: Request, res: Response) => {
  const name = req.params.name;
  try {
    const group = await Group.findOneByOrFail({ name });

    // 게시글 생성 후 해당 소모임에 속하는 게시글 정보 삽입
    const posts = await Post.find({
      where: { groupName: group.name },
      order: { createdAt: "DESC" },
      relations: ["comments", "likes"],
    });

    group.posts = posts;

    if (res.locals.user) {
      group.posts.forEach((post) => post.setUserLike(res.locals.user));
    }

    return res.json(group);
  } catch (e) {
    console.log("GetGroup Error: ", e);
    return res.status(404).json({ error: "소모임을 찾을 수 없습니다." });
  }
};

const ownGroup = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const group = await Group.findOneOrFail({
      where: { name: req.params.name },
    });

    if (group.username !== user.username) {
      return res.status(403).json({ error: "소모임장이 아닙니다." });
    }

    res.locals.group = group;

    next();
  } catch (e) {
    console.log("OnwGroup Error: ", e);
    return res.status(500).json({ error: "OwnGroup Error" });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeId(10);
      callback(null, name + path.extname(file.originalname));
    },
  }),

  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new Error("이미지 파일을 등록해야합니다."));
    }
  },
});

const uploadGroupImage = async (req: Request, res: Response) => {
  const group: Group = res.locals.group;

  try {
    const type = req.body.type;
    if (type !== "image" && type !== "banner") {
      if (!req.file?.path) {
        return res
          .status(400)
          .json({ error: "파일의 경로가 유효하지 않습니다." });
      }

      // 유형이 일치하지 않는 파일 삭제
      unlinkSync(req.file.path);
      return res.status(400).json({ error: "파일의 유형이 잘못되었습니다." });
    }

    let oldImageUrn: string = "";
    if (type === "image") {
      // 사용중인 URN 저장
      oldImageUrn = group.imageUrn || "";
      // 새로운 파일 이름을 URN으로 저장
      group.imageUrn = req.file?.filename || "";
    } else if (type === "banner") {
      oldImageUrn = group.bannerUrn || "";
      group.bannerUrn = req.file?.filename || "";
    }

    await group.save();

    // 이전 이미지 삭제
    if (oldImageUrn !== "") {
      const fullFileName = path.resolve(
        process.cwd(),
        "public",
        "images",
        oldImageUrn
      );

      unlinkSync(fullFileName);
    }

    return res.json(group);
  } catch (e) {
    console.log("UploadGroupImage Error: ", e);
    return res
      .status(500)
      .json({ error: "이미지 업로드 중 오류가 발생했습니다." });
  }
};

const deleteGroup = async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    // 해당 그룹
    const group = await Group.findOneByOrFail({ name });

    const sg = await Group.createQueryBuilder()
      .delete()
      .from(Group)
      .where({ name: group.name })
      .execute();

    if (group.imageUrn) {
      const deleteImage = path.resolve(
        process.cwd(),
        "public",
        "images",
        group.imageUrn
      );

      unlinkSync(deleteImage);
    }

    if (group.bannerUrn) {
      const deleteBanner = path.resolve(
        process.cwd(),
        "public",
        "images",
        group.bannerUrn
      );

      unlinkSync(deleteBanner);
    }

    if (!sg) {
      return;
    }

    return res.json(sg);
  } catch (e) {
    console.log(e);
  }
};

const router = Router();

router.get("/delete/:name", userMiddleware, authMiddleware, deleteGroup);
router.post("/", userMiddleware, authMiddleware, createGroup);
router.get("/group/topGroups", topGroups);
router.get("/:name", userMiddleware, getGroup);
router.post(
  "/:name/upload",
  userMiddleware,
  authMiddleware,
  ownGroup,
  upload.single("file"),
  uploadGroupImage
);
export default router;
