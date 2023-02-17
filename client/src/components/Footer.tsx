import React from "react";
import { BiCollapse } from "react-icons/bi";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-5 bg-sky-800">
      <div className="max-w-5xl px-4 mx-auto text-slate-200">
        <div className="flex items-center">
          <BiCollapse className="mr-1 text-2xl" />
          <span>소모임</span>
        </div>
        <div className="mt-2 text-sm">
          <Link href="/" className="mr-3">
            포트폴리오
          </Link>
          <Link href="/" className="mr-3">
            개발과정
          </Link>
          <Link href="/" className="mr-3">
            블로그
          </Link>
          <Link href="/" className="mr-3">
            깃허브
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
