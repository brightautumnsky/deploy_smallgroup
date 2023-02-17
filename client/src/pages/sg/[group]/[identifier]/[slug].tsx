import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  useState,
  FormEvent,
  useEffect,
  useRef,
  ChangeEvent,
} from "react";
import useSWR from "swr";
import { Post, Comment, Group } from "../../../../types";
import { useAuthState } from "../../../../context/auth";
import { FaSmile, FaHeart } from "react-icons/fa";
import { SlArrowUp, SlArrowDown } from "react-icons/sl";
import dayjs from "dayjs";

const PostPage = () => {
  const router = useRouter();
  const { identifier, group: groupName, slug } = router.query;
  const { authenticated, user } = useAuthState();
  const [newComment, setNewComment] = useState("");

  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e: any) {
      throw e.response.data;
    }
  };

  const {
    data: post,
    error,
    mutate: postMutate,
  } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null,
    fetcher
  );
  const { data: comments, mutate: commentMutate } = useSWR<Comment[]>(
    identifier && slug ? `/posts/${identifier}/${slug}/comments` : null,
    fetcher
  );
  const { data: group } = useSWR(
    groupName ? `/groups/${groupName}` : null,
    fetcher
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ownGroup, setOwnGroup] = useState(false);

  useEffect(() => {
    // 소모임 이미지 변경 권한 체크
    if (!group || !user) {
      return;
    }
    setOwnGroup(authenticated && user.username === group.username);
  }, [group]);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileInputRef.current!.name);

    try {
      await axios.post(`/groups/${group.name}/upload`, formData, {
        headers: { "Context-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const openFileInput = (type: string) => {
    const fileInput = fileInputRef.current;

    if (fileInput) {
      fileInput.name = type;
      fileInput.click();
    }
  };

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (newComment.trim() === "") {
      return;
    }

    try {
      await axios.post(`/posts/${post?.identifier}/${post?.slug}/comments`, {
        body: newComment,
      });

      commentMutate();
      setNewComment("");
    } catch (e) {
      console.log("SubmitComment Error: ", e);
    }
  };

  const vote = async (value: number, comment?: Comment) => {
    if (!authenticated) {
      router.push("/login");
    }

    if (
      (!comment && value === post?.userLike) ||
      (comment && comment.userLike === value)
    ) {
      value = 0;
    }

    try {
      await axios.post("/likes", {
        identifier,
        slug,
        commentIdentifier: comment?.identifier,
        value,
      });

      postMutate();
      commentMutate();
    } catch (e) {
      console.log("Vote Error: ", e);
    }
  };

  const deletePost = async () => {
    try {
      await axios.get(`/posts/delete/${identifier}`);

      router.push("/");
    } catch (e) {
      console.log("DeletePost Error: ", e);
    }
  };

  const deleteComment = async (identifier: any) => {
    try {
      await axios.get(`/posts/delete/${identifier}/comment`);

      commentMutate();
    } catch (e) {
      console.log("DeleteComment Error: ", e);
    }
  };

  return (
    <div className="mb-10">
      <div>
        <input
          type="file"
          hidden={true}
          ref={fileInputRef}
          onChange={uploadImage}
        />
      </div>
      <div className="flex justify-between max-w-5xl px-4 pt-5 mx-auto">
        <div className="w-full md:mr-3 md:w-8/12">
          <div className="bg-white rounded">
            {post && (
              <>
                <div className="py-2 pr-2">
                  <h1 className="my-1 text-xl font-medium">{post.title}</h1>
                  <div className="flex items-center">
                    <p className="text-xs test-gray-400">
                      <Link href={`/user/${post.username}`} legacyBehavior>
                        <a className="hover:underline">
                          작성자: {post.username}
                        </a>
                      </Link>
                      <Link href={post.url} legacyBehavior>
                        <a className="mx-1 hover:underline">
                          작성일:{" "}
                          {dayjs(post.createdAt).format("YY/MM/DD HH:mm")}
                        </a>
                      </Link>
                    </p>
                  </div>
                  <p className="my-3">{post.body}</p>
                  <div className="flex justify-center items-center mb-2">
                    <FaHeart
                      style={{
                        fontSize: "0.7rem",
                        color: "red",
                        marginRight: "0.3rem",
                      }}
                    />
                    <span>{post.likeScore}</span>
                  </div>
                  <div className="flex justify-center gap-2">
                    <div
                      className="text-sky-800 cursor-pointer"
                      onClick={() => vote(1)}
                    >
                      {post.userLike === 1 ? (
                        <SlArrowUp className="text-red-500" />
                      ) : (
                        <SlArrowUp />
                      )}
                    </div>
                    <div
                      className="text-sky-800 cursor-pointer"
                      onClick={() => vote(-1)}
                    >
                      {post.userLike === -1 ? (
                        <SlArrowDown className="text-green-500" />
                      ) : (
                        <SlArrowDown />
                      )}
                    </div>
                  </div>
                </div>
                {/* 댓글 */}
                <div className="pr-6 my-4">
                  <div>
                    <span className="text-sky-800 text-sm">
                      {post.commentCount}댓글
                    </span>
                  </div>
                  {authenticated ? (
                    <div>
                      <p className="mb-1 text-xs">
                        <Link href={`/user/${user?.username}`} legacyBehavior>
                          <a className="font-semibold text-sky-800">
                            <FaSmile
                              style={{
                                display: "inline-block",
                                marginRight: "5px",
                              }}
                            />
                            {user?.username}
                          </a>
                        </Link>
                      </p>
                      <form onSubmit={submitComment}>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
                          onChange={(e) => setNewComment(e.target.value)}
                          value={newComment}
                        ></textarea>
                        <div className="flex justify-end">
                          <button
                            className="px-3 py-1 text-white bg-sky-800 rounded"
                            disabled={newComment.trim() === ""}
                          >
                            등록
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-2 py-4 border border-gray-200 rounded">
                      <p className="font-semibold text-sky-800">
                        로그인이 필요합니다.
                      </p>
                      <div>
                        <Link href={`/login`} legacyBehavior>
                          <a className="px-3 py-1 text-white bg-sky-800 rounded">
                            로그인
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                {comments?.map((comment) => (
                  <div className="flex mb-3" key={comment.identifier}>
                    <div className="py-2 pr-2">
                      <p className="mb-1 text-sx leading-none">
                        <Link legacyBehavior href={`/user/${comment.username}`}>
                          <a className="mr-2 text-sky-800 hover:underline">
                            {comment.username}
                          </a>
                        </Link>
                        <span className="text-gray-500 text-xs">
                          {dayjs(comment.createdAt).format("YY/MM/DD HH:mm")}
                        </span>
                      </p>
                      <p>{comment.body}</p>
                      {/* 좋아요 수 */}
                      <div className="ml-1 flex items-center">
                        <FaHeart
                          style={{
                            fontSize: "0.7rem",
                            color: "red",
                            display: "inline-block",
                          }}
                        />
                        <span className="ml-1">{comment.likeScore}</span>
                      </div>
                      {/* 좋아요 */}
                      <div className="flex ml-1 gap-x-2 mt-1">
                        <div
                          className="text-sky-800 cursor-pointer"
                          onClick={() => vote(1, comment)}
                        >
                          {comment.userLike === 1 ? (
                            <SlArrowUp className="text-red-500" />
                          ) : (
                            <SlArrowUp />
                          )}
                        </div>
                        <div
                          className="text-sky-800 cursor-pointer"
                          onClick={() => vote(-1, comment)}
                        >
                          {comment.userLike === -1 ? (
                            <SlArrowDown className="text-green-500" />
                          ) : (
                            <SlArrowDown />
                          )}
                        </div>
                      </div>
                      {user?.username === comment.username && (
                        <button
                          onClick={() => deleteComment(comment.identifier)}
                        >
                          <span className="text-xs hover:border-b hover:border-sky-800">
                            댓글 삭제하기
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          {user?.username === post?.username && (
            <button className="box-sizing:border-box" onClick={deletePost}>
              <span className="text-xs hover:border-b hover:border-sky-800">
                게시글 삭제
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
