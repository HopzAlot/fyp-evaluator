import Link from "next/link";

type AuthSwitchLinkProps = {
  label: string;
  href: string;
  linkText: string;
};

export function AuthSwitchLink({
  label,
  href,
  linkText,
}: AuthSwitchLinkProps) {
  return (
    <p className="mt-6 text-center text-sm text-muted">
      {label}{" "}
      <Link href={href} className="font-semibold text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
