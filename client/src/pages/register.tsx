import Link from "next/link";
import React, { FormEvent, useState } from "react";
import InputGroup from "../components/InputGroup";
import axios from "axios";
import { useRouter } from "next/router";
import { useAuthState } from "../context/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  let router = useRouter();
  const { authenticated } = useAuthState();

  if (authenticated) {
    router.push("/");
  }

  const submitUserInfo = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await axios.post("/auth/register", {
        email,
        username,
        password,
      });

      router.push("/login");
    } catch (e: any) {
      console.log("Register Error: ", e);
      setErrors(e.response.data || {});
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">회원가입</h1>
          <form onSubmit={submitUserInfo}>
            <InputGroup
              placeholder="이메일"
              value={email}
              setValue={setEmail}
              error={errors.email}
            />
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
              회원 가입
            </button>
          </form>
          <small>이미 가입하셨나요?</small>
          <Link href="/login" legacyBehavior>
            <a className="ml-1 text-blue-500 uppercase">로그인</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
