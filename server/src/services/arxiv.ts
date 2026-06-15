export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  arxivUrl: string;
  publishedAt: Date;
}

export async function fetchRecentPapers(
  category: string,
  maxResults = 20
): Promise<ArxivPaper[]> {
  const url = `https://export.arxiv.org/api/query?search_query=cat:${category}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);

  const xml = await res.text();
  return parseArxivXml(xml);
}

function parseArxivXml(xml: string): ArxivPaper[] {
  const entries: ArxivPaper[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const id = extractTag(entry, "id")?.split("/abs/")[1]?.trim() ?? "";
    const title = extractTag(entry, "title")?.replace(/\s+/g, " ").trim() ?? "";
    const abstract = extractTag(entry, "summary")?.replace(/\s+/g, " ").trim() ?? "";
    const published = extractTag(entry, "published") ?? "";

    const authors: string[] = [];
    const authorRegex = /<author>([\s\S]*?)<\/author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      const name = extractTag(authorMatch[1], "name");
      if (name) authors.push(name.trim());
    }

    if (id && title) {
      entries.push({
        id,
        title,
        authors,
        abstract,
        arxivUrl: `https://arxiv.org/abs/${id}`,
        publishedAt: new Date(published),
      });
    }
  }

  return entries;
}

function extractTag(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  return regex.exec(xml)?.[1];
}
