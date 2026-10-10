import dummyForm from "./dummy-campaigns.json";
import { campaignsControllerGetCampaignById } from "./generated/campaigns/campaigns";
import type { Campaign, CampaignFormConfig } from "../types/campaign";

const dummyData = dummyForm as CampaignFormConfig;

function isPreview(): boolean {
  return new URLSearchParams(window.location.search).get("preview") === "true";
}

function fallbackCampaign(campaignId: string): Campaign {
  return {
    id: campaignId,
    createdAt: "",
    updatedAt: "",
    enabled: true,
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
    const response = await campaignsControllerGetCampaignById(campaignId);
    const body = response.data;
    if (!body.success || !body.data) {
      throw new Error(body.message || "Không tải được chiến dịch");
    }
    return allowPreview({
      id: body.data.id,
      createdAt: body.data.createdAt,
      updatedAt: body.data.updatedAt,
      enabled: body.data.enabled,
      data: body.data.data as CampaignFormConfig,
    });
  } catch {
    return allowPreview(fallbackCampaign(campaignId));
  }
}
