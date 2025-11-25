# Cloudflare Pages 環境變數設定指南

## ⚠️ 重要說明

**Cloudflare Pages 不會自動填入 Firebase API Key 或其他環境變數**，您需要手動在 Cloudflare Dashboard 中設定。

---

## 📍 設定位置

### 步驟 1：前往環境變數設定頁面

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左側選單選擇 **Pages**
3. 點擊您的專案名稱
4. 前往 **Settings**（設定）標籤
5. 滾動到 **Environment Variables**（環境變數）區塊

---

## 🔧 設定步驟

### 步驟 2：新增環境變數

在 **Environment Variables** 區塊中：

1. 點擊 **Add variable**（新增變數）按鈕
2. 選擇環境：
   - **Production**（生產環境）- 用於正式部署
   - **Preview**（預覽環境）- 用於 Pull Request 預覽（可選）
   - **Browser**（瀏覽器）- 僅在瀏覽器中可用（不建議用於敏感資訊）

3. 輸入變數名稱和值
4. 點擊 **Save**（儲存）

### 步驟 3：新增所有必要的 Firebase 環境變數

請依序新增以下 **6 個必要變數**（建議選擇 **Production** 環境）：

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 認證網域 | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 專案 ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage 儲存桶 | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase 訊息發送者 ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase 應用程式 ID | `1:123456789012:web:abcdef123456` |

**可選變數**（如果使用環境變數提供 Gemini API Key）：

| 變數名稱 | 說明 |
|---------|------|
| `VITE_API_KEY` | Gemini API Key（可選，也可透過瀏覽器擴充功能提供） |

**Base Path**（通常不需要修改）：

| 變數名稱 | 值 | 說明 |
|---------|---|------|
| `VITE_BASE_PATH` | `/` | 除非使用自訂域名且設定子路徑，否則保持為 `/` |

---

## 📝 詳細操作步驟（附圖說明）

### 1. 取得 Firebase 設定參數

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案
3. 點擊 **專案設定**（⚙️ 圖示）→ **一般** 標籤
4. 滾動到 **您的應用程式** 區塊
5. 選擇 Web 應用程式（或建立新的）
6. 複製 Firebase 設定物件中的參數值

### 2. 在 Cloudflare 中設定

**畫面位置**：
```
Cloudflare Dashboard
  └── Pages
      └── [您的專案名稱]
          └── Settings（設定）
              └── Environment Variables（環境變數）
```

**操作步驟**：

1. **點擊 "Add variable"（新增變數）**
2. **輸入變數名稱**：
   - 第一個欄位：`VITE_FIREBASE_API_KEY`
3. **輸入變數值**：
   - 第二個欄位：貼上從 Firebase Console 複製的 `apiKey` 值
4. **選擇環境**：
   - 下拉選單選擇 **Production**（生產環境）
5. **點擊 "Save"（儲存）**
6. **重複步驟 1-5**，新增其他 5 個 Firebase 環境變數

---

## ✅ 設定完成後的檢查

### 檢查清單

設定完成後，請確認：

- [ ] 所有 6 個 Firebase 環境變數都已新增
- [ ] 變數名稱完全正確（必須以 `VITE_` 開頭）
- [ ] 變數值完整且正確（沒有多餘的空格或引號）
- [ ] 環境選擇為 **Production**（生產環境）
- [ ] `VITE_BASE_PATH` 設為 `/`（如果已設定）

### 驗證方式

1. **查看環境變數列表**
   - 在 Environment Variables 區塊中，應該能看到所有已設定的變數
   - 變數值會以 `•••••` 隱藏顯示（這是正常的）

2. **觸發重新部署**
   - 推送新的 commit 到 `main` 分支
   - 或前往 **Deployments** 標籤 → **Create Deployment** → 選擇最新提交

3. **檢查建置日誌**
   - 前往 **Deployments** 標籤
   - 點擊最新的部署
   - 查看 **Build Logs**
   - 確認沒有環境變數相關的錯誤

---

## 🔄 更新環境變數

如果需要更新環境變數值：

1. 前往 **Settings** → **Environment Variables**
2. 找到要更新的變數
3. 點擊變數右側的 **編輯**（鉛筆圖示）
4. 修改變數值
5. 點擊 **Save**（儲存）
6. **重要**：更新環境變數後，需要重新部署才會生效
   - 推送新的 commit，或
   - 手動觸發重新部署

---

## ⚠️ 常見錯誤

### 錯誤 1：變數名稱錯誤

**錯誤範例**：
- `FIREBASE_API_KEY` ❌（缺少 `VITE_` 前綴）
- `VITE_FIREBASE_APIKEY` ❌（應該是 `VITE_FIREBASE_API_KEY`）

**正確範例**：
- `VITE_FIREBASE_API_KEY` ✅

### 錯誤 2：變數值包含多餘空格

**錯誤範例**：
- ` AIzaSy... ` ❌（前後有空格）
- `"AIzaSy..."` ❌（包含引號）

**正確範例**：
- `AIzaSy...` ✅（直接貼上，不要加引號或空格）

### 錯誤 3：選擇錯誤的環境

**問題**：選擇了 **Preview** 或 **Browser** 環境，但部署的是 Production

**解決方案**：確保選擇 **Production** 環境

---

## 📚 相關文件

- [FIREBASE_CONFIG_REFERENCE.md](./FIREBASE_CONFIG_REFERENCE.md) - Firebase 設定參數參考
- [DEPLOYMENT_TROUBLESHOOTING_FIREBASE.md](./DEPLOYMENT_TROUBLESHOOTING_FIREBASE.md) - Firebase 部署錯誤排除
- [cloudflare-pages-setup.md](./cloudflare-pages-setup.md) - Cloudflare Pages 完整設定指南

---

## 🆘 需要協助？

如果設定後仍有問題：

1. 檢查 [DEPLOYMENT_TROUBLESHOOTING_FIREBASE.md](./DEPLOYMENT_TROUBLESHOOTING_FIREBASE.md)
2. 查看建置日誌中的錯誤訊息
3. 確認 Firebase Console 中的設定是否正確

