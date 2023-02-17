import React from "react";
import { Comment } from "../types";
import dayjs from "dayjs";
import { GoChevronRight } from "react-icons/go";
import Link from "next/link";

interface CommentBoxProps {
  comment: Comment;
}

const CommentBox = ({
  comment: { body, createdAt, post },
}: CommentBoxProps) => {
  return (
    <div className="my-4 py-5 px-3 bg-slate-50 rounded">
      <p>
        {body}
        <span className="text-xs text-gray-500 ml-2">
          {dayjs(createdAt).format("YY/MM/DD")}
        </span>
      </p>
      <div className="flex items-center mt-3">
        <GoChevronRight />
        <Link href={post!.url}>
          <p className="text-xl font-bold">{post?.title}</p>
        </Link>
        <Link href={`/user/${post?.username}`}>
          <p className="ml-2 text-xs text-gray-500 hover:underline">{`${
            post?.username
          } ${dayjs(post?.createdAt).format("YY/MM/DD")}`}</p>
        </Link>
      </div>
    </div>
  );
};

export default CommentBox;
