
      // ======= GLOBAL STATE =======
      let CAMPAIGN = null;
      let CAMPAIGN_CONFIG = null;
      let isSubmitting = false;
      let loadProvinces = async () => [];
      let loadDistricts = async () => [];
      let loadWards = async () => [];
      let submitAnswers = async () => ({ success: true });

      // ======= UTILITIES =======
      const $ = (id) => document.getElementById(id);

      export async function startCampaign(campaign, services = {}) {
        CAMPAIGN = campaign;
        CAMPAIGN_CONFIG = campaign.data;
        if (services.loadProvinces) loadProvinces = services.loadProvinces;
        if (services.loadDistricts) loadDistricts = services.loadDistricts;
        if (services.loadWards) loadWards = services.loadWards;
        if (services.submitAnswers) submitAnswers = services.submitAnswers;
        await init();
      }

      function applyTheme(theme) {
        const root = document.documentElement;
        if (theme.primaryColor)
          root.style.setProperty("--primary", theme.primaryColor);
        if (theme.backgroundColor)
          root.style.setProperty("--bg", theme.backgroundColor);
        // cardColor mặc định trắng (#fff), có thể override nếu cần
        if (theme.cardColor) root.style.setProperty("--card", theme.cardColor);
        // warningColor thay thế dangerColor
        if (theme.warningColor)
          root.style.setProperty("--danger", theme.warningColor);
        // mutedColor mặc định (#6b7280), có thể override nếu cần
        if (theme.mutedColor)
          root.style.setProperty("--muted", theme.mutedColor);
        // cardBorderRadius dùng cho các card components
        if (theme.cardBorderRadius)
          root.style.setProperty("--radius", theme.cardBorderRadius);
      }

      // ======= CUSTOM DROPDOWN =======
      function createCustomDropdown(fieldId, placeholder = "Chọn") {
        const dropdown = document.createElement("div");
        dropdown.className = "custom-dropdown";
        dropdown.id = fieldId;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "custom-dropdown-button";

        const textSpan = document.createElement("span");
        textSpan.className = "dropdown-text placeholder";
        textSpan.textContent = placeholder;
        button.appendChild(textSpan);

        const arrowSvg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        arrowSvg.setAttribute("class", "dropdown-arrow");
        arrowSvg.setAttribute("width", "12");
        arrowSvg.setAttribute("height", "12");
        arrowSvg.setAttribute("viewBox", "0 0 12 12");
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute("fill", "#6b7280");
        path.setAttribute("d", "M6 9L1 4h10z");
        arrowSvg.appendChild(path);
        button.appendChild(arrowSvg);

        const panel = document.createElement("div");
        panel.className = "custom-dropdown-panel";

        dropdown.appendChild(button);
        dropdown.appendChild(panel);

        // Click handler
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = dropdown.classList.contains("open");
          closeAllDropdowns();
          if (!isOpen) {
            dropdown.classList.add("open");
          }
        });

        return dropdown;
      }

      function closeAllDropdowns() {
        document.querySelectorAll(".custom-dropdown").forEach((dd) => {
          const wasOpen = dd.classList.contains("open");
          dd.classList.remove("open");

          // Clear search input nếu là admin dropdown
          if (wasOpen && dd.classList.contains("admin-dropdown")) {
            const searchInput = dd.querySelector(
              ".admin-dropdown-search input"
            );
            if (searchInput) {
              searchInput.value = "";
              filterAdminDropdownOptions(dd, "");
            }
          }
        });
      }

      function setDropdownValue(dropdown, value, text) {
        const button = dropdown.querySelector(".custom-dropdown-button");
        const textSpan = button.querySelector(".dropdown-text");
        // Kiểm tra value và text một cách rõ ràng hơn (value có thể là "0" nên cần check !== "")
        if (value !== undefined && value !== null && value !== "" && text) {
          textSpan.textContent = text;
          textSpan.classList.remove("placeholder");
          dropdown.dataset.value = value;
        } else {
          textSpan.textContent = dropdown.dataset.placeholder || "Chọn";
          textSpan.classList.add("placeholder");
          dropdown.dataset.value = "";
        }
        // Update selected state
        dropdown.querySelectorAll(".custom-dropdown-option").forEach((opt) => {
          opt.classList.toggle("selected", opt.dataset.value === value);
        });
      }

      function getDropdownValue(dropdown) {
        return dropdown.dataset.value || "";
      }

      function getDropdownLabel(dropdown) {
        if (!getDropdownValue(dropdown)) return "";
        const textSpan = dropdown.querySelector(".dropdown-text");
        return textSpan ? textSpan.textContent.trim() : "";
      }

      function clearDropdown(dropdown, placeholder = "Chọn") {
        const panel = dropdown.querySelector(".custom-dropdown-panel");
        panel.innerHTML = "";
        setDropdownValue(dropdown, "", "");
        dropdown.dataset.placeholder = placeholder;
      }

      function fillDropdown(dropdown, list, placeholder = "Chọn") {
        const panel = dropdown.querySelector(".custom-dropdown-panel");

        // Lưu giá trị hiện tại để kiểm tra xem có còn trong danh sách mới không
        const currentValue = getDropdownValue(dropdown);
        let currentValueExists = false;

        panel.innerHTML = "";
        dropdown.dataset.placeholder = placeholder;

        (list || []).forEach((item) => {
          const opt = document.createElement("button");
          opt.type = "button";
          opt.className = "custom-dropdown-option";
          const value = String(item.code || item.value || item);
          const text = item.name || item.label || String(item);

          // Kiểm tra xem giá trị hiện tại có trong danh sách mới không
          if (currentValue && value === currentValue) {
            currentValueExists = true;
          }

          opt.dataset.value = value;
          opt.textContent = text;

          opt.addEventListener("click", () => {
            setDropdownValue(dropdown, value, text);
            dropdown.classList.remove("open");

            // Trigger change event for compatibility
            const event = new Event("change", { bubbles: true });
            dropdown.dispatchEvent(event);
          });

          panel.appendChild(opt);
        });

        // Nếu giá trị hiện tại không còn trong danh sách mới, hoặc không có giá trị, thì reset về placeholder
        if (!currentValue || !currentValueExists) {
          setDropdownValue(dropdown, "", "");
        }
      }

      function addDropdownOption(dropdown, value, text) {
        const panel = dropdown.querySelector(".custom-dropdown-panel");
        const opt = document.createElement("button");
        opt.type = "button";
        opt.className = "custom-dropdown-option";
        opt.dataset.value = String(value);
        opt.textContent = text;

        opt.addEventListener("click", () => {
          setDropdownValue(dropdown, String(value), text);
          dropdown.classList.remove("open");

          const event = new Event("change", { bubbles: true });
          dropdown.dispatchEvent(event);
        });

        panel.appendChild(opt);
      }

      // ======= ADMINISTRATIVE DROPDOWN (với search) =======
      function createAdministrativeDropdown(
        fieldId,
        placeholder = "Chọn",
        searchPlaceholder = "Tìm kiếm..."
      ) {
        const dropdown = document.createElement("div");
        dropdown.className = "custom-dropdown admin-dropdown";
        dropdown.id = fieldId;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "custom-dropdown-button";

        const textSpan = document.createElement("span");
        textSpan.className = "dropdown-text placeholder";
        textSpan.textContent = placeholder;
        button.appendChild(textSpan);

        const arrowSvg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        arrowSvg.setAttribute("class", "dropdown-arrow");
        arrowSvg.setAttribute("width", "12");
        arrowSvg.setAttribute("height", "12");
        arrowSvg.setAttribute("viewBox", "0 0 12 12");
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute("fill", "#6b7280");
        path.setAttribute("d", "M6 9L1 4h10z");
        arrowSvg.appendChild(path);
        button.appendChild(arrowSvg);

        // Panel với search
        const panel = document.createElement("div");
        panel.className = "admin-dropdown-panel";

        // Search container (sticky)
        const searchContainer = document.createElement("div");
        searchContainer.className = "admin-dropdown-search";
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = searchPlaceholder;
        searchInput.id = `${fieldId}_search`;
        searchContainer.appendChild(searchInput);
        panel.appendChild(searchContainer);

        // Options container (scrollable)
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "admin-dropdown-options";
        panel.appendChild(optionsContainer);

        dropdown.appendChild(button);
        dropdown.appendChild(panel);

        // Click handler
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          if (dropdown.classList.contains("disabled") || button.disabled) return;
          const isOpen = dropdown.classList.contains("open");
          closeAllDropdowns();
          if (!isOpen) {
            dropdown.classList.add("open");
            // Focus vào search input khi mở
            setTimeout(() => {
              searchInput.focus();
            }, 100);
          }
        });

        // Search handler
        searchInput.addEventListener("input", (e) => {
          filterAdminDropdownOptions(dropdown, e.target.value);
        });

        // Prevent panel close when clicking on search
        searchContainer.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        return dropdown;
      }

      function setAdminDropdownValue(dropdown, value, text) {
        const button = dropdown.querySelector(".custom-dropdown-button");
        const textSpan = button.querySelector(".dropdown-text");
        // Kiểm tra value và text một cách rõ ràng hơn (value có thể là "0" nên cần check !== "")
        if (value !== undefined && value !== null && value !== "" && text) {
          textSpan.textContent = text;
          textSpan.classList.remove("placeholder");
          dropdown.dataset.value = value;
        } else {
          textSpan.textContent = dropdown.dataset.placeholder || "Chọn";
          textSpan.classList.add("placeholder");
          dropdown.dataset.value = "";
        }
        // Update selected state
        dropdown.querySelectorAll(".admin-dropdown-option").forEach((opt) => {
          opt.classList.toggle("selected", opt.dataset.value === value);
        });
      }

      function getAdminDropdownValue(dropdown) {
        return dropdown.dataset.value || "";
      }

      function getAdminDropdownLabel(dropdown) {
        if (!getAdminDropdownValue(dropdown)) return "";
        const textSpan = dropdown.querySelector(".dropdown-text");
        return textSpan ? textSpan.textContent.trim() : "";
      }

      function fillAdminDropdown(dropdown, list, placeholder = "Chọn") {
        const optionsContainer = dropdown.querySelector(
          ".admin-dropdown-options"
        );
        const searchInput = dropdown.querySelector(
          ".admin-dropdown-search input"
        );

        // Lưu giá trị hiện tại để kiểm tra xem có còn trong danh sách mới không
        const currentValue = getAdminDropdownValue(dropdown);
        let currentValueExists = false;

        optionsContainer.innerHTML = "";
        dropdown.dataset.placeholder = placeholder;

        // Check nếu là province dropdown để loại bỏ "Tỉnh " ở đầu
        const isProvince = dropdown.id === "province";

        // Sắp xếp danh sách từ A-Z nếu là province dropdown
        let sortedList = list || [];
        if (isProvince && sortedList.length > 0) {
          sortedList = [...sortedList].sort((a, b) => {
            let textA = a.name || a.label || String(a);
            let textB = b.name || b.label || String(b);
            // Loại bỏ "Tỉnh " ở đầu để sắp xếp
            if (textA.startsWith("Tỉnh ")) {
              textA = textA.substring(5);
            }
            if (textB.startsWith("Tỉnh ")) {
              textB = textB.substring(5);
            }
            return textA.localeCompare(textB, "vi");
          });
        }

        sortedList.forEach((item) => {
          const opt = document.createElement("button");
          opt.type = "button";
          opt.className = "admin-dropdown-option";
          const value = String(item.code || item.value || item);
          let text = item.name || item.label || String(item);

          // Kiểm tra xem giá trị hiện tại có trong danh sách mới không
          if (currentValue && value === currentValue) {
            currentValueExists = true;
          }

          // Loại bỏ "Tỉnh " ở đầu nếu là province dropdown
          let displayText = text;
          if (isProvince && text.startsWith("Tỉnh ")) {
            displayText = text.substring(5); // Loại bỏ "Tỉnh " (5 ký tự)
          }

          opt.dataset.value = value;
          opt.dataset.text = text; // Lưu text gốc để filter (bao gồm cả "Tỉnh ")
          opt.dataset.displayText = displayText; // Lưu text hiển thị
          opt.textContent = displayText;

          opt.addEventListener("click", () => {
            // Dùng displayText để hiển thị trong button
            setAdminDropdownValue(dropdown, value, displayText);
            dropdown.classList.remove("open");

            // Clear search input
            if (searchInput) {
              searchInput.value = "";
              filterAdminDropdownOptions(dropdown, "");
            }

            // Trigger change event
            const event = new Event("change", { bubbles: true });
            dropdown.dispatchEvent(event);
          });

          optionsContainer.appendChild(opt);
        });

        // Nếu giá trị hiện tại không còn trong danh sách mới, hoặc không có giá trị, thì reset về placeholder
        if (!currentValue || !currentValueExists) {
          setAdminDropdownValue(dropdown, "", "");
        }
      }

      function setAdminDropdownDisabled(dropdown, disabled) {
        if (!dropdown) return;
        dropdown.classList.toggle("disabled", disabled);
        if (disabled) dropdown.classList.remove("open");
        const button = dropdown.querySelector(".custom-dropdown-button");
        if (button) button.disabled = disabled;
      }

      function clearAdminDropdown(dropdown, placeholder = "Chọn") {
        const optionsContainer = dropdown.querySelector(
          ".admin-dropdown-options"
        );
        const searchInput = dropdown.querySelector(
          ".admin-dropdown-search input"
        );

        optionsContainer.innerHTML = "";
        setAdminDropdownValue(dropdown, "", "");
        dropdown.dataset.placeholder = placeholder;

        if (searchInput) {
          searchInput.value = "";
        }
      }

      function foldVietnamese(value) {
        return String(value || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/đ/g, "d");
      }

      function filterAdminDropdownOptions(dropdown, searchText) {
        const optionsContainer = dropdown.querySelector(
          ".admin-dropdown-options"
        );
        if (!optionsContainer) return;

        const options = optionsContainer.querySelectorAll(
          ".admin-dropdown-option"
        );
        const query = foldVietnamese(searchText).trim();
        const queryCompact = query.replace(/\s+/g, "");

        options.forEach((opt) => {
          if (!query) {
            opt.style.display = "";
            return;
          }
          const folded = foldVietnamese(
            `${opt.dataset.text || ""} ${opt.dataset.displayText || ""} ${opt.textContent || ""}`
          );
          const matched =
            folded.includes(query) ||
            folded.replace(/\s+/g, "").includes(queryCompact);
          opt.style.display = matched ? "" : "none";
        });
      }

      function isBasicFieldVisible(id, field) {
        if (!field) return false;
        if (id === "full_name") return true;
        return field.visible !== false;
      }

      function setStatus(msg, color = "#64748b") {
        const statusEl = $("status");
        if (statusEl) {
          // Nếu color là CSS variable, lấy giá trị từ computed style
          if (color.startsWith("var(")) {
            const root = getComputedStyle(document.documentElement);
            const varName = color.match(/var\(--([^)]+)\)/)?.[1];
            if (varName) {
              color = root.getPropertyValue(`--${varName}`).trim() || color;
            }
          }
          statusEl.style.color = color;
          statusEl.textContent = msg || "";
        }
      }

      function showError(message) {
        const errorEl = $("errorMessage");
        if (errorEl) {
          errorEl.textContent = message;
          errorEl.style.display = "block";
        }
      }

      function hideError() {
        const errorEl = $("errorMessage");
        if (errorEl) {
          errorEl.style.display = "none";
        }
      }

      // ======= FORM RENDERING =======
      function createFieldElement(fieldId, fieldConfig, sectionTitle = null) {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "field";

        const label = document.createElement("label");
        label.setAttribute("for", fieldId);
        // Thêm data attribute để dễ tìm label chính cho checkbox/radio
        if (fieldConfig.type === "checkbox" || fieldConfig.type === "radio") {
          label.dataset.fieldMainLabel = "true";
        }
        // Thêm text hướng dẫn cho checkbox với style in nghiêng
        if (fieldConfig.type === "checkbox") {
          label.innerHTML =
            fieldConfig.label +
            ' <span class="checkbox-hint">(Chọn một hoặc nhiều)</span>';
        } else {
          label.textContent = fieldConfig.label;
        }
        if (fieldConfig.required) {
          label.classList.add("required");
        }
        fieldDiv.appendChild(label);

        // Thêm thông báo lỗi ngay sau label nếu field bắt buộc (cho checkbox/radio)
        let errorMsg = null;
        if (
          fieldConfig.required &&
          (fieldConfig.type === "checkbox" || fieldConfig.type === "radio")
        ) {
          errorMsg = document.createElement("div");
          errorMsg.className = "field-error";
          errorMsg.textContent = "Vui lòng chọn, không bỏ trống";
          fieldDiv.appendChild(errorMsg);
        }

        let input;
        if (
          fieldConfig.type === "select" &&
          fieldConfig.source === "administrative"
        ) {
          // Administrative unit dropdown - dùng component riêng cho tất cả (có search)
          if (fieldId === "province") {
            input = createAdministrativeDropdown(
              fieldId,
              "Chọn",
              "Tìm kiếm tỉnh/thành phố..."
            );
            input.dataset.required = fieldConfig.required || false;
            clearAdminDropdown(input);
          } else if (fieldId === "district") {
            input = createAdministrativeDropdown(
              fieldId,
              "Chọn",
              "Tìm kiếm quận/huyện..."
            );
            input.dataset.required = fieldConfig.required || false;
            clearAdminDropdown(input);
          } else if (fieldId === "ward") {
            input = createAdministrativeDropdown(
              fieldId,
              "Chọn",
              "Tìm kiếm phường/xã..."
            );
            input.dataset.required = fieldConfig.required || false;
            clearAdminDropdown(input);
          } else {
            // Fallback cho các field khác
            input = createCustomDropdown(fieldId, "Chọn");
            input.dataset.required = fieldConfig.required || false;
            clearDropdown(input);
          }
          fieldDiv.appendChild(input);
        } else if (fieldConfig.type === "select" && fieldConfig.options) {
          // Custom select với options
          input = createCustomDropdown(
            fieldId,
            fieldConfig.placeholder || "Chọn"
          );
          input.dataset.required = fieldConfig.required || false;
          clearDropdown(input, fieldConfig.placeholder || "Chọn");

          // Thêm các options (hỗ trợ cả object và string)
          (fieldConfig.options || []).forEach((option) => {
            let optionValue, optionText;
            if (typeof option === "object" && option !== null) {
              optionValue =
                option.value !== undefined
                  ? String(option.value)
                  : String(option);
              optionText =
                option.label !== undefined ? String(option.label) : optionValue;
            } else {
              optionValue = String(option);
              optionText = optionValue;
            }
            addDropdownOption(input, optionValue, optionText);
          });
          fieldDiv.appendChild(input);
        } else if (fieldConfig.type === "checkbox" && fieldConfig.options) {
          // Checkbox group
          fieldDiv.classList.add("field-checkbox-radio"); // Thêm class riêng
          const optionsContainer = document.createElement("div");
          optionsContainer.className = "field-options";
          optionsContainer.dataset.fieldId = fieldId;

          (fieldConfig.options || []).forEach((option, index) => {
            const optionDiv = document.createElement("div");
            optionDiv.className = "field-option";

            // Xử lý option: nếu là object thì lấy label hoặc value, nếu là string thì dùng trực tiếp
            let optionValue, optionText;
            if (typeof option === "object" && option !== null) {
              optionValue =
                option.value !== undefined
                  ? String(option.value)
                  : String(option);
              optionText =
                option.label !== undefined ? String(option.label) : optionValue;
            } else {
              optionValue = String(option);
              optionText = optionValue;
            }

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `${fieldId}_${index}`;
            checkbox.name = fieldId;
            checkbox.value = optionValue;
            checkbox.dataset.required = fieldConfig.required || false;

            const optionLabel = document.createElement("label");
            optionLabel.setAttribute("for", `${fieldId}_${index}`);
            optionLabel.textContent = optionText;

            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(optionLabel);
            optionsContainer.appendChild(optionDiv);
          });

          fieldDiv.appendChild(optionsContainer);
          input = optionsContainer; // Use container as input reference
        } else if (fieldConfig.type === "radio" && fieldConfig.options) {
          // Radio group
          fieldDiv.classList.add("field-checkbox-radio"); // Thêm class riêng
          const optionsContainer = document.createElement("div");
          optionsContainer.className = "field-options";
          optionsContainer.dataset.fieldId = fieldId;

          (fieldConfig.options || []).forEach((option, index) => {
            const optionDiv = document.createElement("div");
            optionDiv.className = "field-option";

            // Xử lý option: nếu là object thì lấy label hoặc value, nếu là string thì dùng trực tiếp
            let optionValue, optionText;
            if (typeof option === "object" && option !== null) {
              optionValue =
                option.value !== undefined
                  ? String(option.value)
                  : String(option);
              optionText =
                option.label !== undefined ? String(option.label) : optionValue;
            } else {
              optionValue = String(option);
              optionText = optionValue;
            }

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.id = `${fieldId}_${index}`;
            radio.name = fieldId;
            radio.value = optionValue;
            radio.dataset.required = fieldConfig.required || false;

            const optionLabel = document.createElement("label");
            optionLabel.setAttribute("for", `${fieldId}_${index}`);
            optionLabel.textContent = optionText;

            optionDiv.appendChild(radio);
            optionDiv.appendChild(optionLabel);
            optionsContainer.appendChild(optionDiv);
          });

          fieldDiv.appendChild(optionsContainer);
          input = optionsContainer; // Use container as input reference
        } else if (fieldConfig.type === "textarea") {
          input = document.createElement("textarea");
          input.id = fieldId;
          input.rows = fieldConfig.rows || 3;
          input.required = fieldConfig.required || false;
          if (fieldConfig.placeholder)
            input.placeholder = fieldConfig.placeholder;
          fieldDiv.appendChild(input);
        } else {
          input = document.createElement("input");
          input.id = fieldId;
          input.type = fieldConfig.type || "text";
          input.required = fieldConfig.required || false;
          if (fieldConfig.placeholder)
            input.placeholder = fieldConfig.placeholder;
          // Chỉ cho phép nhập số cho phone
          if (fieldConfig.type === "tel" || fieldId === "phone") {
            input.pattern = "[0-9]*";
            input.inputMode = "numeric";
            input.addEventListener("input", function (e) {
              // Chỉ cho phép số
              this.value = this.value.replace(/[^0-9]/g, "");
            });
          }
          fieldDiv.appendChild(input);
        }

        // Thêm thông báo lỗi nếu field bắt buộc (cho các field khác, không phải checkbox/radio)
        if (
          fieldConfig.required &&
          fieldConfig.type !== "checkbox" &&
          fieldConfig.type !== "radio"
        ) {
          const errorMsg = document.createElement("div");
          errorMsg.className = "field-error";
          // Xác định loại thông báo dựa trên loại field
          if (fieldConfig.type === "select") {
            errorMsg.textContent = "Vui lòng chọn, không bỏ trống";
          } else {
            errorMsg.textContent = "Vui lòng điền, không bỏ trống";
          }
          fieldDiv.appendChild(errorMsg);
        }

        // Wrap in section if needed
        if (sectionTitle) {
          const sectionDiv = document.createElement("div");
          const sectionTitleEl = document.createElement("div");
          sectionTitleEl.className = "form-title";
          sectionTitleEl.textContent = sectionTitle;
          sectionDiv.appendChild(sectionTitleEl);
          sectionDiv.appendChild(fieldDiv);
          return sectionDiv;
        }

        return fieldDiv;
      }

      function renderForm() {
        const formFieldsEl = $("formFields");
        if (!formFieldsEl || !CAMPAIGN_CONFIG) return;

        formFieldsEl.innerHTML = "";

        const fields = CAMPAIGN_CONFIG.fields;
        const mandatory = fields.mandatory || {};
        // Custom fields được render riêng trong renderCustomFieldsCards()

        // Render mandatory fields
        let currentSection = null;

        // Basic info section
        const basicSection = document.createElement("div");
        const basicTitle = document.createElement("div");
        basicTitle.className = "form-title";
        basicTitle.textContent = "Thông tin cơ bản";
        basicSection.appendChild(basicTitle);

        if (isBasicFieldVisible("full_name", mandatory.full_name)) {
          basicSection.appendChild(
            createFieldElement("full_name", mandatory.full_name)
          );
        }
        if (isBasicFieldVisible("phone", mandatory.phone)) {
          basicSection.appendChild(createFieldElement("phone", mandatory.phone));
        }
        formFieldsEl.appendChild(basicSection);

        const addressSection = document.createElement("div");

        const adminRow1 = document.createElement("div");
        adminRow1.className = "row";
        if (isBasicFieldVisible("province", mandatory.province)) {
          adminRow1.appendChild(
            createFieldElement("province", mandatory.province)
          );
        }
        if (isBasicFieldVisible("district", mandatory.district)) {
          adminRow1.appendChild(
            createFieldElement("district", mandatory.district)
          );
        } else if (isBasicFieldVisible("ward", mandatory.ward)) {
          adminRow1.appendChild(createFieldElement("ward", mandatory.ward));
        }
        if (adminRow1.childElementCount) addressSection.appendChild(adminRow1);

        const adminRow2 = document.createElement("div");
        adminRow2.className = "row";
        if (
          isBasicFieldVisible("district", mandatory.district) &&
          isBasicFieldVisible("ward", mandatory.ward)
        ) {
          adminRow2.appendChild(createFieldElement("ward", mandatory.ward));
        }
        if (isBasicFieldVisible("hamlet", mandatory.hamlet)) {
          adminRow2.appendChild(createFieldElement("hamlet", mandatory.hamlet));
        }
        if (adminRow2.childElementCount) addressSection.appendChild(adminRow2);

        const addressRow = document.createElement("div");
        addressRow.className = "row";
        if (isBasicFieldVisible("street", mandatory.street)) {
          addressRow.appendChild(createFieldElement("street", mandatory.street));
        }
        if (isBasicFieldVisible("house_number", mandatory.house_number)) {
          addressRow.appendChild(
            createFieldElement("house_number", mandatory.house_number)
          );
        }
        if (addressRow.childElementCount) addressSection.appendChild(addressRow);

        formFieldsEl.appendChild(addressSection);

        // Setup administrative unit dropdowns
        setupAdministrativeDropdowns();

        // Render custom fields thành các card riêng
        renderCustomFieldsCards();

        // Setup real-time validation - xóa error khi user thay đổi
        setupRealTimeValidation();
      }

      // Hàm xóa error cho một field cụ thể
      function clearFieldError(fieldId, fieldType) {
        if (fieldType === "checkbox" || fieldType === "radio") {
          // Xử lý checkbox/radio
          const optionsContainer = document.querySelector(
            `.field-options[data-field-id="${fieldId}"]`
          );
          if (optionsContainer) {
            const fieldDiv = optionsContainer.closest(".field");
            if (fieldDiv) {
              // Xóa error từ inputs
              optionsContainer
                .querySelectorAll('input[type="checkbox"], input[type="radio"]')
                .forEach((input) => {
                  input.classList.remove("error");
                });
              // Xóa error từ label chính
              let mainLabel = fieldDiv.querySelector(
                'label[data-field-main-label="true"]'
              );
              if (!mainLabel) {
                mainLabel = fieldDiv.querySelector("label:first-of-type");
              }
              if (mainLabel && !mainLabel.closest(".field-option")) {
                mainLabel.classList.remove("error-label");
                mainLabel.style.color = "";
                mainLabel.style.fontWeight = "";
              }
              // Xóa error từ field container
              fieldDiv.classList.remove("error");
            }
          }
        } else {
          // Xử lý các field thông thường
          const el = $(fieldId);
          if (!el) return;
          const fieldDiv = el.closest(".field");
          if (!fieldDiv) return;

          // Xóa error từ input
          if (el.classList.contains("custom-dropdown")) {
            const button = el.querySelector(".custom-dropdown-button");
            if (button) button.classList.remove("error");
          } else {
            el.classList.remove("error");
          }
          // Xóa error từ label
          const label = el.previousElementSibling;
          if (label && label.tagName === "LABEL") {
            label.classList.remove("error-label");
          }
          // Xóa error từ field container
          fieldDiv.classList.remove("error");
        }
      }

      // Setup real-time validation - xóa error khi user thay đổi
      function setupRealTimeValidation() {
        // Xử lý các input thông thường
        document
          .querySelectorAll(
            'input[type="text"], input[type="tel"], input[type="number"], textarea'
          )
          .forEach((input) => {
            input.addEventListener("input", function () {
              const fieldId = this.id;
              const fieldDiv = this.closest(".field");
              if (fieldDiv && fieldDiv.classList.contains("error")) {
                clearFieldError(fieldId, this.type || "text");
              }
            });
          });

        // Xử lý custom dropdown - listen vào change event (được dispatch khi chọn option)
        document.querySelectorAll(".custom-dropdown").forEach((dropdown) => {
          const fieldId = dropdown.id;
          dropdown.addEventListener("change", function () {
            const fieldDiv = dropdown.closest(".field");
            if (fieldDiv && fieldDiv.classList.contains("error")) {
              // Kiểm tra xem có giá trị được chọn không
              let hasValue = false;
              if (dropdown.classList.contains("admin-dropdown")) {
                hasValue = !!getAdminDropdownValue(dropdown);
              } else {
                hasValue = !!getDropdownValue(dropdown);
              }
              // Chỉ clear error nếu có giá trị được chọn
              if (hasValue) {
                clearFieldError(fieldId, "select");
              }
            }
          });
        });

        // Xử lý checkbox và radio
        document
          .querySelectorAll(".field-options")
          .forEach((optionsContainer) => {
            const fieldId = optionsContainer.dataset.fieldId;
            if (fieldId) {
              optionsContainer
                .querySelectorAll('input[type="checkbox"], input[type="radio"]')
                .forEach((input) => {
                  input.addEventListener("change", function () {
                    const fieldDiv = optionsContainer.closest(".field");
                    if (fieldDiv && fieldDiv.classList.contains("error")) {
                      // Kiểm tra xem có ít nhất một option được chọn không
                      const checkedInputs = optionsContainer.querySelectorAll(
                        'input[type="checkbox"]:checked, input[type="radio"]:checked'
                      );
                      if (checkedInputs.length > 0) {
                        clearFieldError(fieldId, this.type);
                      }
                    }
                  });
                });
            }
          });
      }

      function renderCustomFieldsCards() {
        const customFieldsCardsEl = $("customFieldsCards");
        if (!customFieldsCardsEl || !CAMPAIGN_CONFIG) return;

        customFieldsCardsEl.innerHTML = "";

        // Cấu trúc: custom là array các section, mỗi section có title và fields
        const custom = CAMPAIGN_CONFIG.fields.custom || [];

        if (custom.length === 0) return;

        // Tạo một card riêng cho mỗi section
        custom.forEach((section) => {
          const title = section.title || "Thông tin đăng ký";
          const fields = section.fields || [];
          if (fields.length === 0) return;

          // Tạo card container
          const card = document.createElement("div");
          card.className = "card";

          // Tạo tiêu đề section
          const sectionTitleEl = document.createElement("div");
          sectionTitleEl.className = "form-title";
          sectionTitleEl.textContent = title;
          card.appendChild(sectionTitleEl);

          // Tạo container cho các fields trong section này
          const fieldsContainer = document.createElement("div");

          fields.forEach((field) => {
            fieldsContainer.appendChild(createFieldElement(field.id, field));
          });

          card.appendChild(fieldsContainer);
          customFieldsCardsEl.appendChild(card);
        });
      }

      function resetChildAdminDropdown(dropdown) {
        if (!dropdown) return;
        if (dropdown.classList.contains("admin-dropdown")) {
          clearAdminDropdown(dropdown);
        } else {
          clearDropdown(dropdown);
        }
        setAdminDropdownDisabled(dropdown, true);
      }

      async function setupAdministrativeDropdowns() {
        const provinceEl = $("province");
        const districtEl = $("district");
        const wardEl = $("ward");
        if (!provinceEl) return;

        resetChildAdminDropdown(districtEl);
        resetChildAdminDropdown(wardEl);

        let provinces = [];
        try {
          provinces = await loadProvinces();
        } catch (err) {
          console.error(err);
          setStatus(
            err?.message || "Không tải được danh sách tỉnh/thành phố.",
            "var(--danger)"
          );
        }

        if (provinceEl.classList.contains("admin-dropdown")) {
          fillAdminDropdown(provinceEl, provinces);
        } else {
          fillDropdown(provinceEl, provinces);
        }

        let districtRequest = 0;
        let wardRequest = 0;

        provinceEl.addEventListener("change", async () => {
          const provinceValue = provinceEl.classList.contains("admin-dropdown")
            ? getAdminDropdownValue(provinceEl)
            : getDropdownValue(provinceEl);
          const requestId = ++districtRequest;
          wardRequest += 1;

          resetChildAdminDropdown(districtEl);
          resetChildAdminDropdown(wardEl);
          if (!provinceValue || !districtEl) return;

          clearAdminDropdown(districtEl, "Đang tải...");
          try {
            const districts = await loadDistricts(provinceValue);
            if (requestId !== districtRequest) return;
            fillAdminDropdown(districtEl, districts);
            setAdminDropdownDisabled(districtEl, false);
          } catch (err) {
            console.error(err);
            if (requestId !== districtRequest) return;
            clearAdminDropdown(districtEl);
            setAdminDropdownDisabled(districtEl, true);
            setStatus(
              err?.message || "Không tải được danh sách huyện.",
              "var(--danger)"
            );
          }
        });

        if (!districtEl || !wardEl) return;

        districtEl.addEventListener("change", async () => {
          const districtValue = districtEl.classList.contains("admin-dropdown")
            ? getAdminDropdownValue(districtEl)
            : getDropdownValue(districtEl);
          const requestId = ++wardRequest;

          resetChildAdminDropdown(wardEl);
          if (!districtValue) return;

          clearAdminDropdown(wardEl, "Đang tải...");
          try {
            const wards = await loadWards(districtValue);
            if (requestId !== wardRequest) return;
            fillAdminDropdown(wardEl, wards);
            setAdminDropdownDisabled(wardEl, false);
          } catch (err) {
            console.error(err);
            if (requestId !== wardRequest) return;
            clearAdminDropdown(wardEl);
            setAdminDropdownDisabled(wardEl, true);
            setStatus(
              err?.message || "Không tải được danh sách xã/phường.",
              "var(--danger)"
            );
          }
        });
      }

      // ======= VALIDATION =======
      function markRequiredError(fieldIds) {
        let first = null;
        fieldIds.forEach((id) => {
          const el = $(id);
          if (!el) return; // Skip nếu không tìm thấy (có thể là checkbox/radio được xử lý riêng)
          const fieldDiv = el.closest(".field");
          const label = el.previousElementSibling;

          // Check if it's a custom dropdown
          let isEmpty;
          let targetEl = el;

          if (el.classList.contains("custom-dropdown")) {
            // Custom dropdown - XỬ LÝ RIÊNG
            // Check nếu là admin dropdown (có search)
            if (el.classList.contains("admin-dropdown")) {
              isEmpty = !getAdminDropdownValue(el);
            } else {
              isEmpty = !getDropdownValue(el);
            }
            targetEl = el.querySelector(".custom-dropdown-button");

            // Apply error styles
            if (targetEl) {
              targetEl.classList.toggle("error", isEmpty);
            }
            if (fieldDiv) {
              fieldDiv.classList.toggle("error", isEmpty);
            }

            // Apply error to label
            if (label && label.tagName === "LABEL") {
              label.classList.toggle("error-label", isEmpty);
            }
          } else if (el.classList.contains("field-options")) {
            // Checkbox or radio group - XỬ LÝ RIÊNG HOÀN TOÀN
            const checkedInputs = el.querySelectorAll(
              'input[type="checkbox"]:checked, input[type="radio"]:checked'
            );
            isEmpty = checkedInputs.length === 0;

            // Apply error to all inputs in the group (chỉ border, không đỏ label)
            el.querySelectorAll(
              'input[type="checkbox"], input[type="radio"]'
            ).forEach((input) => {
              input.classList.toggle("error", isEmpty);
            });
            // KHÔNG apply error cho option labels - chỉ đỏ label chính
            el.querySelectorAll(".field-option label").forEach((optLabel) => {
              // Đảm bảo không có error-label class
              optLabel.classList.remove("error-label");
            });
            targetEl = el.querySelector(
              'input[type="checkbox"], input[type="radio"]'
            );

            // XỬ LÝ RIÊNG CHO LABEL CHÍNH CỦA CHECKBOX/RADIO - ĐẢM BẢO HOẠT ĐỘNG
            if (fieldDiv) {
              // Tìm label chính bằng data attribute hoặc first-of-type
              let mainLabel = fieldDiv.querySelector(
                'label[data-field-main-label="true"]'
              );
              if (!mainLabel) {
                mainLabel = fieldDiv.querySelector("label:first-of-type");
              }
              if (mainLabel) {
                // Kiểm tra chắc chắn không phải label trong field-option
                if (!mainLabel.closest(".field-option")) {
                  // Thêm class error-label trực tiếp - DÙNG add/remove để đảm bảo
                  if (isEmpty) {
                    mainLabel.classList.add("error-label");
                    // Force style để đảm bảo hiển thị - dùng getComputedStyle để lấy giá trị CSS variable
                    const root = document.documentElement;
                    const dangerColor =
                      getComputedStyle(root)
                        .getPropertyValue("--danger")
                        .trim() || "#ED3241";
                    mainLabel.style.color = dangerColor;
                    mainLabel.style.fontWeight = "600";
                  } else {
                    mainLabel.classList.remove("error-label");
                    mainLabel.style.color = "";
                    mainLabel.style.fontWeight = "";
                  }
                }
              }
              // Thêm class error cho field container - QUAN TRỌNG để CSS hoạt động
              if (isEmpty) {
                fieldDiv.classList.add("error");
              } else {
                fieldDiv.classList.remove("error");
              }
            }
          } else {
            // Regular input fields (text, textarea, number, etc.)
            isEmpty = !String(el.value || "").trim();
            targetEl = el;

            // Apply error styles
            if (targetEl) {
              targetEl.classList.toggle("error", isEmpty);
            }
            if (fieldDiv) {
              fieldDiv.classList.toggle("error", isEmpty);
            }

            // Apply error to label
            if (
              label &&
              label.tagName === "LABEL" &&
              !label.closest(".field-option")
            ) {
              label.classList.toggle("error-label", isEmpty);
            }
          }

          if (isEmpty && !first) {
            first = targetEl || el;
          }
        });
        if (first) {
          if (
            first.classList &&
            first.classList.contains("custom-dropdown-button")
          ) {
            first.focus();
          } else {
            first.focus();
          }
        }
        return !first;
      }

      // Hàm validate riêng cho checkbox/radio
      function validateCheckboxRadio(fieldId, fieldConfig) {
        // Tìm field-options container bằng data-field-id
        const optionsContainer = document.querySelector(
          `.field-options[data-field-id="${fieldId}"]`
        );
        if (!optionsContainer) {
          return false;
        }

        const fieldDiv = optionsContainer.closest(".field");
        if (!fieldDiv) {
          return false;
        }

        const checkedInputs = optionsContainer.querySelectorAll(
          'input[type="checkbox"]:checked, input[type="radio"]:checked'
        );
        const isEmpty = checkedInputs.length === 0;

        // Apply error to all inputs in the group (chỉ border, không đỏ label)
        optionsContainer
          .querySelectorAll('input[type="checkbox"], input[type="radio"]')
          .forEach((input) => {
            input.classList.toggle("error", isEmpty);
          });
        // KHÔNG apply error cho option labels - chỉ đỏ label chính
        optionsContainer
          .querySelectorAll(".field-option label")
          .forEach((optLabel) => {
            // Đảm bảo không có error-label class
            optLabel.classList.remove("error-label");
          });

        // Tìm và apply error cho label chính
        let mainLabel = fieldDiv.querySelector(
          'label[data-field-main-label="true"]'
        );
        if (!mainLabel) {
          mainLabel = fieldDiv.querySelector("label:first-of-type");
        }

        if (mainLabel && !mainLabel.closest(".field-option")) {
          if (isEmpty) {
            mainLabel.classList.add("error-label");
            const root = document.documentElement;
            const dangerColor =
              getComputedStyle(root).getPropertyValue("--danger").trim() ||
              "#ED3241";
            mainLabel.style.color = dangerColor;
            mainLabel.style.fontWeight = "600";
          } else {
            mainLabel.classList.remove("error-label");
            mainLabel.style.color = "";
            mainLabel.style.fontWeight = "";
          }
        }

        // Thêm class error cho field container
        if (isEmpty) {
          fieldDiv.classList.add("error");
        } else {
          fieldDiv.classList.remove("error");
        }

        return !isEmpty; // Return true nếu valid (có chọn), false nếu invalid (chưa chọn)
      }

      function validateForm() {
        const requiredFields = [];
        const checkboxRadioFields = []; // Tách riêng checkbox/radio
        const mandatory = CAMPAIGN_CONFIG.fields.mandatory || {};
        const custom = CAMPAIGN_CONFIG.fields.custom || [];

        Object.keys(mandatory).forEach((id) => {
          const field = mandatory[id];
          if (!isBasicFieldVisible(id, field)) return;
          if (id === "full_name" || field.required) {
            requiredFields.push(id);
          }
        });

        // Duyệt qua tất cả sections và fields trong custom (cấu trúc: array với title và fields)
        custom.forEach((section) => {
          const fields = section.fields || [];
          fields.forEach((field) => {
            if (field.required) {
              // Tách checkbox/radio ra riêng
              if (field.type === "checkbox" || field.type === "radio") {
                checkboxRadioFields.push({ id: field.id, config: field });
              } else {
                requiredFields.push(field.id);
              }
            }
          });
        });

        // Validate các field thông thường
        const regularFieldsValid = markRequiredError(requiredFields);

        // Validate checkbox/radio riêng
        let checkboxRadioValid = true;
        checkboxRadioFields.forEach(({ id, config }) => {
          const isValid = validateCheckboxRadio(id, config);
          if (!isValid) {
            checkboxRadioValid = false;
          }
        });

        return regularFieldsValid && checkboxRadioValid;
      }

      // ======= SUBMISSION =======
      function collectFormData() {
        const data = {
          campaign_id: CAMPAIGN.id || "default",
        };

        // Collect mandatory fields
        Object.keys(CAMPAIGN_CONFIG.fields.mandatory).forEach((id) => {
          const el = $(id);
          if (!el) return;

          if (id === "province" || id === "district" || id === "ward") {
            const isAdmin = el.classList.contains("admin-dropdown");
            const value = isAdmin
              ? getAdminDropdownValue(el)
              : getDropdownValue(el);
            const label = isAdmin
              ? getAdminDropdownLabel(el)
              : getDropdownLabel(el);

            data[id] = label;
            if (value) data[id + "_code"] = value;
          } else {
            // Regular input
            if (el.classList && el.classList.contains("custom-dropdown")) {
              data[id] = getDropdownValue(el);
            } else {
              data[id] = el.value.trim();
            }
          }
        });

        // Collect custom fields (cấu trúc: array với title và fields)
        const custom = CAMPAIGN_CONFIG.fields.custom || [];
        custom.forEach((section) => {
          const fields = section.fields || [];
          fields.forEach((field) => {
            // Tìm element - checkbox/radio dùng container với data-field-id
            let el = $(field.id);
            if (!el && (field.type === "checkbox" || field.type === "radio")) {
              // Tìm container bằng data-field-id
              el = document.querySelector(
                `.field-options[data-field-id="${field.id}"]`
              );
            }

            if (el) {
              if (el.classList && el.classList.contains("custom-dropdown")) {
                data[field.id] = getDropdownValue(el);
              } else if (
                el.classList &&
                el.classList.contains("field-options")
              ) {
                // Checkbox or radio group
                if (field.type === "checkbox") {
                  // Checkbox: collect all checked values
                  const checkedInputs = el.querySelectorAll(
                    'input[type="checkbox"]:checked'
                  );
                  data[field.id] = Array.from(checkedInputs)
                    .map((input) => input.value)
                    .join(", ");
                } else if (field.type === "radio") {
                  // Radio: get the checked value
                  const checkedInput = el.querySelector(
                    'input[type="radio"]:checked'
                  );
                  data[field.id] = checkedInput ? checkedInput.value : "";
                }
              } else {
                data[field.id] = el.value.trim();
              }
            }
          });
        });

        // Add metadata if enabled
        if (CAMPAIGN_CONFIG.config.showReferralInfo) {
          data.referral = document.referrer || "";
        }
        if (CAMPAIGN_CONFIG.config.showDeviceInfo) {
          data.device = navigator.userAgent || "N/A";
        }
        // IP address sẽ được thêm trong handleSubmit() sau khi lấy từ API

        return data;
      }

      // Lấy IP address từ API
      async function getUserIP() {
        try {
          // Dùng ipify.org - API miễn phí, đơn giản
          const response = await fetch("https://api.ipify.org?format=json");
          const data = await response.json();
          return data.ip || "N/A";
        } catch (err) {
          return "N/A";
        }
      }

      function renderReceipt(data, serverTimeISO) {
        const receiptEl = $("receipt");
        if (!receiptEl) return;

        const lines = [];

        // Mandatory fields
        Object.keys(CAMPAIGN_CONFIG.fields.mandatory).forEach((id) => {
          const field = CAMPAIGN_CONFIG.fields.mandatory[id];
          if (data[id]) {
            lines.push([field.label, data[id]]);
          }
        });

        // Custom fields (cấu trúc: array với title và fields)
        const custom = CAMPAIGN_CONFIG.fields.custom || [];
        custom.forEach((section) => {
          const fields = section.fields || [];
          fields.forEach((field) => {
            if (data[field.id]) {
              lines.push([field.label, data[field.id]]);
            }
          });
        });

        // Metadata - chỉ hiển thị thời gian, không hiển thị referral và device
        if (serverTimeISO) {
          lines.push([
            "Thời gian",
            new Date(serverTimeISO).toLocaleString("vi-VN"),
          ]);
        }

        receiptEl.innerHTML = `
        <ul class="clean">
          ${lines.map(([k, v]) => `<li><b>${k}:</b> ${v ?? ""}</li>`).join("")}
        </ul>
      `;

        // Render Zalo link section riêng nếu được bật
        const zaloConfig = CAMPAIGN_CONFIG.config?.zalo || {};
        if (zaloConfig.enabled !== false) {
          const zaloCard = $("zaloCard");
          const zaloTitle = $("zaloTitle");
          const zaloDescription = $("zaloDescription");
          const zaloLink = $("zaloLink");

          if (zaloCard) {
            if (zaloTitle) {
              zaloTitle.textContent = zaloConfig.title || "Tham gia nhóm Zalo";
            }
            if (zaloDescription) {
              zaloDescription.textContent =
                zaloConfig.description ||
                "Vui lòng tham gia nhóm Zalo để nhận được hỗ trợ tốt nhất.";
            }
            if (zaloLink) {
              // Chỉ hiển thị link nếu có trong config
              const linkUrl = zaloConfig.link;

              if (linkUrl) {
                zaloLink.innerHTML = `<strong>Link:</strong><br><a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline; word-break: break-all;">${linkUrl}</a>`;
              } else {
                zaloLink.innerHTML = "";
              }
            }
            zaloCard.style.display = "block";
          }
        } else {
          const zaloCard = $("zaloCard");
          if (zaloCard) {
            zaloCard.style.display = "none";
          }
        }

        // Render Call for Action section riêng nếu có và được bật
        const callForActionConfig = CAMPAIGN_CONFIG.config?.callForAction || {};
        if (callForActionConfig.enabled !== false) {
          const callForActionCard = $("callForActionCard");
          const callForActionTitle = $("callForActionTitle");
          const callForActionDescription = $("callForActionDescription");
          const callForActionLink = $("callForActionLink");

          if (callForActionCard) {
            if (callForActionTitle) {
              callForActionTitle.textContent =
                callForActionConfig.title || "Liên hệ tư vấn";
            }
            if (callForActionDescription) {
              callForActionDescription.textContent =
                callForActionConfig.description ||
                "Vui lòng liên hệ để được tư vấn và hỗ trợ tốt nhất.";
            }
            if (callForActionLink) {
              // Chỉ hiển thị link nếu có trong config
              const linkUrl = callForActionConfig.link;

              if (linkUrl) {
                callForActionLink.innerHTML = `<strong>Link:</strong><br><a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline; word-break: break-all;">${linkUrl}</a>`;
              } else {
                callForActionLink.innerHTML = "";
              }
            }
            callForActionCard.style.display = "block";
          }
        } else {
          const callForActionCard = $("callForActionCard");
          if (callForActionCard) {
            callForActionCard.style.display = "none";
          }
        }
      }

      function showResultCard() {
        $("formCard").style.display = "none";
        $("customFieldsCards").style.display = "none";
        $("submitCard").style.display = "none";
        $("resultCard").style.display = "block";
        const heroEl = $("campaignHero");
        if (heroEl) heroEl.style.display = "none";
        const infoCardEl = $("heroInfoCard");
        if (infoCardEl) infoCardEl.style.display = "none";
      }

      function showFormCard() {
        $("formCard").style.display = "block";
        $("customFieldsCards").style.display = "block";
        $("submitCard").style.display = "block";
        $("resultCard").style.display = "none";
        const heroEl = $("campaignHero");
        if (heroEl) heroEl.style.display = "";
        const infoCardEl = $("heroInfoCard");
        if (
          infoCardEl &&
          (CAMPAIGN_CONFIG?.metadata?.heroTitle ||
            CAMPAIGN_CONFIG?.metadata?.description)
        ) {
          infoCardEl.style.display = "block";
        }
        const zaloCard = $("zaloCard");
        if (zaloCard) zaloCard.style.display = "none";
        const callForActionCard = $("callForActionCard");
        if (callForActionCard) callForActionCard.style.display = "none";
      }

      function resetForm() {
        // Reset all fields
        Object.keys(CAMPAIGN_CONFIG.fields.mandatory).forEach((id) => {
          // Tìm element - checkbox/radio dùng container với data-field-id
          let el = $(id);
          const fieldConfig = CAMPAIGN_CONFIG.fields.mandatory[id];
          if (
            !el &&
            fieldConfig &&
            (fieldConfig.type === "checkbox" || fieldConfig.type === "radio")
          ) {
            // Tìm container bằng data-field-id
            el = document.querySelector(
              `.field-options[data-field-id="${id}"]`
            );
          }

          if (!el) return;

          if (id === "province" || id === "district" || id === "ward") {
            if (el.classList.contains("admin-dropdown")) {
              // Dùng admin dropdown functions
              clearAdminDropdown(el);
              if (id === "province") {
                loadProvinces()
                  .then((provinces) => fillAdminDropdown(el, provinces))
                  .catch((err) => console.error(err));
              } else {
                setAdminDropdownDisabled(el, true);
              }
            } else {
              // Fallback cho dropdown thông thường
              clearDropdown(el);
              if (id === "province") {
                loadProvinces()
                  .then((provinces) => fillDropdown(el, provinces))
                  .catch((err) => console.error(err));
              }
              // Đảm bảo district và ward được reset về placeholder
              if (id === "district" || id === "ward") {
                const button = el.querySelector(".custom-dropdown-button");
                const textSpan = button?.querySelector(".dropdown-text");
                if (textSpan) {
                  textSpan.textContent = "Chọn";
                  textSpan.classList.add("placeholder");
                }
              }
            }
          } else if (el.classList && el.classList.contains("field-options")) {
            // Reset checkbox or radio group - XỬ LÝ RIÊNG
            el.querySelectorAll(
              'input[type="checkbox"], input[type="radio"]'
            ).forEach((input) => {
              input.checked = false;
              input.classList.remove("error");
              // Trigger change event để đảm bảo UI được update
              input.dispatchEvent(new Event("change", { bubbles: true }));
            });
            // Reset label chính của checkbox/radio
            const fieldDiv = el.closest(".field");
            if (fieldDiv) {
              fieldDiv.classList.remove("error");
              const mainLabel = fieldDiv.querySelector("label:first-of-type");
              if (mainLabel && !mainLabel.closest(".field-option")) {
                mainLabel.classList.remove("error-label");
                mainLabel.style.color = "";
                mainLabel.style.fontWeight = "";
              }
            }
          } else {
            if (el.classList && el.classList.contains("custom-dropdown")) {
              clearDropdown(el);
              // Refill options nếu có trong config
              if (
                fieldConfig &&
                fieldConfig.type === "select" &&
                fieldConfig.options
              ) {
                const placeholder = fieldConfig.placeholder || "Chọn";
                clearDropdown(el, placeholder);
                (fieldConfig.options || []).forEach((option) => {
                  let optionValue, optionText;
                  if (typeof option === "object" && option !== null) {
                    optionValue =
                      option.value !== undefined
                        ? String(option.value)
                        : String(option);
                    optionText =
                      option.label !== undefined
                        ? String(option.label)
                        : optionValue;
                  } else {
                    optionValue = String(option);
                    optionText = optionValue;
                  }
                  addDropdownOption(el, optionValue, optionText);
                });
              }
            } else {
              el.value = "";
            }
          }
          const targetEl =
            el.classList && el.classList.contains("custom-dropdown")
              ? el.querySelector(".custom-dropdown-button")
              : el;
          if (targetEl) targetEl.classList.remove("error");
          const fieldDiv = el.closest(".field");
          if (fieldDiv) {
            fieldDiv.classList.remove("error");
          }
          const label = el.previousElementSibling;
          if (label && label.tagName === "LABEL") {
            label.classList.remove("error-label");
          }
        });

        // Reset custom fields (cấu trúc: array với title và fields)
        const custom = CAMPAIGN_CONFIG.fields.custom || [];
        custom.forEach((section) => {
          const fields = section.fields || [];
          fields.forEach((field) => {
            // Tìm element - checkbox/radio dùng container với data-field-id
            let el = $(field.id);
            if (!el && (field.type === "checkbox" || field.type === "radio")) {
              // Tìm container bằng data-field-id
              el = document.querySelector(
                `.field-options[data-field-id="${field.id}"]`
              );
            }

            if (el) {
              if (el.classList && el.classList.contains("custom-dropdown")) {
                clearDropdown(el);
                // Refill options nếu có trong config
                if (field.type === "select" && field.options) {
                  const placeholder = field.placeholder || "Chọn";
                  clearDropdown(el, placeholder);
                  (field.options || []).forEach((option) => {
                    let optionValue, optionText;
                    if (typeof option === "object" && option !== null) {
                      optionValue =
                        option.value !== undefined
                          ? String(option.value)
                          : String(option);
                      optionText =
                        option.label !== undefined
                          ? String(option.label)
                          : optionValue;
                    } else {
                      optionValue = String(option);
                      optionText = optionValue;
                    }
                    addDropdownOption(el, optionValue, optionText);
                  });
                }
              } else if (
                el.classList &&
                el.classList.contains("field-options")
              ) {
                // Reset checkbox or radio group - XỬ LÝ RIÊNG
                el.querySelectorAll(
                  'input[type="checkbox"], input[type="radio"]'
                ).forEach((input) => {
                  input.checked = false;
                  input.classList.remove("error");
                  // Trigger change event để đảm bảo UI được update
                  input.dispatchEvent(new Event("change", { bubbles: true }));
                });
                // KHÔNG reset error-label cho option labels vì không apply error cho chúng

                // Reset label chính của checkbox/radio
                const fieldDiv = el.closest(".field");
                if (fieldDiv) {
                  fieldDiv.classList.remove("error");
                  const mainLabel = fieldDiv.querySelector(
                    "label:first-of-type"
                  );
                  if (mainLabel && !mainLabel.closest(".field-option")) {
                    mainLabel.classList.remove("error-label");
                    mainLabel.style.color = "";
                    mainLabel.style.fontWeight = "";
                  }
                }
              } else {
                el.value = "";
                const targetEl = el;
                if (targetEl) targetEl.classList.remove("error");
                const fieldDiv = el.closest(".field");
                if (fieldDiv) {
                  fieldDiv.classList.remove("error");
                }
                const label = el.previousElementSibling;
                if (
                  label &&
                  label.tagName === "LABEL" &&
                  !label.closest(".field-option")
                ) {
                  label.classList.remove("error-label");
                }
              }
            }
          });
        });

        // Reset consent checkbox
        const consentCheckbox = $("consentCheckbox");
        if (consentCheckbox) {
          consentCheckbox.checked = false;
        }

        setStatus("");
        const submitText = $("submitText");
        if (submitText) {
          const defaultText =
            CAMPAIGN_CONFIG.metadata?.submitButtonText || "Gửi thông tin";
          submitText.textContent = defaultText;
        }
        const submitBtn = $("submitBtn");
        if (submitBtn) {
          // Disable button if checkbox exists
          if (consentCheckbox) {
            submitBtn.disabled = true;
          } else {
            submitBtn.disabled = false;
          }
        }
        isSubmitting = false;
      }

      // ======= INITIALIZATION =======
      async function init() {
        try {
          if (!CAMPAIGN_CONFIG) {
            throw new Error("Không tìm thấy cấu hình chiến dịch.");
          }

          // Check if campaign is enabled
          if (CAMPAIGN.enabled === false) {
            const disabledMsg =
              CAMPAIGN_CONFIG.metadata?.disabledMessage ||
              "Chiến dịch này hiện đang tắt.";
            showError(disabledMsg);
            return;
          }

          // Apply theme
          if (CAMPAIGN_CONFIG.theme) {
            applyTheme(CAMPAIGN_CONFIG.theme);
          }

          // Update hero section
          if (CAMPAIGN_CONFIG.metadata) {
            const heroEl = $("campaignHero");
            const infoCardEl = $("heroInfoCard");
            const titleEl = $("campaignTitle");
            const descEl = $("campaignDesc");

            // Set border radius from theme config if provided
            if (heroEl && CAMPAIGN_CONFIG.theme?.heroBorderRadius) {
              heroEl.style.borderRadius =
                CAMPAIGN_CONFIG.theme.heroBorderRadius;
            }

            // Populate and show info card
            if (infoCardEl) {
              if (titleEl && CAMPAIGN_CONFIG.metadata.heroTitle) {
                titleEl.textContent = CAMPAIGN_CONFIG.metadata.heroTitle;
              }
              if (descEl && CAMPAIGN_CONFIG.metadata.description) {
                descEl.textContent = CAMPAIGN_CONFIG.metadata.description;
              }
              // Show card if title or description exists
              if (
                CAMPAIGN_CONFIG.metadata.heroTitle ||
                CAMPAIGN_CONFIG.metadata.description
              ) {
                infoCardEl.style.display = "block";
              }
            }
          }


          // Render form
          renderForm();

          // Setup global click listener to close dropdowns
          document.addEventListener("click", (e) => {
            if (!e.target.closest(".custom-dropdown")) {
              closeAllDropdowns();
            }
          });

          // Show content
          $("loadingMessage").style.display = "none";
          $("campaignContent").style.display = "block";

          // Setup submit handler
          const submitBtn = $("submitBtn");
          if (submitBtn) {
            submitBtn.addEventListener("click", handleSubmit);
          }

          // Setup consent checkbox handler
          const consentCheckbox = $("consentCheckbox");
          if (consentCheckbox && submitBtn) {
            // Initially disable button
            submitBtn.disabled = true;
            
            // Enable/disable button based on checkbox
            consentCheckbox.addEventListener("change", function() {
              submitBtn.disabled = !this.checked;
            });
          }

          // Setup new submit handler
          const newSubmitBtn = $("newSubmitBtn");
          if (newSubmitBtn) {
            // Set button text from config
            const newSubmitText =
              CAMPAIGN_CONFIG.metadata?.newSubmitButtonText ||
              "Gửi thông tin khác";
            newSubmitBtn.textContent = newSubmitText;

            newSubmitBtn.addEventListener("click", () => {
              resetForm();
              showFormCard();
              window.scrollTo({ top: 0, behavior: "smooth" });
            });
          }

          // Set submit button text from config
          const submitTextEl = $("submitText");
          if (submitTextEl && CAMPAIGN_CONFIG.metadata?.submitButtonText) {
            submitTextEl.textContent =
              CAMPAIGN_CONFIG.metadata.submitButtonText;
          }

          // Set result title from config
          const resultTitleEl = $("resultTitle");
          if (resultTitleEl) {
            const resultTitle =
              CAMPAIGN_CONFIG.metadata?.resultTitle || "🎉 Đã nhận thông tin";
            resultTitleEl.textContent = resultTitle;
          }
        } catch (err) {
          console.error(err);
          $("loadingMessage").style.display = "none";
          showError(
            err.message || "Đã xảy ra lỗi khi tải trang. Vui lòng thử lại."
          );
        }
      }

      async function handleSubmit() {
        if (isSubmitting) return;

        // Check consent checkbox
        const consentCheckbox = $("consentCheckbox");
        if (!consentCheckbox || !consentCheckbox.checked) {
          setStatus("Vui lòng đồng ý với chính sách bảo mật để tiếp tục.", "var(--danger)");
          return;
        }

        if (!validateForm()) {
          return;
        }

        isSubmitting = true;
        const submitBtn = $("submitBtn");
        const submitText = $("submitText");

        if (submitBtn) submitBtn.disabled = true;
        if (submitText)
          submitText.innerHTML = '<span class="spinner"></span> Đang gửi...';

        const payload = collectFormData();

        // Lấy IP address
        setStatus("Đang lấy thông tin...");
        payload.ip_address = await getUserIP();

        try {
          setStatus("Đang gửi dữ liệu...");
          const result = await submitAnswers(payload);
          if (result && result.success === false) {
            setStatus(
              result.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
              "var(--danger)"
            );
            if (submitText) submitText.textContent = "Gửi lại";
            if (submitBtn) submitBtn.disabled = false;
            isSubmitting = false;
            return;
          }
          setStatus("");
          if (submitText) submitText.textContent = "Đã gửi ✔";
          renderReceipt(payload, new Date().toISOString());
          showResultCard();
        } catch (err) {
          console.error(err);
          setStatus(
            err?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
            "var(--danger)"
          );
          if (submitText) submitText.textContent = "Gửi lại";
          if (submitBtn) submitBtn.disabled = false;
          isSubmitting = false;
        }
      }
