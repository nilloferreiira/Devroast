import { getVerdictColor } from "@/lib/og/og-colors";

export interface OgImageProps {
  score: number;
  verdict: string | null;
  language: string;
  lineCount: number;
  summaryQuote: string;
}

const QUOTE_MAX_LENGTH = 120;

const truncateQuote = (quote: string): string => {
  if (quote.length <= QUOTE_MAX_LENGTH) return quote;
  return `${quote.slice(0, QUOTE_MAX_LENGTH)}...`;
};

export const OgImage = ({
  score,
  verdict,
  language,
  lineCount,
  summaryQuote,
}: OgImageProps) => {
  const accentColor = getVerdictColor(verdict);
  const displayQuote = `"${truncateQuote(summaryQuote)}"`;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px",
        gap: "28px",
        fontFamily: "JetBrains Mono",
      }}
    >
      {/* Logo row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#10B981",
          }}
        >
          {">"}
        </span>
        <span
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#E5E5E5",
          }}
        >
          devroast
        </span>
      </div>

      {/* Score row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "160px",
            fontWeight: 800,
            color: accentColor,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: "56px",
            fontWeight: 400,
            color: "#4B5563",
            lineHeight: 1,
          }}
        >
          /10
        </span>
      </div>

      {/* Verdict row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: accentColor,
          }}
        />
        <span
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: accentColor,
          }}
        >
          {verdict ?? "unknown"}
        </span>
      </div>

      {/* Lang info */}
      <span
        style={{
          fontSize: "16px",
          fontWeight: 400,
          color: "#4B5563",
        }}
      >
        {`lang: ${language} · ${lineCount} lines`}
      </span>

      {/* Roast quote */}
      <div
        style={{
          display: "flex",
          fontSize: "22px",
          fontWeight: 400,
          color: "#E5E5E5",
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: "1072px",
        }}
      >
        {displayQuote}
      </div>
    </div>
  );
};
