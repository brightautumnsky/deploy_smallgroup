import Link from "next/link";
import React from "react";
import { useAuthState } from "../context/auth";
import { Group } from "../types";
type Props = {
  group: Group;
};

const Sidebar = ({ group }: Props) => {
  const { authenticated } = useAuthState();

  return (
    <div className="hidden w-3/12 ml-3 md:block">
      <div className="bg-slate-50 rounded px-1 py-3">
        <div className="p-3">
          <p className="mb-3 text-base">{group?.description}</p>
          <div className="flex mb-3 text-sm font-medium">
            <div className="w-2/3">
              <p className="text-xs">소모임장: {group?.username}님</p>
            </div>
          </div>
        </div>
        {authenticated && (
          <div className="mx-0 my-2 ">
            <Link href={`${group.name}/create`} legacyBehavior>
              <a className="w-full p-3 text-sm text-sky-800">글쓰기</a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
