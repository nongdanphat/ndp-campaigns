export type SubmitResult = {
  success: boolean;
  message?: string;
};

/**
 * Body dự kiến khi backend có API campaign.
 * `data-custom` là object đáp án tự do do form gom.
 * Đổi hàm này sang client Orval khi operation xuất hiện trong swagger-spec.json.
 */
export async function submitCampaignAnswers(
  campaignId: string,
  answers: Record<string, unknown>
): Promise<SubmitResult> {
  const body = {
    "data-custom": {
      ...answers,
      campaign_id: campaignId,
    },
  };

  console.info("[ndp] API nhận đáp án chưa có. Body sẽ gửi:", body);
  return { success: true };
}
