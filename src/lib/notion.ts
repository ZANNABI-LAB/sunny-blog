import type { PortfolioProject } from "@/types/portfolio";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_PORTFOLIO_DB_ID;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotionPage = any;

const queryDatabase = async (): Promise<NotionPage[]> => {
  if (!NOTION_API_KEY || !DATABASE_ID) return [];

  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "Published",
          checkbox: { equals: true },
        },
        sorts: [{ property: "Period", direction: "descending" }],
      }),
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.results ?? [];
};

const mapPageToProject = (page: NotionPage): PortfolioProject => {
  const props = page.properties;
  const pageId = (page.id as string).replace(/-/g, "");

  return {
    id: page.id,
    name: props.Name?.title?.[0]?.plain_text ?? "",
    description: props.Description?.rich_text?.[0]?.plain_text ?? "",
    techStack:
      props["Tech Stack"]?.multi_select?.map(
        (s: { name: string }) => s.name
      ) ?? [],
    status: props.Status?.select?.name ?? "",
    category: props.Category?.select?.name ?? "",
    period: {
      start: props.Period?.date?.start ?? "",
      end: props.Period?.date?.end ?? null,
    },
    role:
      props.Role?.multi_select?.map((r: { name: string }) => r.name) ?? [],
    thumbnail:
      props.Thumbnail?.files?.[0]?.file?.url ??
      props.Thumbnail?.files?.[0]?.external?.url ??
      null,
    githubUrl: props["GitHub URL"]?.url ?? null,
    deployUrl: props["Deploy URL"]?.url ?? null,
    linearUrl: props["Linear URL"]?.url ?? null,
    notionUrl: `https://notion.so/${pageId}`,
  };
};

export const getPublishedPortfolios = async (): Promise<PortfolioProject[]> => {
  try {
    const pages = await queryDatabase();
    return pages.map(mapPageToProject);
  } catch {
    return [];
  }
};
