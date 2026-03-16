import type { HTMLAttributes, TextareaHTMLAttributes } from "react";
import { codeToTokens } from "shiki";
import { tv, type VariantProps } from "tailwind-variants";
import type { CodeTokenLinesPayload } from "@/lib/code-highlight";
import type { CodeLanguageOrPlaintext } from "@/lib/code-languages";

const codeBlockRootVariants = tv({
  base: "overflow-hidden border border-border-primary bg-bg-surface",
});

const codeBlockHeaderVariants = tv({
  base: "flex h-10 w-full items-center gap-3 border-b border-border-primary px-4",
});

const codeBlockHeaderDotVariants = tv({
  base: "h-2.5 w-2.5 rounded-full",
  variants: {
    tone: {
      danger: "bg-accent-red",
      warning: "bg-accent-amber",
      success: "bg-accent-green",
    },
  },
  defaultVariants: {
    tone: "danger",
  },
});

const codeBlockHeaderFileNameVariants = tv({
  base: "font-mono text-xs text-text-tertiary",
});

const codeBlockDisplayVariants = tv({
  base: "overflow-x-auto bg-bg-surface p-3 font-mono text-[13px] leading-6",
});

const codeBlockEditorVariants = tv({
  base: "min-h-[200px] w-full resize-none border-0 bg-bg-surface p-4 font-mono text-[13px] leading-6 text-text-primary outline-none placeholder:text-text-tertiary",
});

export type CodeBlockRootProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof codeBlockRootVariants>;

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof codeBlockHeaderVariants>;

type CodeBlockHeaderDotProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof codeBlockHeaderDotVariants>;

export type CodeBlockDisplayProps = HTMLAttributes<HTMLPreElement> &
  VariantProps<typeof codeBlockDisplayVariants> & {
    code?: string;
    tokenLines?: CodeTokenLinesPayload;
    lang?: CodeLanguageOrPlaintext;
    withLineNumbers?: boolean;
  };

export type CodeBlockTokenDisplayProps = HTMLAttributes<HTMLPreElement> &
  VariantProps<typeof codeBlockDisplayVariants> & {
    tokenLines: CodeTokenLinesPayload;
    withLineNumbers?: boolean;
  };

export type CodeBlockEditorProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof codeBlockEditorVariants>;

const CodeBlockHeaderDot = ({
  className,
  tone,
  ...props
}: CodeBlockHeaderDotProps) => {
  return (
    <span
      className={codeBlockHeaderDotVariants({ tone, className })}
      {...props}
    />
  );
};

export const CodeBlockRoot = ({ className, ...props }: CodeBlockRootProps) => {
  return <div className={codeBlockRootVariants({ className })} {...props} />;
};

export const CodeBlockHeader = ({
  className,
  children,
  ...props
}: CodeBlockHeaderProps) => {
  return (
    <div className={codeBlockHeaderVariants({ className })} {...props}>
      <CodeBlockHeaderDot tone="danger" />
      <CodeBlockHeaderDot tone="warning" />
      <CodeBlockHeaderDot tone="success" />
      <span className="h-px flex-1 bg-transparent" />
      {children ? (
        <span className={codeBlockHeaderFileNameVariants()}>{children}</span>
      ) : null}
    </div>
  );
};

export const CodeBlockDisplay = async ({
  className,
  code,
  tokenLines,
  lang = "javascript",
  withLineNumbers = false,
  ...props
}: CodeBlockDisplayProps) => {
  const resolvedTokenLines =
    tokenLines ??
    (await codeToTokens(code ?? "", {
      lang,
      theme: "vesper",
    }));

  return (
    <CodeBlockTokenDisplay
      className={className}
      tokenLines={resolvedTokenLines}
      withLineNumbers={withLineNumbers}
      {...props}
    />
  );
};

export const CodeBlockTokenDisplay = ({
  className,
  tokenLines,
  withLineNumbers = false,
  ...props
}: CodeBlockTokenDisplayProps) => {
  return (
    <pre className={codeBlockDisplayVariants({ className })} {...props}>
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

export const CodeBlockEditor = ({
  className,
  ...props
}: CodeBlockEditorProps) => {
  return (
    <textarea className={codeBlockEditorVariants({ className })} {...props} />
  );
};

export {
  codeBlockDisplayVariants,
  codeBlockEditorVariants,
  codeBlockHeaderFileNameVariants,
  codeBlockHeaderVariants,
  codeBlockRootVariants,
};
