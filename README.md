# 🌾 NDP Campaigns – Webform Lite

Trang web tĩnh thu thập thông tin chiến dịch.  
Triển khai: **Cloudflare Pages** + **Google Apps Script**.

## 🏃 Chạy local để test

**Quan trọng:** Tất cả các đường dẫn trong project đã được cấu hình là **absolute paths** (bắt đầu bằng `/`) để phù hợp với Cloudflare Pages.

Khi chạy local, bạn **phải** chạy server từ thư mục `dist/`:

### Cách 1: Sử dụng Live Server (VS Code)

1. Click chuột phải vào file `dist/nong-nghiep-ben-vung/index.html` hoặc `dist/ung-dung-cong-nghe/index.html`
2. Chọn **"Open with Live Server"**

### Cách 2: Sử dụng Python HTTP Server (Khuyến nghị)

**Windows (PowerShell):**
```powershell
cd dist
python -m http.server 8000
```

**Windows (CMD):**
```cmd
cd dist
python -m http.server 8000
```

Sau đó truy cập: 
- `http://localhost:8000/nong-nghiep-ben-vung/`
- `http://localhost:8000/ung-dung-cong-nghe/`

### Cách 3: Sử dụng Node.js http-server

```bash
npx http-server dist -p 8000 -o
```

Sau đó truy cập: 
- `http://localhost:8000/nong-nghiep-ben-vung/`
- `http://localhost:8000/ung-dung-cong-nghe/`

## 📁 Cấu trúc dự án

```
ndp-campaigns/
├── gas/                    # Google Apps Script template
│   └── Code.gs
│
├── shared/                 # Dữ liệu dùng chung
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

## 🚀 Tạo chiến dịch mới

### 1. Tạo thư mục chiến dịch

```bash
# Tạo thư mục
mkdir dist/ten-chien-dich
mkdir dist/ten-chien-dich/assets
```

Sau đó tạo các file cần thiết (index.html, campaign.json, _headers, assets/background.png, assets/logo.png) hoặc copy từ một chiến dịch có sẵn.

### 2. Cấu hình campaign.json

Mở `dist/ten-chien-dich/assets/campaign.json` và sửa:
- `campaign_id` → Tên chiến dịch
- `config.scriptUrl` → URL Google Apps Script (bắt buộc)
- `metadata.*` → Thông tin chiến dịch
- `fields.custom` → Thêm custom fields nếu cần
- `config.zalo.enabled` → Bật/tắt hiển thị card Zalo (mặc định: `true`)
- `config.zalo.title` → Tiêu đề card Zalo
- `config.zalo.description` → Mô tả card Zalo
- `config.callForAction.enabled` → Bật/tắt hiển thị card Kêu gọi hành động (mặc định: `true`)
- `config.callForAction.title` → Tiêu đề card Kêu gọi
- `config.callForAction.description` → Mô tả card Kêu gọi

### 3. Thêm logo

Đặt logo vào `dist/ten-chien-dich/assets/logo.png`

### 4. Thiết lập Google Apps Script

Copy file `gas/Code.gs` vào Google Apps Script project mới và cấu hình:
- Tạo Google Sheet để lưu dữ liệu
- Cập nhật `SPREADSHEET_ID` trong `Code.gs`
- Cập nhật `COLUMN_ORDER` nếu có custom fields
- Deploy và lấy URL để cập nhật vào `campaign.json` → `config.scriptUrl`

### 5. Xem dữ liệu đã submit

Tất cả dữ liệu đã submit được lưu tại Google Sheet:
📊 [Xem dữ liệu đã submit](https://docs.google.com/spreadsheets/d/1bMZkWsOg2FkNzO0ZG3TBx4W2hn9kVtBAy487WtcwKlc/edit?gid=261087324#gid=261087324)

## ⚠️ CẢNH BÁO QUAN TRỌNG

### Không được sửa đổi fields hệ thống

**Trong `campaign.json` → `fields.mandatory`:**
- ❌ **KHÔNG được**: Xóa, thêm, hoặc thay đổi `id` của các trường hệ thống (bắt buộc và không bắt buộc)
- ❌ **KHÔNG được**: Đổi `type`, `required`, `source` của các trường hệ thống
- ✅ **Được phép**: Thay đổi `label`, `placeholder` (để tùy chỉnh hiển thị)

**Các trường bắt buộc:**
- `full_name` - Họ và tên
- `phone` - Số điện thoại
- `province` - Tỉnh/Thành phố
- `district` - Huyện/Thị xã
- `ward` - Xã/Phường
- `hamlet` - Thôn/Ấp

**Các trường không bắt buộc nhưng không được sửa đổi:**
- `street` - Đường (không bắt buộc)
- `house_number` - Số nhà (không bắt buộc)

**Trong `Code.gs` → `COLUMN_ORDER`:**
- ❌ **KHÔNG được**: Xóa hoặc thay đổi thứ tự các cột bắt buộc
- ⚠️ **BẮT BUỘC**: Tất cả custom fields trong `campaign.json` phải được khai báo ở đây

**Các cột bắt buộc** (phải giữ nguyên thứ tự):
1. `submitted_at` - Thời gian submit
2. `campaign_id` - ID chiến dịch
3. `full_name` - Họ và tên
4. `phone` - Số điện thoại
5. `province` - Tỉnh/Thành phố
6. `district` - Huyện/Thị xã
7. `ward` - Xã/Phường
8. `hamlet` - Thôn/Ấp
9. `street` - Đường (không bắt buộc)
10. `house_number` - Số nhà (không bắt buộc)
11. `referral` - Referrer URL
12. `device` - Thông tin thiết bị
13. `ip_address` - Địa chỉ IP
14. `zalo_link` - Link Zalo group

## 📝 Thêm Custom Fields

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
  }
]
```

