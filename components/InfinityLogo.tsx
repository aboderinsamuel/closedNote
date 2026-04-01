import Image from "next/image";

export function InfinityLogo() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6">
      <div className="flex justify-center">
        <Image
          src="/closedNote-nobg.png"
          alt="closedNote"
          width={192}
          height={192}
          style={{ objectFit: "contain" }}
        />
      </div>
    </footer>
  );
}
