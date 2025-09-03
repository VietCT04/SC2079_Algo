import React from "react";
import { FaGithub } from "react-icons/fa";

export const PageFooter = () => {
  return (
    <footer className="flex justify-center gap-2 font-serif ">
      <div>&copy; AY25/26 Sem 1 Group 11</div>
      <div>|</div>
      <a
        href="https://github.com/VietCT04/SC2079_Algo"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:text-black"
      >
        <FaGithub className="w-[24px] h-[24px]" />
      </a>
    </footer>
  );
};
