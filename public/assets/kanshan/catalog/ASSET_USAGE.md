# 刘看山资产使用建议（ASSET USAGE）

> Step 4A。基于 `ASSET_CATALOG.md` 的盘点结果。  
> **不修改 UI / 游戏逻辑 / 图片文件。** 不生成 WebP。

## 推荐 Hero

- **暂无已确认推荐。**
- 原因：
  - 两张四视图 PNG 约 `786×207` / `787×208`，已定为 **CHARACTER_REFERENCE**，不适合直接做 Hero。
  - `processed/*/kanshan-*.png` 单帧约 `196–197×207–208`，分辨率过低。
  - 三张 RAW JPG 用途按规则标为 **UNKNOWN**，本轮不猜测、不推荐为 Hero。
  - `web/` 为空，尚无 Web 交付主视觉。

## 推荐 Avatar

优先（正面、带透明、已切单帧）：

1. `public/assets/kanshan/processed/standard/kanshan-front.png`（普通造型 · FRONT）
2. `public/assets/kanshan/processed/scarf/kanshan-front.png`（围脖造型 · FRONT）

备选（侧面/背面，按需）：

- `processed/standard/kanshan-{left,right,back}.png`
- `processed/scarf/kanshan-{left,right,back}.png`

说明：当前 Avatar 候选尺寸很小（约 200px 高），Demo 小头像可用；若要高清头像，需后续从更高分辨率源重导出。

## 推荐 Character Reference

1. `public/assets/kanshan/raw/png/刘看山四视图.png`  
   - 用途：CHARACTER_REFERENCE  
   - 顺序（人工确认）：**前 → 左 → 右 → 后**
2. `public/assets/kanshan/raw/png/刘看山围脖四视图.png`  
   - 用途：CHARACTER_REFERENCE  
   - 顺序（人工确认）：**前 → 左 → 右 → 后**

## 普通四视图

**原始拼图**

- `public/assets/kanshan/raw/png/刘看山四视图.png`（786×207，RGBA，有实际透明）

**已加工单帧（PROCESSED / standard）**

| 顺序 | 方向 | 当前路径 |
|------|------|----------|
| 1 | FRONT | `public/assets/kanshan/processed/standard/kanshan-front.png` |
| 2 | LEFT | `public/assets/kanshan/processed/standard/kanshan-left.png` |
| 3 | RIGHT | `public/assets/kanshan/processed/standard/kanshan-right.png` |
| 4 | BACK | `public/assets/kanshan/processed/standard/kanshan-back.png` |

## 围脖四视图

**原始拼图**

- `public/assets/kanshan/raw/png/刘看山围脖四视图.png`（787×208，RGBA，有实际透明）

**已加工单帧（PROCESSED / scarf）**

| 顺序 | 方向 | 当前路径 |
|------|------|----------|
| 1 | FRONT | `public/assets/kanshan/processed/scarf/kanshan-front.png` |
| 2 | LEFT | `public/assets/kanshan/processed/scarf/kanshan-left.png` |
| 3 | RIGHT | `public/assets/kanshan/processed/scarf/kanshan-right.png` |
| 4 | BACK | `public/assets/kanshan/processed/scarf/kanshan-back.png` |

## 暂时未知

以下 JPG **仅登记为 UNKNOWN**，等待人工确认用途后再决定是否进入 Hero / Avatar / Stage 等流程：

1. `public/assets/kanshan/raw/jpg/33f11967cc145627560c3db70c7d3ab8.jpg`（1672×941）
2. `public/assets/kanshan/raw/jpg/c8d9642e1d6a402907200a8fed6c0fc3.jpg`（1280×1707）
3. `public/assets/kanshan/raw/jpg/de232c5a0202dd7512ec1b7bddd150d8.jpg`（1280×1707）

共同元信息：JPEG、无 Alpha、无透明区域。

## 暂时不使用

- `public/assets/kanshan/web/`：**空目录**（尚无 Web 交付物）。
- `public/assets/kanshan/raw/other/` 下的非位图源文件（`.ai` / `.c4d` / `.obj` / `.psd`）：本轮不当作 Web UI 图片使用；保留作制作源。

## 下一步建议（仅文档，本轮不执行）

1. 人工确认 3 张 JPG 的用途标签（是否可抠绿幕后做 Hero / 阶段视觉等）。
2. 若需要正式 Hero：从更高分辨率 3D 源或已确认 JPG 导出带 Alpha 的大图，放入 `processed/` 或 `web/`。
3. 需要 WebP 时再单独开 Step，写入 `web/` 并回写目录。
