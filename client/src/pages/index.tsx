import axios from "axios";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { useAuthState } from "../context/auth";
import { Group, Post } from "../types";
import useSWRInfinite from "swr/infinite";
import PostBox from "../components/PostBox";
import { useState, useEffect } from "react";

const Home: NextPage = () => {
  const { authenticated } = useAuthState();
  const fetcher = async (url: string) => {
    return await axios.get(url).then((res) => res.data);
  };
  const address = "/groups/group/topGroups";

  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/posts?page=${pageIndex}`;
  };

  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    mutate,
  } = useSWRInfinite<Post[]>(getKey, fetcher);

  const isInitialLoading = !data && !error;
  const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];
  const { data: topGroups } = useSWR<Group[]>(address, fetcher);

  // 무한 스크롤
  const [observedPost, setObservedPost] = useState("");

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    // posts 배열의 마지막 post id값
    const id = posts[posts.length - 1].identifier;
    // posts 배열이 추가되면 obsevedPost를 바뀐 마지막 post로 변경
    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  const observeElement = (element: HTMLElement | null) => {
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 }
    );
    observer.observe(element);
  };

  return (
    <div className="flex max-w-5xl px-4 pt-5 mx-auto">
      {/* 소모임 목록 */}
      <div className="hidden w-2/12 ml-3 md:block">
        <div className="p-4">
          <p className="text-left">소모임 목록</p>
        </div>
        <div>
          {topGroups?.map((group) => (
            <div
              key={group.name}
              className="flex items-center px-4 py-2 text-xs"
            >
              <Link href={`/sg/${group.name}`} legacyBehavior>
                <a>
                  <Image
                    src={group.imageUrl}
                    className="rounded-full cursor-pointer"
                    alt="Group"
                    width={20}
                    height={20}
                  />
                </a>
              </Link>
              <Link href={`/sg/${group.name}`} legacyBehavior>
                <a className="ml-2 font-bold hover:cursor-pointer">
                  {group.name}
                </a>
              </Link>
              <p className="ml-auto font-md">{group.postCount}</p>
            </div>
          ))}
        </div>
        {authenticated && (
          <div className="w-full py-6 text-center">
            <Link href="/groups/create" legacyBehavior>
              <a className="w-full p-2 text-center text-white bg-sky-800 rounded">
                소모임 만들기
              </a>
            </Link>
          </div>
        )}
      </div>
      {/* 게시글 목록 */}
      <div className="w-full md:mr-3 md:w-8/12">
        {isInitialLoading && (
          <p className="text-lg text-center">게시글을 불러오고 있습니다...</p>
        )}
        {posts.length === 0 ? (
          <div>
            <p className="text-lg text-center">게시글이 존재하지 않습니다.</p>
          </div>
        ) : (
          posts?.map((post) => <PostBox key={post.identifier} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Home;
