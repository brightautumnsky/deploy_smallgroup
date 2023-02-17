import React from "react";
import { Post } from "../types";
import dayjs from "dayjs";
import Link from "next/link";
import { FaComment, FaHeart } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/router";

interface PostBoxProps {
  post: Post;
  subMutate?: () => void;
}

const PostBox = ({
  post: {
    identifier,
    groupName,
    title,
    username,
    createdAt,
    body,
    url,
    likeScore,
    group,
    commentCount,
  },
  subMutate,
}: PostBoxProps) => {
  const router = useRouter();
  const isIngroupPage = router.pathname === "/sg/[group]";

  return (
    <>
      <div
        id={identifier}
        className="w-full bg-slate-50 rounded mb-3 px-3 py-5"
      >
        <div className="text-xl font-bold w-fit">
          <Link href={url}>{title}</Link>
        </div>
        <div className="w-fit">
          <Link href={`/sg/${groupName}`}>
            {isIngroupPage ? (
              <i>{groupName}</i>
            ) : (
              <>
                <Image
                  src={group!.imageUrl}
                  alt={groupName}
                  width={20}
                  height={20}
                  className="rounded-full inline-block"
                />{" "}
                <i>{groupName}</i>
              </>
            )}
          </Link>
          <br />
          <Link href={`user/${username}`} legacyBehavior>
            <a className="w-fit text-xs text-gray-500">
              {username} {dayjs(createdAt).format("YY/MM/DD")}
            </a>
          </Link>
        </div>
        <div className="mt-3">
          <Link href={url} legacyBehavior>
            <a className="mt-3 w-fit">{body}</a>
          </Link>
        </div>
        <div className="flex">
          <div className="mt-3 ml-1 mr-3 flex items-center">
            <FaHeart className="inline-block text-sm text-red-500" />
            <span className="ml-1">{likeScore}</span>
          </div>
          <div className="mt-3 ml-1 flex items-center">
            <FaComment className="inline-block text-sm text-sky-800" />
            <span className="ml-1">{commentCount}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostBox;
