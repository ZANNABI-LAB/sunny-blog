export const BOT_REGEX =
  /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baidu|slurp/i;

/**
 * IP + User-Agent 문자열을 SHA-256 해시로 변환한다.
 */
export const generateFingerprint = async (
  ip: string,
  ua: string
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}:${ua}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};
