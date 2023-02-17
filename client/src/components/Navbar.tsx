import Link from "next/link";
import React, { useState } from "react";
import { FaSearch, FaRegUserCircle } from "react-icons/fa";
import { CiLogin, CiLogout } from "react-icons/ci";
import { GrContactInfo } from "react-icons/gr";
import { BiCollapse } from "react-icons/bi";
import { useAuthState, useAuthDispatch } from "../context/auth";
import axios from "axios";
import { useRouter } from "next/router";

const Navbar: React.FC = () => {
  const { loading, authenticated, user } = useAuthState();
  const dispatch = useAuthDispatch();
  const [searchKey, setSearchKey] = useState("");
  const router = useRouter();

  const logoutHandler = () => {
    axios
      .post("/auth/logout")
      .then(() => {
        dispatch("LOGOUT");
        window.location.reload();
      })
      .catch((e) => {
        console.log("Logout Error: ", e);
      });
  };

  const searchPost = async () => {
    try {
      let body = { searchKey };
      const res = await axios.post("/posts/search", body);

      setSearchKey("");
      return alert(`제목: ${res.data[0].title}, 본문: ${res.data[0].body}`);
    } catch (e) {
      console.log("SearchPost Error: ", e);
      return alert("찾으시는 정보가 존재하지 않습니다.");
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-16 px-5 bg-slate-50">
      <div className="font-semibold">
        <Link href="/" className="flex items-center text-sky-800">
          <BiCollapse className="inline-block text-4xl" />
          <span className="text-xl">소모임</span>
        </Link>
      </div>
      <div className="flex-1"></div>
      <div className="max-w-full px-4">
        <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
          <input
            type="text"
            placeholder="검색"
            className="px-2 py-1 bg-transparent rounded focus:outline-none"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <FaSearch
            className="mr-2 text-sky-800 hover:cursor-pointer"
            onClick={searchPost}
          />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex">
        {!loading &&
          (authenticated ? (
            <div className="flex items-center">
              <div className="mr-5">
                <Link href={`/user/${user?.username}`}>
                  <FaRegUserCircle className="text-2xl" />
                </Link>
              </div>
              <button
                onClick={logoutHandler}
                className="flex items-center w-25 p-2 mr-2 text-center text-white bg-sky-800 rounded"
              >
                <CiLogout className="inline-block mr-1" />
                <span className="text-xs">로그아웃</span>
              </button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <div className="flex items-center w-30 p-2 mr-2 text-center text-white bg-sky-800 border border-sky-800 rounded">
                  <CiLogin className="inline-block mr-1" />
                  로그인
                </div>
              </Link>
              <Link href="/register">
                <div className="flex items-center w-30 p-2 mr-2 text-center text-gray-500 border rounded">
                  <GrContactInfo className="inline-block mr-1" />
                  회원가입
                </div>
              </Link>
            </>
          ))}
      </div>
    </div>
  );
};

export default Navbar;
