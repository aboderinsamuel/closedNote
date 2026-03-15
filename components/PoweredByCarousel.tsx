"use client";

import Image from "next/image";
import React from "react";

const SupabaseLogo = () => (
  <svg viewBox="0 0 109 113" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#supabase-a)" />
    <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#supabase-b)" fillOpacity=".2" />
    <path d="M45.317 2.071c2.86-3.601 8.657-1.628 8.726 2.97l.442 67.251H9.265c-8.19 0-12.758-9.46-7.664-15.875L45.317 2.071z" fill="#3ECF8E" />
    <defs>
      <linearGradient id="supabase-a" x1="53.974" y1="54.974" x2="94.163" y2="71.829" gradientUnits="userSpaceOnUse">
        <stop stopColor="#249361" />
        <stop offset="1" stopColor="#3ECF8E" />
      </linearGradient>
      <linearGradient id="supabase-b" x1="36.156" y1="30.578" x2="54.484" y2="65.081" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="1" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const OpenAILogo = () => (
  <svg className="h-5 w-5 text-neutral-900 dark:text-neutral-100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.387 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.781a4.494 4.494 0 0 1-.676 8.105v-5.677a.795.795 0 0 0-.402-.654zm2.01-3.044l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
);

const AnthropicLogo = () => (
  <svg className="h-5 w-5 text-neutral-900 dark:text-neutral-100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017L3.674 20H0L6.57 3.52zm4.132 9.959L8.453 7.687 6.205 13.48h4.496z" />
  </svg>
);

const stack = [
  {
    name: "Supabase",
    logo: <SupabaseLogo />,
  },
  {
    name: "OpenAI",
    logo: <OpenAILogo />,
  },
  {
    name: "HuggingFace",
    logo: (
      <Image
        src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
        alt="HuggingFace"
        width={20}
        height={20}
        className="h-5 w-5"
        unoptimized
      />
    ),
  },
  {
    name: "Anthropic",
    logo: <AnthropicLogo />,
  },
];

export const PoweredByCarousel: React.FC = () => (
  <div className="flex items-center justify-center flex-wrap gap-2">
    {stack.map((item) => (
      <div
        key={item.name}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-sm"
      >
        {item.logo}
        <span>{item.name}</span>
      </div>
    ))}
  </div>
);

export default PoweredByCarousel;
