import Link from "next/link";
import React, { FormEvent, useState } from "react";
import InputGroup from "../components/InputGroup";
import axios from "axios";
import { useAuthDispatch, useAuthState } from "../context/auth";
import { useRouter } from "next/router";

const Login = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<any>({});

  const dispatch = useAuthDispatch();
  const router = useRouter();
  const { authenticated } = useAuthState();

  if (authenticated) {
    router.push("/");
  }

  const submitUserInfo = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await axios.post(
        "/auth/login",
        {
          username,
          password,
        },
        { withCredentials: true }
      );

      dispatch("LOGIN", res.data?.user);
      router.push("/");
    } catch (e: any) {
      console.log("Login Error: ", e);
      setErrors(e.response.data || {});
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">로그인</h1>
          <form onSubmit={submitUserInfo}>
            <InputGroup
              placeholder="아이디"
              value={username}
              setValue={setUsername}
              error={errors.username}
            />
            <InputGroup
              placeholder="비밀번호"
              value={password}
              setValue={setPassword}
              error={errors.password}
              type="password"
            />
            <button className="w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-sky-800 border border-sky-400 rounded">
              로그인
            </button>
          </form>
          <small>아이디가 없으신가요?</small>
          <Link href="/register" legacyBehavior>
            <a className="ml-1 text-blue-500 uppercase">회원가입</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
