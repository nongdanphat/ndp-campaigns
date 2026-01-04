# Inter Font Files

## Cấu trúc thư mục

```
assets/fonts/
├── inter-fonts.css (file này)
├── README.md (file này)
└── static/ (thư mục chứa font files từ Google Fonts)
    ├── Inter-VariableFont_opsz,wght.ttf
    ├── Inter-Italic-VariableFont_opsz,wght.ttf
    ├── Inter_18pt-Regular.ttf
    ├── Inter_18pt-Bold.ttf
    └── ... (các file khác)
```

## Cách sử dụng

### Cách 1: Dùng Variable Font (Khuyến nghị - đã được cấu hình sẵn)

Variable font là cách hiện đại nhất, chỉ cần 1 file để hỗ trợ tất cả weights từ 100-900.

**Yêu cầu:**
- Copy file `Inter-VariableFont_opsz,wght.ttf` vào thư mục `static/`
- File CSS đã được cấu hình sẵn để dùng variable font

**Lợi ích:**
- Chỉ cần 1 file thay vì nhiều file
- Kích thước nhỏ hơn tổng thể
- Hỗ trợ mọi weight từ 100-900

### Cách 2: Dùng các file riêng lẻ từ thư mục static

Nếu muốn dùng các file riêng lẻ (Inter_18pt-Regular.ttf, Inter_18pt-Bold.ttf, etc.):

1. Copy tất cả các file font từ thư mục `static/` của Google Fonts vào `assets/fonts/static/`
2. Mở file `inter-fonts.css`
3. Comment dòng variable font (Option 1)
4. Bỏ comment các dòng individual fonts (Option 2)

**Các file cần có:**
- `Inter_18pt-Light.ttf` (weight: 300)
- `Inter_18pt-Regular.ttf` (weight: 400)
- `Inter_18pt-Medium.ttf` (weight: 500)
- `Inter_18pt-SemiBold.ttf` (weight: 600)
- `Inter_18pt-Bold.ttf` (weight: 700)
- `Inter_18pt-ExtraBold.ttf` (weight: 800)
- `Inter_18pt-Black.ttf` (weight: 900)

## Lưu ý

- File `.ttf` có thể dùng được, nhưng `.woff2` sẽ nhỏ hơn và load nhanh hơn
- Nếu muốn tối ưu, có thể convert `.ttf` sang `.woff2` bằng công cụ online
- Font sẽ tự động được load qua `styles.css` và `load-header-footer.js`
