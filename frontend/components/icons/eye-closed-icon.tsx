type EyeClosedIconProps = {
  className?: string;
};

export default function EyeClosedIcon({ className }: EyeClosedIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M3.3 4.3L19.7 20.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.6 6.1A10.7 10.7 0 0 1 12 6c5.5 0 9.2 4.8 9.8 6-.3.7-1.7 2.8-4 4.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.1 14.3a3 3 0 0 1-4.2-4.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M7.9 10a8.9 8.9 0 0 0-5.7 2c.6 1.2 4.2 6 9.8 6 1.3 0 2.5-.2 3.6-.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
