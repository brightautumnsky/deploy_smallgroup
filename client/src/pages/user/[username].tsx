import React, { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import axios from "axios";
import dayjs from "dayjs";
import { Post, Comment } from "../../types";
import PostBox from "../../components/PostBox";
import CommentBox from "../../components/CommentBox";

const userPage = () => {
  const router = useRouter();
  const username = router.query.username;

  const fetcher = async (url: string) => {
    return await axios.get(url).then((response) => response.data);
  };

  const address = username ? `/users/${username}` : null;
  const { data, error } = useSWR<any>(address, fetcher);

  if (!data) {
    return null;
  }

  return (
    <div className="max-w-5xl px-4 pt-5 mx-auto">
      {/* 유저 정보 */}
      <div>
        <p>
          <span className="font-bold text-2xl">{data.user.username}</span>님
          안녕하세요.
        </p>
        <p className="text-xs mt-2">
          {dayjs(data.user.createdAt).format("YYYY/MM/DD")}에 가입하셨습니다.
        </p>
      </div>
      {/* 유저의 게시글과 댓글 정보 */}
      <div className="w-full md:mr-3 md:2-8/12 my-10">
        {data.userData.length === 0 ? (
          <div className="py-8">
            <h3>아직 작성하신 게시글과 댓글이 없습니다.</h3>
          </div>
        ) : (
          data.userData.map((data: any) => {
            if (data.type === "Post") {
              const post: Post = data;
              return <PostBox key={post.identifier} post={post} />;
            } else {
              const comment: Comment = data;
              return <CommentBox key={comment.identifier} comment={comment} />;
            }
          })
        )}
      </div>
    </div>
  );
};

export default userPage;
