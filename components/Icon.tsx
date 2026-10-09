import type { SVGProps } from "react";

type IconName =
  | "bag"
  | "calendar"
  | "list"
  | "plus"
  | "chevron"
  | "check"
  | "close"
  | "phone";

const paths: Record<IconName, React.ReactNode> = {
  bag: (
    <>
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M8 9V6a4 4 0 0 1 8 0v3" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2" />
    </>
  ),
  list: (
    <>
      <path d="m3 6 1 1 2-2m3 1h12M3 12l1 1 2-2m3 1h12M3 18l1 1 2-2m3 1h12" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m8 4 8 8-8 8" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 18h4" />
    </>
  ),
};

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export function BrandMark() {
  return (
    <span className="brand-mark">
      <Icon name="bag" width="28" height="28" />
    </span>
  );
}
