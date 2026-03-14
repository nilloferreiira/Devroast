import type { HTMLAttributes } from "react";
import { codeToTokens } from "shiki";
import { tv, type VariantProps } from "tailwind-variants";

const codeBlockVariants = tv({
  base: "overflow-x-auto bg-bg-surface p-3 font-mono text-[13px] leading-6",
});

type CodeLanguage =
  | "javascript"
  | "typescript"
  | "tsx"
  | "jsx"
  | "json"
  | "bash";

export type CodeBlockProps = HTMLAttributes<HTMLPreElement> &
  VariantProps<typeof codeBlockVariants> & {
    code: string;
    lang?: CodeLanguage;
    withLineNumbers?: boolean;
  };

export const CodeBlock = async ({
  className,
  code,
  lang = "javascript",
  withLineNumbers = false,
  ...props
}: CodeBlockProps) => {
  const tokenLines = await codeToTokens(code, {
    lang,
    theme: "vesper",
  });

  return (
    <pre className={codeBlockVariants({ className })} {...props}>
      {tokenLines.tokens.map((line, lineIndex) => {
        const lineNumber = lineIndex + 1;

        return (
          <div key={lineNumber} className="grid grid-cols-[auto_1fr] gap-3">
            {withLineNumbers ? (
              <span className="w-4 select-none text-right text-text-tertiary">
                {lineNumber}
              </span>
            ) : (
              <span className="w-0" />
            )}

            <span>
              {line.length === 0 ? " " : null}
              {line.map((token) => (
                <span
                  key={`${lineNumber}-${token.offset}`}
                  style={{ color: token.color }}
                >
                  {token.content}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </pre>
  );
};

export { codeBlockVariants };
