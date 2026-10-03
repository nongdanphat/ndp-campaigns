/**
 * Config chiến dịch tạm, cho đến khi backend có API campaign.
 * Sửa file này rồi chạy `pnpm build`.
 *
 * Key là campaign id trên URL:
 *   /nong-nghiep-ben-vung
 *   /ung-dung-cong-nghe
 *
 * Tỉnh, huyện, xã không nằm ở đây. Dropdown gọi
 * GET /v1/metadata/old-provinces, old-districts, old-wards.
 * Field `source: "administrative"` trên province / district / ward kích hoạt việc đó.
 */

export type CampaignField = {
  id?: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  /** `false` thì form công khai không render field. Họ và tên vẫn luôn hiện. */
  visible?: boolean;
  source?: string;
  options?: string[];
  rows?: number;
};

export type CampaignConfig = {
  campaign_id: string;
  enabled: boolean;
  config: {
    allowMultipleSubmissions?: boolean;
    showReferralInfo?: boolean;
    showDeviceInfo?: boolean;
    zalo?: {
      enabled?: boolean;
      title?: string;
      description?: string;
      link?: string;
    };
    callForAction?: {
      enabled?: boolean;
      title?: string;
      description?: string;
      link?: string;
    };
  };
  metadata: {
    pageTitle?: string;
    heroTitle?: string;
    description?: string;
    submitButtonText?: string;
    newSubmitButtonText?: string;
    disabledMessage?: string;
    copyright?: string;
    startDate?: string;
    endDate?: string;
    resultTitle?: string;
  };
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    warningColor?: string;
    cardBorderRadius?: string;
    heroBorderRadius?: string;
    cardColor?: string;
    mutedColor?: string;
  };
  fields: {
    mandatory: Record<string, CampaignField>;
    custom: Array<{
      title: string;
      fields: CampaignField[];
    }>;
  };
};

