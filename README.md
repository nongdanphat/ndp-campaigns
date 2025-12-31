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
│   │   │   ├── campaign.json
│   │   │   ├── background.png
│   │   │   └── logo.png
│   │   └── _headers
│   └── gas/                # Google Apps Script template
│       └── Code.gs
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

### 1. Copy template

```bash
# Tạo thư mục
mkdir dist/ten-chien-dich
mkdir dist/ten-chien-dich/assets

# Copy template (Windows PowerShell)
Copy-Item templates/fe/* dist/ten-chien-dich/ -Recurse
```

### 2. Cấu hình campaign.json

Mở `dist/ten-chien-dich/assets/campaign.json` và sửa:
- `campaign_id` → Tên chiến dịch
- `config.scriptUrl` → URL Google Apps Script (bắt buộc)
- `metadata.*` → Thông tin chiến dịch
- `fields.custom` → Thêm custom fields nếu cần

### 3. Thêm logo

Đặt logo vào `dist/ten-chien-dich/assets/logo.png`

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
