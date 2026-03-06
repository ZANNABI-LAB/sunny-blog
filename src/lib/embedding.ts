import { VoyageAIClient } from "voyageai";

const getVoyageClient = (): VoyageAIClient => {
  const apiKey = process.env.VOYAGE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VOYAGE_API_KEY 환경변수가 설정되지 않았습니다. .env.local에 VOYAGE_API_KEY를 설정하세요."
    );
  }

  return new VoyageAIClient({ apiKey });
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const client = getVoyageClient();
  const response = await client.embed({
    input: [text],
    model: "voyage-3",
  });

  const embedding = response.data?.[0]?.embedding;
  if (!embedding) {
    throw new Error("Voyage AI에서 임베딩 응답을 받지 못했습니다.");
  }

  return embedding;
};

export const generateEmbeddings = async (
  texts: string[]
): Promise<number[][]> => {
  const client = getVoyageClient();
  const response = await client.embed({
    input: texts,
    model: "voyage-3",
  });

  const embeddings = response.data?.map((item) => item.embedding);
  if (!embeddings || embeddings.length !== texts.length) {
    throw new Error("Voyage AI에서 올바른 임베딩 응답을 받지 못했습니다.");
  }

  return embeddings as number[][];
};
