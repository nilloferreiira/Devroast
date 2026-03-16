export const codeLanguageItems = [
  {
    id: "javascript",
    label: "JavaScript",
    detectorAliases: ["js", "javascript", "mjs", "cjs"],
  },
  {
    id: "typescript",
    label: "TypeScript",
    detectorAliases: ["ts", "typescript"],
  },
  {
    id: "tsx",
    label: "TSX",
    detectorAliases: ["tsx"],
  },
  {
    id: "jsx",
    label: "JSX",
    detectorAliases: ["jsx"],
  },
  {
    id: "json",
    label: "JSON",
    detectorAliases: ["json"],
  },
  {
    id: "bash",
    label: "Bash",
    detectorAliases: ["bash", "shell", "sh", "zsh"],
  },
  {
    id: "python",
    label: "Python",
    detectorAliases: ["python", "py"],
  },
  {
    id: "php",
    label: "PHP",
    detectorAliases: ["php"],
  },
  {
    id: "go",
    label: "Go",
    detectorAliases: ["go", "golang"],
  },
  {
    id: "java",
    label: "Java",
    detectorAliases: ["java"],
  },
  {
    id: "c",
    label: "C",
    detectorAliases: ["c", "h"],
  },
  {
    id: "cpp",
    label: "C++",
    detectorAliases: ["cpp", "c++", "hpp", "cc", "cxx"],
  },
  {
    id: "csharp",
    label: "C#",
    detectorAliases: ["csharp", "cs", "c#"],
  },
  {
    id: "rust",
    label: "Rust",
    detectorAliases: ["rust", "rs"],
  },
  {
    id: "ruby",
    label: "Ruby",
    detectorAliases: ["ruby", "rb"],
  },
  {
    id: "swift",
    label: "Swift",
    detectorAliases: ["swift"],
  },
  {
    id: "kotlin",
    label: "Kotlin",
    detectorAliases: ["kotlin", "kt"],
  },
  {
    id: "sql",
    label: "SQL",
    detectorAliases: ["sql"],
  },
  {
    id: "html",
    label: "HTML",
    detectorAliases: ["html", "xml"],
  },
  {
    id: "css",
    label: "CSS",
    detectorAliases: ["css"],
  },
  {
    id: "yaml",
    label: "YAML",
    detectorAliases: ["yaml", "yml"],
  },
  {
    id: "toml",
    label: "TOML",
    detectorAliases: ["toml", "ini"],
  },
  {
    id: "markdown",
    label: "Markdown",
    detectorAliases: ["markdown", "md"],
  },
  {
    id: "dockerfile",
    label: "Dockerfile",
    detectorAliases: ["dockerfile", "docker"],
  },
] as const;

export type CodeLanguage = (typeof codeLanguageItems)[number]["id"];

export type CodeLanguageOrPlaintext = CodeLanguage | "plaintext";

const detectorAliasToLanguage = codeLanguageItems.reduce<
  Partial<Record<string, CodeLanguage>>
>((accumulator, language) => {
  for (const alias of language.detectorAliases) {
    accumulator[alias] = language.id;
  }

  return accumulator;
}, {});

export const codeLanguageByDetectorAlias = detectorAliasToLanguage;

export const codeLanguageLabels = codeLanguageItems.reduce<
  Record<CodeLanguageOrPlaintext, string>
>(
  (accumulator, language) => {
    accumulator[language.id] = language.label;
    return accumulator;
  },
  {
    plaintext: "Plain Text",
  } as Record<CodeLanguageOrPlaintext, string>,
);

export const codeLanguageDetectionSubset = [
  "javascript",
  "typescript",
  "php",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "rust",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "yaml",
  "ini",
  "markdown",
  "dockerfile",
  "json",
  "bash",
  "python",
] as const;

export const isCodeLanguage = (value: string): value is CodeLanguage => {
  return codeLanguageItems.some((language) => language.id === value);
};

export const resolveDetectorLanguage = (
  detectorLanguage: string | undefined,
): CodeLanguageOrPlaintext => {
  if (!detectorLanguage) {
    return "plaintext";
  }

  const normalized = detectorLanguage.toLowerCase();
  const resolved = codeLanguageByDetectorAlias[normalized];

  return resolved ?? "plaintext";
};
