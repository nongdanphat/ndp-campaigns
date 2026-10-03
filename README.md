# 🌾 NDP Campaigns – Webform Lite

Trang web tĩnh thu thập thông tin chiến dịch.  
Một lần deploy, mọi chiến dịch đi qua `/{campaign-id}`. Config tạm nằm ở `src/api/dummy-campaigns.json`. Địa giới và (sau này) đáp án đi qua API backend.

## 🏃 Chạy local cho giống production

Không dùng Live Server. Live Server mở file thành `/index.html`, không rewrite path như host thật, nên URL local sẽ khác production.

Dùng `pnpm serve`. Server này phát thư mục `dist/` và làm cùng việc với `dist/_redirects` trên Cloudflare: path không có file tĩnh thì trả về shell, thanh địa chỉ vẫn giữ mã chiến dịch.

```bash
pnpm install
pnpm generate:api   # đọc swagger-spec.json, ghi src/api/generated (chạy lại khi spec đổi)
pnpm build          # ra dist/index.html và dist/app.js
pnpm serve          # http://localhost:8000
```

Mở đúng dạng URL production:

- `http://localhost:8000/nong-nghiep-ben-vung`

Trên domain thật là `https://campaign.ndphat.vn/nong-nghiep-ben-vung`. Không có `/index.html` và không có `?campaign=`.

Sửa code trong `src/` hoặc config trong `src/api/dummy-campaigns.json` thì chạy lại `pnpm build`, rồi tải lại trang. `pnpm serve` đang chạy thì không cần tắt.

Trình duyệt chỉ gọi `/v1` trên cùng origin. `pnpm serve` và Cloudflare chuyển tiếp sang `API_REWRITE_TARGET` trong `.env` (`https://dev-api.ndphat.com`), giống rewrite của các app khác, nên không bị CORS. Copy `.env.example` thành `.env` nếu chưa có. Đổi URL thì chạy lại `pnpm build` và khởi động lại `pnpm serve`. Dropdown tỉnh / huyện / xã gọi `GET /v1/metadata/old-provinces`, `old-districts` và `old-wards`. Huyện chỉ mở sau khi chọn tỉnh, xã chỉ mở sau khi chọn huyện.

## 📁 Cấu trúc dự án

```
ndp-campaigns/
├── swagger-spec.json       # contract backend, Orval đọc file này
├── orval.config.mjs
├── src/
│   ├── index.html          # shell
│   ├── main.ts
│   ├── form-engine.js
│   ├── types/
│   │   └── campaign.ts     # type chiến dịch
│   └── api/
│       ├── mutator.ts      # API_BASE_URL
│       ├── dummy-campaigns.json # config chiến dịch tạm, chỉ JSON
│       ├── campaigns.ts    # đọc dummy JSON
│       ├── admin-units.ts
│       ├── submit-answers.ts
│       └── generated/      # pnpm generate:api, không commit
└── dist/                   # output deploy
    ├── index.html
    ├── app.js
    └── _redirects
```

## 🚀 Tạo chiến dịch mới

`src/api/dummy-campaigns.json` chỉ là phần `data` mà app admin gửi BE: `config`, `metadata`, `theme`, `fields`. App form gọi `GET /v1/campaigns/{id}`. API lỗi thì dùng file này cho mọi id trên URL. `id`, `createdAt`, `updatedAt`, `enabled`, `answerQuantity` do BE trả, không ghi trong file. Type nằm ở `src/types/campaign.ts`.

Sửa `metadata`, `theme`, `fields.custom`, card Zalo và call for action trong object đó, rồi chạy `pnpm build`. Mọi form dùng chung ảnh `dist/shared/img/background.png`.

Đáp án hiện được gom trong `src/api/submit-answers.ts`. Hàm này chưa gọi mạng. Khi backend thêm operation vào `swagger-spec.json`, chạy `pnpm generate:api` và gọi hàm sinh ra từ file đó.

## ⚠️ CẢNH BÁO QUAN TRỌNG

### Không được sửa đổi fields hệ thống

**Trong `dummy-campaigns.json` → `fields.mandatory`:**
- ❌ **KHÔNG được**: Xóa, thêm, hoặc thay đổi `id` của các trường hệ thống (bắt buộc và không bắt buộc)
- ❌ **KHÔNG được**: Đổi `type`, `required`, `source` của các trường hệ thống
- ✅ **Được phép**: Thay đổi `label`, `placeholder`, và `visible`

`visible: false` ẩn field đó trên form công khai và bỏ qua khi kiểm tra bắt buộc. `full_name` luôn hiện và luôn bắt buộc, kể cả khi `visible` là `false`. Cờ vẫn có trong JSON để UI Admin dùng chung schema. Tỉnh, huyện, xã nên bật hoặc tắt cùng nhau vì cấp sau chỉ tải sau khi chọn cấp trước.

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
- Field id trong `dummy-campaigns.json` là key trong object đáp án gửi lên backend

## 🔧 Cấu hình Zalo và Call for Action

### Bật/tắt Zalo Card

Card Zalo sẽ hiển thị sau khi người dùng submit form thành công. Cấu hình trong `dummy-campaigns.json`:

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

Card Call for Action hiển thị thông điệp kêu gọi người dùng liên hệ hoặc thực hiện hành động. Cấu hình trong `dummy-campaigns.json`:

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
