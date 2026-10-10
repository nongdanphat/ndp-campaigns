export type CampaignFieldType =
  | "text"
  | "tel"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio";

export type CampaignField = {
  id?: string;
  label: string;
  type: CampaignFieldType;
  placeholder?: string;
  required?: boolean;
  /** `false` thì form công khai không render field. Họ và tên vẫn luôn hiện. */
  visible?: boolean;
  source?: string;
  options?: string[];
  rows?: number;
};

export type CampaignSection = {
  title: string;
  fields: CampaignField[];
};

export type CampaignLinkCard = {
  enabled?: boolean;
  title?: string;
  description?: string;
  link?: string;
};

export type CampaignSettings = {
  allowMultipleSubmissions?: boolean;
  showReferralInfo?: boolean;
  showDeviceInfo?: boolean;
  zalo?: CampaignLinkCard;
  callForAction?: CampaignLinkCard;
};

export type CampaignMetadata = {
  heroTitle?: string;
  description?: string;
  submitButtonText?: string;
  newSubmitButtonText?: string;
  disabledMessage?: string;
  startDate?: string;
  endDate?: string;
  resultTitle?: string;
};

export type CampaignTheme = {
  primaryColor?: string;
  backgroundColor?: string;
  warningColor?: string;
  cardBorderRadius?: string;
  heroBorderRadius?: string;
  cardColor?: string;
  mutedColor?: string;
};

export type CampaignFields = {
  mandatory: Record<string, CampaignField>;
  custom: CampaignSection[];
};

/** Phần FE tự lưu. BE giữ nguyên object này trong cột `data`. */
export type CampaignFormConfig = {
  config: CampaignSettings;
  metadata: CampaignMetadata;
  theme?: CampaignTheme;
  fields: CampaignFields;
};

/** Bản ghi chiến dịch do GET /v1/campaigns/{id} trả về. */
export type Campaign = {
  id: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  data: CampaignFormConfig;
};