export const dummyCampaigns: Record<string, CampaignConfig> = {
  "nong-nghiep-ben-vung": {
    "campaign_id": "nong-nghiep-ben-vung",
    "enabled": true,
    "config": {
      "allowMultipleSubmissions": true,
      "showReferralInfo": true,
      "showDeviceInfo": true,
      "zalo": {
        "enabled": true,
        "title": "Tham gia nhóm Zalo hỗ trợ nông dân",
        "description": "Nhận thông báo mới, hướng dẫn kỹ thuật và trao đổi trực tiếp với cán bộ hỗ trợ.",
        "link": "https://zalo.me/g/zox0u8849l"
      },
      "callForAction": {
        "enabled": true,
        "title": "Nhiều chương trình hỗ trợ khác đang được chuẩn bị",
        "description": "Trong thời gian tới, Nông Dân Phát sẽ triển khai thêm nhiều chiến dịch và chương trình hỗ trợ nông dân trên nhiều lĩnh vực khác nhau như ứng dụng công nghệ, canh tác bền vững, đào tạo kỹ thuật và kết nối tiêu thụ sản phẩm.",
        "link": "https://zalo.me/g/zox0u8849l"
      }
    },
    "metadata": {
      "pageTitle": "NDP-Nông Dân Phát",
      "heroTitle": "Đăng ký tham gia chiến dịch phát triển nông nghiệp bền vững",
      "description": "Chúng tôi mong muốn đồng hành cùng nông dân trong việc áp dụng các phương pháp canh tác thân thiện môi trường, nâng cao hiệu quả lâu dài và ổn định thu nhập.",
      "submitButtonText": "Gửi thông tin",
      "newSubmitButtonText": "Gửi thông tin khác",
      "disabledMessage": "Chiến dịch này hiện đang tắt.",
      "copyright": "© 2026 Nông Dân Phát. Mọi quyền được bảo lưu.",
      "startDate": "1/1/2026",
      "endDate": "31/12/2026",
      "resultTitle": "Đã gửi thông tin thành công"
    },
    "theme": {
      "primaryColor": "#AB7E31",
      "backgroundColor": "#f3f4f6",
      "warningColor": "#ED3241",
      "cardBorderRadius": "20px",
      "heroBorderRadius": "20px"
    },
    "fields": {
      "mandatory": {
        "full_name": {
          "label": "Họ và tên",
          "type": "text",
          "placeholder": "VD: Nguyễn Văn A",
          "required": true,
          "visible": true
        },
        "phone": {
          "label": "Số điện thoại",
          "type": "tel",
          "placeholder": "VD: 0912 345 678",
          "required": true,
          "visible": true
        },
        "province": {
          "label": "Tỉnh / Thành phố",
          "type": "select",
          "source": "administrative",
          "required": true,
          "visible": true
        },
        "district": {
          "label": "Huyện / Thị xã / TP trực thuộc",
          "type": "select",
          "source": "administrative",
          "required": true,
          "visible": true
        },
        "ward": {
          "label": "Xã / Phường / Thị trấn",
          "type": "select",
          "source": "administrative",
          "required": true,
          "visible": true
        },
        "hamlet": {
          "label": "Thôn / Ấp / Tổ dân phố",
          "type": "text",
          "placeholder": "VD: Thôn A / Ấp B / Tổ 5 KP 3",
          "required": true,
          "visible": true
        },
        "street": {
          "label": "Đường",
          "type": "text",
          "placeholder": "Tên đường (Nếu có)",
          "required": false,
          "visible": true
        },
        "house_number": {
          "label": "Số nhà",
          "type": "text",
          "placeholder": "Số nhà (Nếu có)",
          "required": false,
          "visible": true
        }
      },
      "custom": [
        {
          "title": "Thông tin canh tác & định hướng phát triển",
          "fields": [
            {
              "id": "example_input_field",
              "label": "Loại cây trồng / vật nuôi chính",
              "type": "text",
              "placeholder": "VD: Lúa, rau màu, cà phê, chăn nuôi heo…",
              "required": false
            },
            {
              "id": "example_number_field",
              "label": "Số năm kinh nghiệm canh tác (năm)",
              "type": "number",
              "placeholder": "VD: 5",
              "required": false
            },
            {
              "id": "example_checkbox",
              "label": "Phương pháp quan tâm",
              "type": "checkbox",
              "required": true,
              "options": [
                "Canh tác hữu cơ",
                "Giảm phân thuốc hóa học",
                "Tái sử dụng phụ phẩm nông nghiệp",
                "Bảo vệ đất & nguồn nước"
              ]
            },
            {
              "id": "example_select",
              "label": "Mục tiêu tham gia chiến dịch",
              "type": "select",
              "required": true,
              "options": [
                "Nâng cao năng suất",
                "Bảo vệ môi trường",
                "Ổn định đầu ra"
              ]
            },
            {
              "id": "example_radio",
              "label": "Giới tính",
              "type": "radio",
              "required": true,
              "options": [
                "Nam",
                "Nữ",
                "Khác"
              ]
            },
            {
              "id": "example_textarea",
              "label": "Mong muốn hỗ trợ từ chương trình",
              "type": "textarea",
              "placeholder": "VD: Đào tạo kỹ thuật, kết nối chuyên gia, hỗ trợ mô hình mẫu…",
              "rows": 4,
              "required": false
            }
          ]
        }
      ]
    }
  },
  "ung-dung-cong-nghe": {
    "campaign_id": "ung-dung-cong-nghe",
    "enabled": true,
    "config": {
      "allowMultipleSubmissions": true,
      "showReferralInfo": true,
      "showDeviceInfo": true,
      "zalo": {
        "enabled": true,
        "title": "Tham gia nhóm Zalo hỗ trợ nông dân",
        "description": "Nhận thông báo mới, hướng dẫn kỹ thuật và trao đổi trực tiếp với cán bộ hỗ trợ.",
        "link": "https://zalo.me/g/zox0u8849l"
      },
      "callForAction": {
        "enabled": true,
        "title": "Nhiều chương trình hỗ trợ khác đang được chuẩn bị",
        "description": "Trong thời gian tới, Nông Dân Phát sẽ triển khai thêm nhiều chiến dịch và chương trình hỗ trợ nông dân trên nhiều lĩnh vực khác nhau như ứng dụng công nghệ, canh tác bền vững, đào tạo kỹ thuật và kết nối tiêu thụ sản phẩm.",
        "link": "https://zalo.me/g/zox0u8849l"
      }
    },
    "metadata": {
      "pageTitle": "NDP-Nông Dân Phát",
      "heroTitle": "Đăng ký tham gia chương trình ứng dụng công nghệ nông nghiệp",
      "description": "Vui lòng cung cấp thông tin chính xác để chúng tôi tư vấn, kết nối và hỗ trợ bạn tiếp cận các giải pháp công nghệ phù hợp với mô hình sản xuất hiện tại.",
      "submitButtonText": "Gửi thông tin",
      "newSubmitButtonText": "Gửi thông tin khác",
      "disabledMessage": "Chiến dịch này hiện đang tắt.",
      "copyright": "© 2026 Nông Dân Phát. Mọi quyền được bảo lưu.",
      "startDate": "1/1/2026",
      "endDate": "31/12/2026",
      "resultTitle": "Đã gửi thông tin thành công"
    },
    "theme": {
      "primaryColor": "#AB7E31",
      "backgroundColor": "#f3f4f6",
      "warningColor": "#ED3241",
      "cardBorderRadius": "20px",
      "heroBorderRadius": "20px"
    },
    "fields": {
      "mandatory": {
        "full_name": {
          "label": "Họ và tên",
          "type": "text",
          "placeholder": "VD: Nguyễn Văn A",
          "required": true,
          "visible": true
        },
        "phone": {
          "label": "Số điện thoại",
          "type": "tel",
          "placeholder": "VD: 0912 345 678",
          "required": true,
          "visible": true
        },
        "province": {
          "label": "Tỉnh / Thành phố",
          "type": "select",
          "source": "administrative",
          "required": true,
          "visible": true
        },
        "district": {
          "label": "Huyện / Thị xã / TP trực thuộc",
          "type": "select",
          "source": "administrative",
          "required": true,
          "visible": true
        },
        "ward": {
          "label": "Xã / Phường / Thị trấn",
          "type": "select",
          "source": "administrative",
          "required": true,
          "visible": true
        },
        "hamlet": {
          "label": "Thôn / Ấp / Tổ dân phố",
          "type": "text",
          "placeholder": "VD: Thôn A / Ấp B / Tổ 5 KP 3",
          "required": true,
          "visible": true
        },
        "street": {
          "label": "Đường",
          "type": "text",
          "placeholder": "Tên đường (Nếu có)",
          "required": false,
          "visible": true
        },
        "house_number": {
          "label": "Số nhà",
          "type": "text",
          "placeholder": "Số nhà (Nếu có)",
          "required": false,
          "visible": true
        }
      },
      "custom": [
        {
          "title": "Thông tin mô hình & nhu cầu hỗ trợ",
          "fields": [
            {
              "id": "example_input_field",
              "label": "Mô hình sản xuất hiện tại",
              "type": "text",
              "placeholder": "VD: Trồng rau, chăn nuôi gia cầm, cây ăn trái…",
              "required": false
            },
            {
              "id": "example_number_field",
              "label": "Diện tích (m2)",
              "type": "number",
              "placeholder": "VD: 3000",
              "required": false
            },
            {
              "id": "example_checkbox",
              "label": "Lĩnh vực quan tâm",
              "type": "checkbox",
              "required": true,
              "options": [
                "Ứng dụng IoT / cảm biến",
                "Quản lý mùa vụ & sản lượng",
                "Tưới tiêu – tiết kiệm nước",
                "Truy xuất nguồn gốc"
              ]
            },
            {
              "id": "example_select",
              "label": "Mức độ sẵn sàng áp dụng công nghệ",
              "type": "select",
              "required": true,
              "options": [
                "Chưa áp dụng",
                "Đang tìm hiểu",
                "Đã áp dụng một phần"
              ]
            },
            {
              "id": "example_radio",
              "label": "Giới tính",
              "type": "radio",
              "required": true,
              "options": [
                "Nam",
                "Nữ",
                "Khác"
              ]
            },
            {
              "id": "example_textarea",
              "label": "Nhu cầu cụ thể hoặc khó khăn đang gặp phải",
              "type": "textarea",
              "placeholder": "VD: Thiếu nhân công, chi phí cao, khó quản lý…",
              "rows": 4,
              "required": false
            }
          ]
        }
      ]
    }
  }
};

export function getDummyCampaignConfig(
  campaignId: string
): CampaignConfig | null {
  return dummyCampaigns[campaignId] ?? null;
}

export function listDummyCampaigns(): Array<{ id: string; title: string }> {
  return Object.values(dummyCampaigns).map((campaign) => ({
    id: campaign.campaign_id,
    title: campaign.metadata.heroTitle || campaign.campaign_id,
  }));
}
