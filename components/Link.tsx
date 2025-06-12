import type React from "react";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";

type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
};

export function Link({ href, children, className = "", ...props }: LinkProps) {
  const pageContext = usePageContext();
  const { urlPathname } = pageContext;
  const isActive =
    href === "/" ? urlPathname === href : urlPathname.startsWith(href);
  return (
    <a
      {...props}
      href={href}
      className={`${className} ${isActive ? "is-active" : ""}`}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          e.preventDefault();
          navigate(href, { keepScrollPosition: true });
        }
      }}
    >
      {children}
    </a>
  );
}
