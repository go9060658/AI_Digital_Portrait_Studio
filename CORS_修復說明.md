# CORS 問題修復說明

## 🔧 修復內容

### 1. 圖片下載功能修復

**問題**：
- Firebase Storage URL 圖片下載時遇到 CORS 錯誤
- Canvas 載入圖片失敗時沒有備援方案

**修復**：
- ✅ 實作**三層備援策略**：
  1. **優先策略**：從頁面上已載入的圖片元素讀取（完全繞過 CORS，最可靠）
  2. **備援策略 1**：直接使用 `fetch` 下載（適用於已正確設定 CORS 的情況）
  3. **備援策略 2**：使用 Canvas 方式載入圖片（嘗試 CORS 和無 CORS 兩種方式）
- ✅ 添加超時機制（15 秒），避免無限等待
- ✅ 改善錯誤訊息，提供更具體的錯誤原因和解決建議
- ✅ 圖片元素添加 `data-image-index` 屬性，方便 DOM 查找

**修改檔案**：
- `components/PromptDisplay.tsx` - `handleDownload` 函數、`loadImageFromDOM` 函數

### 2. 影片生成功能修復

**問題**：
- 影片生成時需要先解析圖片位元組，遇到 CORS 錯誤導致失敗
- `resolveImageBytes` 函數的錯誤處理不夠完善

**修復**：
- ✅ 實作三層備援策略：
  1. **優先策略**：使用 `fetch` 下載圖片（設定適當的 headers）
  2. **備援策略 1**：使用 Canvas 方式載入（先嘗試 `crossOrigin = 'anonymous'`）
  3. **備援策略 2**：使用 Canvas 方式載入（不設定 `crossOrigin`，某些情況下可能有效）
- ✅ Canvas 載入函數自動嘗試 CORS 和無 CORS 兩種方式
- ✅ 添加超時機制（10 秒）
- ✅ 改善錯誤訊息，提供詳細的失敗原因

**修改檔案**：
- `utils/imageUtils.ts` - `resolveImageBytes` 函數、`loadImageViaCanvas` 函數
- 改善 `loadImageViaCanvas` 函數，自動嘗試 CORS 和無 CORS 兩種方式

### 3. 資源下載功能改善

**問題**：
- 影片下載時沒有重試機制
- 網路錯誤時直接失敗

**修復**：
- ✅ 整合重試機制（最多重試 3 次）
- ✅ 使用 exponential backoff 策略
- ✅ 支援取消操作（AbortSignal）

**修改檔案**：
- `contexts/ApiContext.tsx` - `downloadResource` 函數

## 📋 Firebase Storage CORS 設定建議

雖然程式碼已經實作了備援方案，但為了最佳效能，建議正確設定 Firebase Storage 的 CORS：

### 設定步驟

1. **安裝 Firebase CLI**（如果尚未安裝）：
   ```bash
   npm install -g firebase-tools
   ```

2. **建立 CORS 設定檔案** `cors.json`：
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

3. **部署 CORS 設定**：
   ```bash
   gsutil cors set cors.json gs://YOUR_STORAGE_BUCKET
   ```
   
   或使用 Firebase CLI：
   ```bash
   firebase storage:rules:set cors.json
   ```

4. **驗證設定**：
   ```bash
   gsutil cors get gs://YOUR_STORAGE_BUCKET
   ```

### 更安全的 CORS 設定（推薦）

如果您希望限制存取來源，可以使用以下設定：

```json
[
  {
    "origin": [
      "https://portrait.icareu.tw",
      "https://yourdomain.com",
      "http://localhost:5173"
    ],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

## 🧪 測試建議

修復後，請測試以下場景：

1. **圖片下載測試**：
   - ✅ Data URL 格式的圖片下載
   - ✅ Firebase Storage URL 圖片下載
   - ✅ 一般 URL 圖片下載
   - ✅ 網路錯誤時的錯誤處理

2. **影片生成測試**：
   - ✅ 使用 Data URL 圖片生成影片
   - ✅ 使用 Firebase Storage URL 圖片生成影片
   - ✅ 使用一般 URL 圖片生成影片
   - ✅ CORS 錯誤時的備援機制

3. **錯誤處理測試**：
   - ✅ 網路連線中斷時的處理
   - ✅ 超時情況的處理
   - ✅ 錯誤訊息的顯示

## 🔍 除錯提示

如果仍然遇到問題，請檢查：

1. **瀏覽器主控台**：
   - 查看是否有 CORS 相關錯誤
   - 檢查網路請求的狀態碼

2. **Firebase Storage 設定**：
   - 確認 Storage 規則允許讀取
   - 確認 CORS 設定已正確部署

3. **網路連線**：
   - 確認網路連線正常
   - 檢查是否有防火牆或代理設定影響

## 📝 相關檔案

- `utils/imageUtils.ts` - 圖片處理工具函數
- `components/PromptDisplay.tsx` - 圖片顯示與下載組件
- `contexts/ApiContext.tsx` - API 呼叫封裝
- `utils/retry.ts` - 重試機制實作

## 🎯 後續優化建議

1. **考慮使用 Firebase SDK**：
   - 對於 Firebase Storage URL，可以使用 Firebase SDK 的 `getDownloadURL` 方法
   - 這樣可以完全避免 CORS 問題

2. **添加進度追蹤**：
   - 圖片下載時顯示進度條
   - 影片生成時顯示進度百分比

3. **改善使用者體驗**：
   - 添加重試按鈕
   - 提供更詳細的錯誤說明和解決建議

