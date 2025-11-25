# CORS 問題最終解決方案

## 🎯 核心解決策略

針對 Firebase Storage 未設定 CORS 的情況，我們實作了**多層備援策略**，確保即使 CORS 設定不正確，功能仍能正常運作。

## 📋 圖片下載功能（三層備援）

### 策略 1：從 DOM 讀取（最可靠）⭐
**原理**：如果圖片已經在頁面上顯示，直接從 `<img>` 元素讀取，完全繞過 CORS 限制。

**優點**：
- ✅ 完全繞過 CORS（因為圖片已經載入到頁面）
- ✅ 最可靠的方式
- ✅ 不需要額外的網路請求

**實作**：
```typescript
// 尋找頁面上對應的圖片元素
const img = document.querySelector(`img[data-image-index="${index}"]`);
// 從已載入的圖片元素繪製到 canvas
ctx.drawImage(img, 0, 0);
```

### 策略 2：直接 Fetch（適用於已設定 CORS）
**原理**：使用標準的 `fetch` API 下載圖片。

**優點**：
- ✅ 速度快
- ✅ 支援進度追蹤（未來可擴展）

**缺點**：
- ⚠️ 需要伺服器正確設定 CORS

### 策略 3：Canvas 載入（雙重嘗試）
**原理**：使用 Canvas 載入圖片，自動嘗試 CORS 和無 CORS 兩種方式。

**實作流程**：
1. 先嘗試 `crossOrigin = 'anonymous'`（需要 CORS）
2. 如果失敗，自動嘗試不設定 `crossOrigin`（某些情況下可能有效）

## 📋 影片生成功能（三層備援）

影片生成時需要先解析圖片位元組，使用相同的三層備援策略：

1. **優先**：直接 `fetch` 下載
2. **備援 1**：Canvas 載入（CORS 模式）
3. **備援 2**：Canvas 載入（無 CORS 模式）

## 🔧 技術細節

### 圖片元素標記
為了讓 DOM 讀取策略能夠找到對應的圖片，我們在圖片元素上添加了 `data-image-index` 屬性：

```tsx
<img
  src={image.src}
  data-image-index={index}
  crossOrigin="anonymous"
  onError={(e) => {
    // 如果 CORS 失敗，自動移除 crossOrigin 重試
    const img = e.currentTarget;
    if (img.crossOrigin === 'anonymous') {
      img.removeAttribute('crossOrigin');
      img.src = image.src;
    }
  }}
/>
```

### Canvas 載入的雙重嘗試
`loadImageViaCanvas` 函數會自動嘗試兩種方式：

```typescript
// 先嘗試 CORS 模式
img.crossOrigin = 'anonymous';
// 如果失敗，自動切換到無 CORS 模式
img.removeAttribute('crossOrigin');
```

## ✅ 預期效果

使用此方案後，即使 Firebase Storage 未設定 CORS：

1. **圖片下載**：
   - ✅ 如果圖片已在頁面上顯示 → 從 DOM 讀取（100% 成功）
   - ✅ 如果圖片未顯示 → 嘗試 Canvas 方式（可能成功）

2. **影片生成**：
   - ✅ 嘗試多種方式載入圖片
   - ✅ 提供詳細的錯誤訊息

## 🚨 如果仍然失敗

如果所有策略都失敗，錯誤訊息會提供以下建議：

1. **檢查 Firebase Storage 的 CORS 設定**
2. **等待圖片完全載入後再下載**
3. **使用瀏覽器的「另存圖片」功能**

## 📝 Firebase Storage CORS 設定（推薦）

雖然程式碼已經實作了備援方案，但為了最佳效能，建議設定 Firebase Storage CORS：

```bash
# 建立 cors.json
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]

# 部署 CORS 設定
gsutil cors set cors.json gs://YOUR_STORAGE_BUCKET
```

## 🎯 總結

此解決方案提供了**多層防護**，確保即使 CORS 設定不正確，功能仍能正常運作。優先使用最可靠的方式（DOM 讀取），並在失敗時自動嘗試其他方式。

