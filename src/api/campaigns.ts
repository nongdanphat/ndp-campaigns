import dummyForm from "./dummy-campaigns.json";
import type { Campaign, CampaignFormConfig } from "../types/campaign";
import { apiFetch } from "./mutator";

const dummyData = dummyForm as CampaignFormConfig;

type CampaignBody = {
  success?: boolean;
  message?: string;
  data?: Campaign;
};

function isPreview(): boolean {
  return new URLSearchParams(window.location.search).get("preview") === "true";
}

function fallbackCampaign(campaignId: string): Campaign {
  return {
    id: campaignId,
    createdAt: "",
    updatedAt: "",
    enabled: true,
    answerQuantity: 0,
    data: dummyData,
  };
}

function allowPreview(campaign: Campaign): Campaign {
  if (isPreview() && campaign.enabled === false) {
    return { ...campaign, enabled: true };
  }
  return campaign;
}

export async function getCampaignConfig(campaignId: string): Promise<Campaign> {
  try {
    const response = await apiFetch<{ data: CampaignBody }>(
      `/v1/campaigns/${encodeURIComponent(campaignId)}`
    );
    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message || "Không tải được chiến dịch");
    }
    return allowPreview(body.data);
  } catch {
    return allowPreview(fallbackCampaign(campaignId));
  }
}