**Lưu ý:**
- Mỗi section sẽ tạo một **card riêng** bên dưới form card
- Tiêu đề card = `title` của section
- Có thể tạo nhiều section, mỗi section là một card riêng

**Các loại field hỗ trợ:**
- `text` - Input text
- `tel` - Input số điện thoại
- `number` - Input số
- `textarea` - Textarea (có thể thêm `rows: 3`)
- `select` - Dropdown select với options
- `checkbox` - Checkbox group (cho phép chọn nhiều)
- `radio` - Radio group (chỉ chọn một)

**Ví dụ select field:**
```json
{
  "id": "crop_type",
  "label": "Loại cây trồng",
  "type": "select",
  "placeholder": "-- Chọn loại cây --",
  "required": true,
  "options": ["Thanh long", "Xoài", "Chuối"]
}
```

**Ví dụ checkbox field** (cho phép chọn nhiều):
```json
{
  "id": "interests",
  "label": "Sở thích",
  "type": "checkbox",
  "required": true,
  "options": ["Đọc sách", "Nghe nhạc", "Xem phim"]
}
```

**Ví dụ radio field** (chỉ chọn một):
```json
{
  "id": "gender",
  "label": "Giới tính",
  "type": "radio",
  "required": true,
  "options": ["Nam", "Nữ", "Khác"]
}
```

**Lưu ý về checkbox và radio:**
- Checkbox: Cho phép chọn nhiều options, giá trị lưu dưới dạng chuỗi phân cách bởi dấu phẩy (VD: "Đọc sách, Xem phim")
- Radio: Chỉ cho phép chọn một option

**⚠️ QUAN TRỌNG:**
- Sau khi thêm custom fields vào `campaign.json`, **bắt buộc** phải thêm các field ID vào `COLUMN_ORDER` trong `Code.gs`
- Thứ tự trong `COLUMN_ORDER` = thứ tự cột trong Google Sheet
- Tất cả các cột trong `COLUMN_ORDER` phải được tạo sẵn trên Sheet với ID tương ứng

## 🔧 Cấu hình Zalo và Call for Action

### Bật/tắt Zalo Card

Card Zalo sẽ hiển thị sau khi người dùng submit form thành công. Cấu hình trong `campaign.json`:

```json
"config": {
  "zalo": {
    "enabled": true,
    "title": "Tham gia nhóm Zalo",
    "description": "Vui lòng tham gia nhóm Zalo để nhận được hỗ trợ tốt nhất."
  }
}
```

**Lưu ý:**
- `enabled: true` → Hiển thị card Zalo (mặc định)
- `enabled: false` → Ẩn card Zalo
- Nếu có `zalo_link` trong dữ liệu, link sẽ được hiển thị trong card
- Nếu không có `zalo_link`, card vẫn hiển thị nhưng không có link

### Bật/tắt Call for Action Card (Kêu gọi hành động)

Card Call for Action hiển thị thông điệp kêu gọi người dùng liên hệ hoặc thực hiện hành động. Cấu hình trong `campaign.json`:

```json
"config": {
  "callForAction": {
    "enabled": true,
    "title": "Liên hệ tư vấn",
    "description": "Vui lòng liên hệ để được tư vấn và hỗ trợ tốt nhất."
  }
}
```

**Lưu ý:**
- `enabled: true` → Hiển thị card Call for Action (mặc định)
- `enabled: false` → Ẩn card Call for Action
