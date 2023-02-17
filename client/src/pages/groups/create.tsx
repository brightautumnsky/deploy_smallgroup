import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import InputGroup from "../../components/InputGroup";

const GroupCreate = () => {
  const [name, setName] = useState("");
  const [interests, setInterests] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();

  const submitGroupInfo = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await axios.post("/groups", { name, interests, description });

      router.push(`/sg/${res.data.name}`);
    } catch (e: any) {
      console.log("GroupCreate Error: ", e);
      setErrors(e.response.data);
    }
  };

  return (
    <div className="flex flex-col justify-center pt-16">
      <div className="w-10/12 mx-auto md:w-96">
        <h1 className="mb-2 text-lg font-medium">소모임 만들기</h1>
        <hr />
        <form onSubmit={submitGroupInfo}>
          <div className="my-6">
            <p className="font-medium">소모임 이름</p>
            <p className="mb-2 text-xs text-gray-400">
              소모임 이름을 정해주세요.
            </p>
            <InputGroup
              placeholder="소모임 이름"
              value={name}
              setValue={setName}
              error={errors.name}
            />
          </div>
          <div className="my-6">
            <p className="font-medium">소모임 관심사</p>
            <p className="mb-2 text-xs text-gray-400">
              소모임에서 나누게 될 관심사를 정해주세요.
            </p>
            <InputGroup
              placeholder="관심사"
              value={interests}
              setValue={setInterests}
              error={errors.interests}
            />
          </div>
          <div className="my-6">
            <p className="font-medium">소모임 설명</p>
            <p className="mb-2 text-xs text-gray-400">
              소모임에 대한 간단한 설명을 적어주세요.
            </p>
            <InputGroup
              placeholder="소모임 설명"
              value={description}
              setValue={setDescription}
              error={errors.description}
            />
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-1 text-sm font-semibold rounded text-white bg-gray-400 border">
              소모임 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreate;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      throw new Error("쿠키를 찾을 수 없습니다.");
    }

    await axios.get(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/auth/me`, {
      headers: { cookie },
    });

    return { props: {} };
  } catch (e) {
    // 백엔드 요청 쿠키 인증 에러 시 로그인 페이지로 이동
    res.writeHead(307, { Location: "/login" }).end();

    return { props: {} };
  }
};
