import React from "react";
import { FaGithub } from "react-icons/fa";

export const PageFooter = () => {
  return (
    <footer className="flex justify-center gap-2 font-serif ">
      <div>&copy; AY24/25 Sem 2 Group 17</div>
      <div>|</div>
      <a
        href="https://github.com/CSA100/MDP"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer hover:text-black"
      >
        <FaGithub className="w-[24px] h-[24px]" />
      </a>
    </footer>
  );
};
