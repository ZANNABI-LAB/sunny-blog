const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";

const getApiKey = (): string => {
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VOYAGE_API_KEY 환경변수가 설정되지 않았습니다. .env.local에 VOYAGE_API_KEY를 설정하세요."
    );
  }

  return apiKey;
};

type VoyageResponse = {
  data: { embedding: number[] }[];
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: [text], model: VOYAGE_MODEL }),
  });

  if (!response.ok) {
    throw new Error(`Voyage AI API 오류: ${response.status} ${response.statusText}`);
  }

  const result: VoyageResponse = await response.json();
  const embedding = result.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error("Voyage AI에서 임베딩 응답을 받지 못했습니다.");
  }

  return embedding;
};

export const generateEmbeddings = async (
  texts: string[]
): Promise<number[][]> => {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: texts, model: VOYAGE_MODEL }),
  });

  if (!response.ok) {
    throw new Error(`Voyage AI API 오류: ${response.status} ${response.statusText}`);
  }

  const result: VoyageResponse = await response.json();
  const embeddings = result.data?.map((item) => item.embedding);

  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error("Voyage AI에서 올바른 임베딩 응답을 받지 못했습니다.");
  }

  return embeddings;
};
