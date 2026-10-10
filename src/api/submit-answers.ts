import { campaignsControllerSubmitAnswer } from "./generated/campaigns/campaigns";

export type SubmitResult = {
  success: boolean;
  message?: string;
};

export async function submitCampaignAnswers(
  campaignId: string,
  answers: Record<string, unknown>
): Promise<SubmitResult> {
  const response = await campaignsControllerSubmitAnswer(campaignId, {
    data: answers,
  });
  const body = response.data;
  if (!body.success) {
    return {
      success: false,
      message: body.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
    };
  }
  return { success: true, message: body.message };
}
