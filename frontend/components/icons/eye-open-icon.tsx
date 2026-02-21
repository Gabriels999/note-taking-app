type EyeOpenIconProps = {
  className?: string;
};

export default function EyeOpenIcon({ className }: EyeOpenIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.2 12s3.7-6 9.8-6 9.8 6 9.8 6-3.7 6-9.8 6-9.8-6-9.8-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
