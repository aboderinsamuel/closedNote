export function InfinityLogo() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6">
      <div className="flex justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-neutral-900 dark:text-neutral-100"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}
          aria-hidden="true"
        >
          <path d="M18.178 8c-1.5 0-2.5.5-3.5 1.5s-1.5 2-1.5 3.5.5 2.5 1.5 3.5 2 1.5 3.5 1.5M5.822 8c1.5 0 2.5.5 3.5 1.5s1.5 2 1.5 3.5-.5 2.5-1.5 3.5-2 1.5-3.5 1.5M12 2c-1.5 0-2.5.5-3.5 1.5S7 5 7 6.5s.5 2.5 1.5 3.5 2 1.5 3.5 1.5 2.5-.5 3.5-1.5S17 8 17 6.5 16.5 4 15.5 3 13.5 2 12 2zM12 22c-1.5 0-2.5-.5-3.5-1.5S7 19 7 17.5s.5-2.5 1.5-3.5 2-1.5 3.5-1.5 2.5.5 3.5 1.5S17 16 17 17.5 16.5 20 15.5 21 13.5 22 12 22z" />
        </svg>
      </div>
    </footer>
  );
}
