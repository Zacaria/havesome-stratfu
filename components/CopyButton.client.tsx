import { CopyIcon, CheckIcon } from "lucide-react";
import { useState, useEffect } from "react";
import classNames from "classnames";
// function classNames(...classes: (string | boolean | undefined)[]): string {
//   return classes.filter(Boolean).join(" ");
// }

const ANIMATION_DURATION = 800;

export default function CopyButton({ url }: { url: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, ANIMATION_DURATION);
    }
  }, [isCopied]);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(url);
        setIsCopied(true);
      }}
      className="p-2 rounded-md hover:bg-gray-100 transition-colors"
      aria-label="Copy URL to clipboard"
      type="button"
    >
      {isCopied ? (
        <CheckIcon
          className={classNames(
            "h-5 w-5 text-green-500 flex-shrink-0 transition-all duration-800"
          )}
        />
      ) : (
        <CopyIcon
          className={classNames(
            "h-5 w-5 text-gray-500 flex-shrink-0 transition-all duration-800"
          )}
        />
      )}
    </button>
  );
}
