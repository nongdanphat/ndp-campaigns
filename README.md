# 🌾 NDP Campaigns – Webform Lite

Trang web tĩnh thu thập thông tin chiến dịch.  
Triển khai: **Cloudflare Pages** + **Google Apps Script**.

## 📁 Cấu trúc dự án

```
ndp-campaigns/
├── templates/              # Template dùng chung
│   ├── fe/                 # Frontend template
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── campaign.json          # Template campaign.json
│   │   │   ├── background.png
│   │   │   └── logo.png
│   │   └── _headers
│   └── gas/                # Google Apps Script template
│       └── Code.gs
│
├── shared/                 # Dữ liệu dùng chung cho tất cả chiến dịch
│   ├── administrative-unit-data.json
│   └── unit_zalo_group.csv
│
└── dist/                   # Chiến dịch đã build (deploy folder này)
    ├── _redirects
    ├── thudong2025/
    │   ├── index.html
    │   ├── assets/
    │   │   ├── campaign.json
    │   │   ├── background.png
    │   │   └── logo.png
    │   └── _headers
    └── ...
```

## 🚀 Tạo chiến dịch mới (7 bước)

### 1. Tạo Google Sheet
- New Google Sheet → Tạo sheet mới
- **Lưu ý**: Bạn có thể đổi tên sheet thành bất kỳ tên nào (VD: "Responses", "Data", ...)
- Script tự động dùng **sheet đầu tiên** (không quan tâm tên)

