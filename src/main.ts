import { loadDistricts, loadProvinces, loadWards } from "./api/admin-units";
import { getCampaignConfig } from "./api/campaigns";
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

  const hint = document.createElement("p");
  hint.textContent =
    "Mở đường dẫn /{id}. Mọi mã hiện dùng config mẫu cho đến khi API chiến dịch trả về.";
  box.appendChild(hint);

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

async function boot() {
  const campaignId = campaignIdFromUrl();
  if (!campaignId) {
    showCampaignList();
    return;
  }

  const config = await getCampaignConfig(campaignId);
  startCampaign(config, {
    loadProvinces,
    loadDistricts,
    loadWards,
    submitAnswers: (payload: Record<string, unknown>) =>
      submitCampaignAnswers(config.id, payload),
  });
}

boot().catch((err) => {
  showBootError(err instanceof Error ? err.message : "Không tải được chiến dịch.");
});
