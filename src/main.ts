import { loadDistricts, loadProvinces, loadWards } from "./api/admin-units";
import {
  getDummyCampaignConfig,
  listDummyCampaigns,
} from "./api/dummy-config";
import { submitCampaignAnswers } from "./api/submit-answers";
import { startCampaign } from "./form-engine.js";

function campaignIdFromUrl(): string {
  const queryId = new URLSearchParams(window.location.search)
    .get("campaign")
    ?.trim();
  if (queryId) return queryId;

  const segments = window.location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  if (!last || last.toLowerCase() === "index.html") {
    const parent = segments[segments.length - 2] ?? "";
    if (!parent || parent === "dist") return "";
    return parent;
  }
  return last;
}

function campaignHref(campaignId: string): string {
  const openedAsFile = /index\.html$/i.test(window.location.pathname);
  if (openedAsFile) {
    return `index.html?campaign=${encodeURIComponent(campaignId)}`;
  }
  return `/${encodeURIComponent(campaignId)}`;
}

function showCampaignList() {
  const loading = document.getElementById("loadingMessage");
  if (loading) loading.style.display = "none";

  const page = document.querySelector(".page");
  if (!page) return;

  const box = document.createElement("div");
  box.className = "card";

  const title = document.createElement("div");
  title.className = "form-title";
  title.textContent = "Chọn chiến dịch";
  box.appendChild(title);

  listDummyCampaigns().forEach((campaign) => {
    const link = document.createElement("a");
    link.href = campaignHref(campaign.id);
    link.textContent = campaign.title;
    link.style.display = "block";
    link.style.margin = "0.75rem 0";
    link.style.color = "var(--primary)";
    box.appendChild(link);
  });

  page.appendChild(box);
}

function showBootError(message: string) {
  const loading = document.getElementById("loadingMessage");
  const error = document.getElementById("errorMessage");
  if (loading) loading.style.display = "none";
  if (error) {
    error.style.display = "block";
    error.textContent = message;
  }
}

const campaignId = campaignIdFromUrl();
const config = campaignId ? getDummyCampaignConfig(campaignId) : null;

if (!campaignId) {
  showCampaignList();
} else if (!config) {
  showBootError(
    `Không tìm thấy chiến dịch "${campaignId}". Thêm config trong src/api/dummy-config.ts.`
  );
} else {
  startCampaign(config, {
    loadProvinces,
    loadDistricts,
    loadWards,
    submitAnswers: (payload: Record<string, unknown>) =>
      submitCampaignAnswers(config.campaign_id, payload),
  });
}
