/**
 * Google Apps Script Web App – Template cho mọi chiến dịch
 * Xem README.md để biết cách sử dụng chi tiết
 */

// ======= CẤU HÌNH =======
// ⚠️ THAY BẰNG SHEET ID THẬT CỦA BẠN
// Lấy từ URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
const SHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";

// ======= THỨ TỰ CỘT TRONG SHEET =======
// ⚠️ CẢNH BÁO: CÁC TRƯỜNG BẮT BUỘC KHÔNG ĐƯỢC XÓA/THAY ĐỔI THỨ TỰ
const COLUMN_ORDER = [
  "submitted_at", // ⚠️ BẮT BUỘC - Không xóa
  "campaign_id", // ⚠️ BẮT BUỘC - Không xóa
  "full_name", // ⚠️ BẮT BUỘC - Không xóa
  "phone", // ⚠️ BẮT BUỘC - Không xóa
  "province", // ⚠️ BẮT BUỘC - Không xóa
  "district", // ⚠️ BẮT BUỘC - Không xóa
  "ward", // ⚠️ BẮT BUỘC - Không xóa
  "hamlet", // ⚠️ BẮT BUỘC - Không xóa
  "street", // ⚠️ BẮT BUỘC - Không xóa,
  "house_number", // ⚠️ BẮT BUỘC - Không xóa,
  "referral", // ⚠️ BẮT BUỘC - Không xóa,
  "device", // ⚠️ BẮT BUỘC - Không xóa,
  "ip_address", // ⚠️ BẮT BUỘC - Không xóa,
  "zalo_link", // ⚠️ BẮT BUỘC - Không xóa,

  // ⚠️ BẮT BUỘC: Tất cả custom fields trong campaign.json phải được khai báo ở đây
  // Thứ tự trong array = thứ tự cột trong Sheet
  // Ví dụ:
  "example_input_field",
  "example_number_field",
  "example_checkbox",
  "example_select",
  "example_radio",
  "example_textarea",
];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    if (!SHEET_ID || SHEET_ID === "PASTE_YOUR_SHEET_ID_HERE") {
      return json_({
        success: false,
        message: "Chưa cấu hình SHEET_ID",
      });
    }

    const raw = e?.postData?.contents || "{}";
    const data = JSON.parse(raw);

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (!sh) {
      return json_({
        success: false,
        message: "Google Sheet không có sheet nào",
      });
    }

    const now = new Date();
    const row = COLUMN_ORDER.map((col) => {
      if (col === "submitted_at") return now;
      if (col === "ip_address") return "'" + (data[col] ?? "");
      // Sử dụng ?? thay vì || để giữ giá trị 0 và false
      return data[col] ?? "";
    });

    sh.appendRow(row);

    return json_({
      success: true,
      submitted_at_iso: now.toISOString(),
    });
  } catch (err) {
    return json_({
      success: false,
      message: "Lỗi server: " + err.toString(),
    });
  }
}