### 2. Apps Script
- Extensions → Apps Script
- Copy `templates/gas/Code.gs`
- **Sửa `SHEET_ID`** (lấy từ URL Sheet: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`)
- **⚠️ BẮT BUỘC**: Sửa `COLUMN_ORDER` để khai báo tất cả custom fields
  - Tìm biến `COLUMN_ORDER` ở đầu file Code.gs
  - **Tất cả custom fields trong `campaign.json` phải được thêm vào đây** (VD: `"crop_type"`, `"acreage"`)
  - Thứ tự trong array = thứ tự cột trong Sheet
  - **Lưu ý**: Script sẽ KHÔNG tự động thêm cột, chỉ dùng các cột đã khai báo trong `COLUMN_ORDER`
- Deploy → Web app → Copy URL

### 3. Tạo thư mục
```bash
mkdir dist/ten-chien-dich
mkdir dist/ten-chien-dich/assets
```

### 4. Copy template
```bash
# Windows PowerShell
Copy-Item templates/fe/* dist/ten-chien-dich/ -Recurse
```

### 5. Cấu hình campaign.json
File `campaign.json` đã được copy từ template. Mở `dist/ten-chien-dich/assets/campaign.json` và sửa:

**⚠️ QUAN TRỌNG - Sửa ngay ở đầu file:**
- `campaign_id` → Tên chiến dịch
- `config.scriptUrl` → **Dán URL từ bước 2** (BẮT BUỘC - ở ngay đầu file để dễ thấy)

**Các phần khác:**
- `metadata.title`, `metadata.description` → Thông tin chiến dịch
- `metadata.image` → Đường dẫn logo (thường là `"./assets/logo.png"`)
- `fields.custom` → Thêm custom fields nếu cần

**⚠️ CẢNH BÁO QUAN TRỌNG - PHẦN BẮT BUỘC KHÔNG ĐƯỢC CHỈNH SỬA:**

**Trong `campaign.json` → `fields.mandatory`:**
- ❌ **KHÔNG được**: Xóa, thêm, hoặc thay đổi `id` của các trường bắt buộc
- ❌ **KHÔNG được**: Đổi `type`, `required`, `source` của các trường bắt buộc
- ✅ **Được phép**: Thay đổi `label`, `placeholder` (để tùy chỉnh hiển thị)
- Các trường bắt buộc: `full_name`, `phone`, `address`, `province`, `district`, `ward`, `hamlet`

**Trong `Code.gs` → `COLUMN_ORDER`:**
- ❌ **KHÔNG được**: Xóa hoặc thay đổi thứ tự các cột bắt buộc
- ⚠️ **BẮT BUỘC**: Tất cả custom fields trong `campaign.json` phải được khai báo ở đây
- **Các cột bắt buộc** (phải giữ nguyên thứ tự):
  1. `submitted_at` - Thời gian submit
  2. `campaign_id` - ID chiến dịch
  3. `full_name` - Họ và tên
  4. `phone` - Số điện thoại
  5. `province` - Tỉnh/Thành phố
  6. `district` - Huyện/Thị xã
  7. `ward` - Xã/Phường
  8. `hamlet` - Thôn/Ấp
  9. `address` - Địa chỉ
  10. `referral` - Referrer URL
  11. `device` - Thông tin thiết bị
  12. `ip_address` - Địa chỉ IP
  13. `zalo_link` - Link Zalo group

**⚠️ QUAN TRỌNG - Tạo cột trên Sheet:**
- **Tất cả các cột trong `COLUMN_ORDER` phải được tạo sẵn trên Sheet với ID tương ứng**
- Script sẽ KHÔNG tự động tạo/thêm cột mới
- Nếu thiếu cột, script sẽ báo lỗi và không lưu dữ liệu
- **Lần đầu submit (sheet trống)**: Script tự động tạo header row từ `COLUMN_ORDER`
- **Submit sau**: Script chỉ kiểm tra header có đúng không, không tự động thêm cột

### 6. Thêm logo
Đặt logo vào `dist/ten-chien-dich/assets/logo.png`

### 7. Test & Deploy
- Mở `dist/ten-chien-dich/index.html` test local
- Commit & push → Cloudflare Pages tự deploy
- Truy cập: `https://your-domain.com/ten-chien-dich/`

## 📝 Cấu hình campaign.json

### Metadata
```json
"metadata": {
  "pageTitle": "Tiêu đề tab trình duyệt",
  "heroTitle": "Tiêu đề hiển thị trong hero",
  "description": "Mô tả",
  "image": "./assets/logo.png",
  "background": "./assets/background.png",
  "submitButtonText": "Gửi thông tin",
  "newSubmitButtonText": "Gửi thông tin khác",
  "disabledMessage": "Chiến dịch này hiện đang tắt.",
  "resultTitle": "🎉 Đã nhận thông tin",
  "copyright": "© 2025 NDP. Mọi quyền sở hữu và quyền liên quan được bảo lưu."
}
```

**Các trường metadata:**
- `pageTitle`: Tiêu đề hiển thị trên tab trình duyệt
- `heroTitle`: Tiêu đề hiển thị trong hero section
- `description`: Mô tả chiến dịch
- `image`: Đường dẫn logo (thường là `"./assets/logo.png"`)
- `background`: Đường dẫn hình nền cho hero section (thường là `"./assets/background.png"`)
- `submitButtonText`: Text của nút submit (mặc định: `"Gửi thông tin"`)
- `newSubmitButtonText`: Text của nút "Gửi thông tin khác" (mặc định: `"Gửi thông tin khác"`)
- `disabledMessage`: Thông báo khi chiến dịch bị tắt (mặc định: `"Chiến dịch này hiện đang tắt."`)
- `resultTitle`: Tiêu đề hiển thị khi submit thành công (mặc định: `"🎉 Đã nhận thông tin"`)
- `copyright`: Text hiển thị ở cuối form (mặc định: `"© 2025 NDP. Mọi quyền sở hữu và quyền liên quan được bảo lưu."`)

### Theme (màu sắc)
```json
"theme": {
  "primaryColor": "#AB7E31",      // Màu chủ đạo
  "backgroundColor": "#f3f4f6",   // Màu nền
  "warningColor": "#ED3241",      // Màu cảnh báo/lỗi
  "cardBorderRadius": "20px",     // Bo góc cho các card components
  "backgroundHeight": "20rem",    // Chiều cao của hero section
  "heroBorderRadius": "20px"      // Bo góc của hero section
}
```

**Lưu ý:**
- `cardColor`: Mặc định `#ffffff` (trắng), chỉ thêm vào config nếu muốn đổi màu
- `mutedColor`: Mặc định `#6b7280`, chỉ thêm vào config nếu muốn đổi màu
- `cardBorderRadius`: Áp dụng cho tất cả các `.card` components (form card, custom fields cards, submit card, result card)
- `backgroundHeight`: Chiều cao của hero section khi có background image (VD: `"200px"`, `"20rem"`, `"auto"`)
- `heroBorderRadius`: Bo góc của hero section (VD: `"20px"`, `"16px"`, `"0"` - mặc định: `"20px"`)

### Zalo Link Section
Cấu hình phần hiển thị link Zalo sau khi submit thành công (hiển thị riêng thành một card bên dưới result card).

```json
"config": {
  "zalo": {
    "enabled": true,
    "title": "Tham gia nhóm Zalo",
    "description": "Vui lòng tham gia nhóm Zalo để nhận được hỗ trợ tốt nhất."
  }
}
```

**Các trường cấu hình:**
- `enabled`: Bật/tắt phần hiển thị link Zalo (mặc định: `true`). Đặt `false` để tắt hoàn toàn
- `title`: Tiêu đề của card Zalo (mặc định: `"Tham gia nhóm Zalo"`)
- `description`: Mô tả hiển thị trong card Zalo (mặc định: `"Vui lòng tham gia nhóm Zalo để nhận được hỗ trợ tốt nhất."`)

**Lưu ý:**
- Phần Zalo link chỉ hiển thị khi có link Zalo được tìm thấy dựa trên địa chỉ (tỉnh-huyện-xã)
- Link Zalo sẽ được tự động tìm từ file CSV `unit_zalo_group.csv` dựa trên mã đơn vị hành chính
- Nếu không tìm thấy link Zalo hoặc `enabled: false`, card này sẽ không hiển thị

### Custom Fields
Cấu trúc: `fields.custom` là **array** các section, mỗi section có `title` và `fields`.

```json
"custom": [
  {
    "title": "Thông tin đăng ký",
    "fields": [
      {
        "id": "crop_type",
        "label": "Loại cây trồng",
        "type": "text",
        "placeholder": "VD: Thanh long",
        "required": false
      },
      {
        "id": "acreage",
        "label": "Diện tích (ha)",
        "type": "number",
        "placeholder": "VD: 2.5",
        "required": false
      }
    ]
  },
  {
    "title": "Thông tin sản phẩm",
    "fields": [
      {
        "id": "product_name",
        "label": "Tên sản phẩm",
        "type": "text",
        "required": true
      }
    ]
  }
]
```

**Lưu ý:**
- Mỗi section sẽ tạo một **card riêng** bên dưới form card
- Tiêu đề card = `title` của section
- Có thể tạo nhiều section, mỗi section là một card riêng

**Các loại field hỗ trợ**:
- `text`: Input text
- `tel`: Input số điện thoại
- `number`: Input số
- `textarea`: Textarea (có thể thêm `rows: 3`)
- `select`: Dropdown select với options
- `checkbox`: Checkbox group (cho phép chọn nhiều)
- `radio`: Radio group (chỉ chọn một)

**Ví dụ select field**:
```json
{
  "id": "crop_type",
  "label": "Loại cây trồng",
  "type": "select",
  "placeholder": "-- Chọn loại cây --",
  "required": true,
  "options": [
    "Thanh long",
    "Xoài",
    "Chuối"
  ]
}
```

**Ví dụ checkbox field** (cho phép chọn nhiều):
```json
{
  "id": "interests",
  "label": "Sở thích",
  "type": "checkbox",
  "required": true,
  "options": [
    "Đọc sách",
    "Nghe nhạc",
    "Xem phim",
    "Du lịch"
  ]
}
```

**Ví dụ radio field** (chỉ chọn một):
```json
{
  "id": "gender",
  "label": "Giới tính",
  "type": "radio",
  "required": true,
  "options": [
    "Nam",
    "Nữ",
    "Khác"
  ]
}
```

**Lưu ý về checkbox và radio**:
- Checkbox: Cho phép chọn nhiều options, giá trị sẽ được lưu dưới dạng chuỗi các giá trị được chọn, phân cách bởi dấu phẩy (VD: "Đọc sách, Xem phim")
- Radio: Chỉ cho phép chọn một option, giá trị sẽ là giá trị của option được chọn
- Cả checkbox và radio đều hỗ trợ màu sắc theo cấu hình `primaryColor` trong theme
- Options chỉ dùng string đơn giản (VD: `["Option 1", "Option 2"]`)

## 🔄 Routing sau khi deploy

```
/summer-sale/   → dist/summer-sale/index.html
/tet-2026/      → dist/tet-2026/index.html
/north-event/   → dist/north-event/index.html
```

Mỗi chiến dịch tự động load config từ `./assets/campaign.json` trong thư mục của nó.

## 🛠️ Troubleshooting

### Form không submit được
- Kiểm tra `config.scriptUrl` trong `campaign.json` đã đúng chưa
- Kiểm tra Google Apps Script đã deploy với quyền "Anyone" chưa
- Mở Console (F12) để xem lỗi chi tiết

### Không load được dữ liệu địa giới hành chính
- Kiểm tra file `administrative-unit-data.json` có trong `assets/` không
- Kiểm tra `config.adminDataUrl` trong `campaign.json`

### Sheet không nhận được dữ liệu
- Kiểm tra `SHEET_ID` trong `Code.gs` đã đúng chưa
- Kiểm tra Google Apps Script có quyền truy cập Sheet không
- Xem Logs trong Google Apps Script để debug

### Lỗi "Không tìm thấy sheet"
- Đảm bảo Sheet có ít nhất 1 tab (sheet đầu tiên)
- Script tự động dùng **sheet đầu tiên** (không quan tâm tên sheet)
- Bạn có thể đổi tên sheet thành bất kỳ tên nào, script vẫn hoạt động bình thường

### Sheet tự động tạo header như thế nào?
- **Lần đầu submit (sheet trống)**: Script tự động tạo header row với tất cả cột từ `COLUMN_ORDER`
- **Submit sau**: Script chỉ kiểm tra header có đúng không, **KHÔNG tự động thêm cột mới**
- **⚠️ QUAN TRỌNG**: Tất cả các cột trong `COLUMN_ORDER` phải được tạo sẵn trên Sheet với ID tương ứng
- Nếu thiếu cột, script sẽ báo lỗi và không lưu dữ liệu

### Thay đổi thứ tự cột trong Sheet
- Sửa biến `COLUMN_ORDER` ở đầu file Code.gs
- Thứ tự trong array = thứ tự cột trong Sheet
- ⚠️ **BẮT BUỘC**: Tất cả custom fields trong `campaign.json` phải được khai báo ở đây
- **Lưu ý**: Script sẽ KHÔNG tự động thêm cột, chỉ dùng các cột đã khai báo trong `COLUMN_ORDER`

## 📄 License

Copyright (c) 2024 NDP. All rights reserved.

Bản quyền thuộc về NDP. Mọi quyền được bảo lưu.
