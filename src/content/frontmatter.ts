import { parse as parseYaml } from "yaml";

export function parseFrontmatter(raw: string) {
  if (!raw.startsWith("---\n")) throw new Error("Missing frontmatter opening delimiter");
  const end = raw.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Missing frontmatter closing delimiter");
  const data: unknown = parseYaml(raw.slice(4, end));
  return { data, content: raw.slice(end + 5) };
}
