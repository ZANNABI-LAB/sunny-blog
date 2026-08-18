/**
 * Slack Webhook 알림 유틸.
 * SLACK_WEBHOOK_URL 환경변수가 없으면 조용히 건너뛴다 (파이프라인을 막지 않음).
 */
export const notifySlack = async (message: string): Promise<void> => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(`[알림] SLACK_WEBHOOK_URL 미설정, 건너뜀: ${message}`);
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
    if (!response.ok) {
      console.warn(`[알림] Slack 전송 실패: HTTP ${response.status}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[알림] Slack 전송 실패: ${msg}`);
  }
};
