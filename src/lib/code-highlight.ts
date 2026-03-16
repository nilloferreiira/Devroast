export type CodeToken = {
  content: string;
  offset: number;
  color?: string;
};

export type CodeTokenLine = CodeToken[];

export type CodeTokenLinesPayload = {
  tokens: CodeTokenLine[];
};
