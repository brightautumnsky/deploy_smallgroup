import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useAuthState } from "../../context/auth";
import Sidebar from "../../components/Sidebar";
import { Post } from "../../types";
import PostBox from "../../components/PostBox";

const GroupPage = () => {
  const [ownGroup, setOwnGroup] = useState(false);
  const { authenticated, user } = useAuthState();

  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e: any) {
      throw e.response.data;
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const groupName = router.query.group;
  const { data: group, error } = useSWR(
    groupName ? `/groups/${groupName}` : null,
    fetcher
  );
  let renderPosts;

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
      alert("소모임 주인장이 이미지를 변경할 수 있습니다.");
    }
  };

  const openFileInput = (type: string) => {
    const fileInput = fileInputRef.current;

    if (fileInput) {
      fileInput.name = type;
      fileInput.click();
    }
  };

  if (!group) {
    renderPosts = <p className="text-lg text-center">로딩중...</p>;
  } else if (group.posts.length === 0) {
    renderPosts = (
      <p className="text-lg text-center">작성된 게시글이 없습니다.</p>
    );
  } else {
    renderPosts = group.posts.map((post: Post) => (
      <PostBox key={post.identifier} post={post} />
    ));
  }

  const deleteGroup = async () => {
    try {
      await axios.get(`/groups/delete/${groupName}`);
      router.push("/");
    } catch (e) {
      console.log("DeleteGroup Error: ", e);
    }
  };

  return (
    <div>
      {/* 소모임 배너 */}
      {group && (
        <>
          <div>
            <input
              type="file"
              hidden={true}
              ref={fileInputRef}
              onChange={uploadImage}
            />
            {/* 소모임 배너 이미지 */}
            <div className="pt-3 bg-sky-800">
              {group.bannerUrl ? (
                <div
                  className="h-60"
                  style={{
                    backgroundImage: `url(${group.bannerUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => openFileInput("banner")}
                ></div>
              ) : (
                <div
                  className="h-21 bg-sky-500"
                  onClick={() => openFileInput("banner")}
                ></div>
              )}
            </div>
            {/* 소모임 메타 데이터 */}
            <div>
              <div className="h-20 bg-sky-800">
                <div className="h-20 relative flex max-w-5xl px-5 mx-auto">
                  <div className="flex items-center cursor-pointer">
                    {group.imageUrl && (
                      <Image
                        className="rounded-full"
                        src={group.imageUrl}
                        alt="소모임 이미지"
                        width={60}
                        height={60}
                        onClick={() => openFileInput("image")}
                      />
                    )}
                  </div>
                  <div className="pt-1 pl-24">
                    <div className="flex items-center">
                      <h1 className="mb-1 text-3xl font-bold text-white">
                        {group.interests}
                      </h1>
                    </div>
                    <p
                      className="text-small font-bold text-white"
                      style={{ marginLeft: "3px" }}
                    >
                      {group.name}
                    </p>
                  </div>
                </div>
                {user?.username === group.username && (
                  <button className="ml-3" onClick={deleteGroup}>
                    <span className="text-xs hover:border-b hover:border-sky-800">
                      소모임 삭제하기
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* 게시글과 사이드바 */}
          <div className="flex max-w-5xl px-4 py-5 mx-auto justify-between">
            <Sidebar group={group} />
            <div className="w-full, md:mr-3 md:w-8/12">{renderPosts}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupPage;
