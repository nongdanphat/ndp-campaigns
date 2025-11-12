/**
 * Google Apps Script Web App (doPost) – mỗi submit là một dòng.
 * - Deploy: Deploy → New deployment → Web app → Execute as Me, Who has access: Anyone
 * - Frontend gửi Content-Type: text/plain để tránh preflight.
 * - Trả JSON { success, message, submitted_at_iso, echo } để client hiển thị biên nhận.
 * - Mapping campaign → Google Sheet: chỉnh trong getCampaignMap_() hoặc đọc từ Admin Sheet (khuyến nghị).
 */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * (ĐƠN GIẢN) Mapping cứng – thay bằng Admin Sheet nếu muốn quản trị thuận tiện.
 * Gợi ý Admin Sheet: cột [campaign_id, sheet_id, sheet_name, enabled, start_iso, end_iso, fields_json]
 * Sau đó đọc & cache 5-10 phút.
 */
function getCampaignMap_() {
  // TODO: đọc từ Admin Sheet để dễ cấu hình. Ở đây demo 2 campaign:
  return {
    "NDP_CAMPAIGN_01": { sheetId: "PASTE_SHEET_ID_1", sheetName: "Responses", enabled: true },
    "NDP_CAMPAIGN_02": { sheetId: "PASTE_SHEET_ID_2", sheetName: "Responses", enabled: true }
  };
}

function doPost(e) {
  try {
    const raw = e?.postData?.contents || "{}";
    const data = JSON.parse(raw);

    // kiểm tra trường bắt buộc tối thiểu
    const required = ['campaign_id','full_name','phone','province','district','ward','hamlet'];
    const missing = required.filter(k => !String(data[k] ?? '').trim());
    if (missing.length) {
      return json_({ success:false, message:`Thiếu trường: ${missing.join(', ')}` });
    }

    // tìm sheet theo campaign
    const cmap = getCampaignMap_();
    const cfg = cmap[data.campaign_id];
    if (!cfg || cfg.enabled === false) {
      return json_({ success:false, message:'Campaign không hợp lệ/đang tắt' });
    }

    // (Tuỳ chọn) kiểm tra khung thời gian start/end ở đây nếu cần
    // if (cfg.start && new Date() < new Date(cfg.start)) return json_({success:false, message:'Campaign chưa bắt đầu'});
    // if (cfg.end && new Date() > new Date(cfg.end)) return json_({success:false, message:'Campaign đã kết thúc'});

    const ss = SpreadsheetApp.openById(cfg.sheetId);
    const sh = cfg.sheetName ? ss.getSheetByName(cfg.sheetName) : ss.getSheets()[0];

    const now = new Date();
    const row = [
      now,                      // submitted_at
      data.campaign_id,         // campaign_id
      data.full_name,           // full_name
      data.phone,               // phone
      data.province,            // province
      data.district,            // district
      data.ward,                // ward
      data.hamlet,              // hamlet
      data.referral || '',      // referral
      data.device || 'N/A'      // device
      // Nếu campaign có cột mở rộng, thêm theo đúng thứ tự cột tại đây, ví dụ:
      // , data.crop_type || ''
    ];

    sh.appendRow(row);

    // Trả về biên nhận cho frontend
    return json_({
      success: true,
      message: 'Đã nhận thông tin. Cảm ơn bạn!',
      submitted_at_iso: now.toISOString(),
      echo: {
        campaign_id: data.campaign_id,
        full_name: data.full_name,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        hamlet: data.hamlet,
        referral: data.referral || '',
        device: data.device || 'N/A'
        // + các trường mở rộng nếu có
      }
    });
  } catch (err) {
    return json_({ success:false, message:'Lỗi server: ' + err });
  }
}
