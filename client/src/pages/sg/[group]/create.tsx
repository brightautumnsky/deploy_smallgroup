import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useState, FormEvent } from "react";
import { Post } from "../../../types";
import classNames from "classnames";

const Postcreate = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const router = useRouter();
  const { group: groupName } = router.query;

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim() === "" || !groupName) {
      return;
    }

    try {
      const { data: post } = await axios.post<Post>("/posts", {
        title: title.trim(),
        body,
        group: groupName,
      });

      router.push(`/sg/${groupName}/${post.identifier}/${post.slug}`);
    } catch (e) {
      console.log("SubmitPost Error: ", e);
    }
  };

  return (
    <div className="flex flex-col justify-center pt-16">
      <div className="w-10/12 mx-auto md:w-96">
        <div className="p-4 bg-white">
          <h1 className="mb-3 text-lg">게시글 작성</h1>
          <form onSubmit={submitPost}>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="제목"
                className="w-full px-3 py-2 border border-gray-500"
                maxLength={20}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="absolute top-2.5 right-2 text-sm text-gray-300 select-none">
                {title.length}/20
              </div>
            </div>
            <textarea
              rows={4}
              placeholder="내용"
              className="w-full px-3 py-2 border border-gray-500"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
              }}
            />
            <div className="flex justify-end">
              <button className="px-4 py-1 text-sm font-semibold text-white bg-sky-800 border rounded">
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Postcreate;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      throw new Error("쿠키가 존재하지 않습니다.");
    }

    await axios.get("/auth/me", { headers: { cookie } });
    return { props: {} };
  } catch (e) {
    res.writeHead(307, { Location: "/login" }).end();
    return { props: {} };
  }
};
