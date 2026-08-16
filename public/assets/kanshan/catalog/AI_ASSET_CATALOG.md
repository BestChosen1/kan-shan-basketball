# 刘看山 AI 素材资产目录（AI ASSET CATALOG）

> Step 4C-后处理 · 资产入库检查。  
> 生成时间：2026-08-16。  
> **仅盘点，未修改任何图片 / game / app / components / package.json。**

## 扫描范围

| 路径 | 说明 |
|------|------|
| `public/assets/kanshan/ai-raw/` | AI 原始 JPEG |
| `public/assets/kanshan/web/characters/` | Web 角色 WebP |
| `public/assets/kanshan/web/actions/` | Web 动作 WebP |
| `public/assets/kanshan/web/achievements/` | Web 成就 WebP |

> 注：`web/` 根目录下的既有 `kanshan-hero.jpg` / avatar PNG / `kanshan-reference.webp` 属于既有非 AI 管线素材，本文件不展开；本表只覆盖 **AI 原始 → Web 交付** 映射。

---

## 一、AI 原始素材（ai-raw）

共 **6** 个文件。

| # | 原始文件 | 类型 | visualType | 用途 | 尺寸 | 文件大小 | 存在 |
|---|----------|------|------------|------|------|----------|------|
| 1 | `ai-raw/kanshan-master-basketball.jpeg` | CHARACTER | — | 专业篮球阶段主角色 | 1792×2390 | 1,683,292 bytes（约 1.60 MB） | 是 |
| 2 | `ai-raw/kanshan-national-team.jpeg` | CHARACTER | — | 国家队阶段主角色 | 896×1195 | 852,923 bytes（约 833 KB） | 是 |
| 3 | `ai-raw/kanshan-shoot.jpeg` | ACTION | SHOOT | 关键投篮事件 | 896×1195 | 711,553 bytes（约 695 KB） | 是 |
| 4 | `ai-raw/kanshan-defense.jpeg` | ACTION | DEFENSE | 关键防守事件 | 896×1195 | 783,180 bytes（约 765 KB） | 是 |
| 5 | `ai-raw/kanshan-celebrate.jpeg` | ACTION | CELEBRATE | 比赛胜利/庆祝事件 | 896×1195 | 858,690 bytes（约 838 KB） | 是 |
| 6 | `ai-raw/kanshan-champion.jpeg` | ACHIEVEMENT | CHAMPION | 夺冠/最终成就 | 1792×2390 | 2,439,343 bytes（约 2.33 MB） | 是 |

---

## 二、Web 交付素材（AI 对应）

共 **6** 个 WebP（均有对应 AI 原始源）。

| # | Web 文件 | 对应原始文件 | 类型 | visualType | 用途 | 尺寸 | 文件大小 | 存在 | 推荐 Demo |
|---|----------|--------------|------|------------|------|------|----------|------|-----------|
| 1 | `web/characters/kanshan-basketball.webp` | `ai-raw/kanshan-master-basketball.jpeg` | CHARACTER | — | 专业篮球阶段主角色 | 1200×1601 | 51,328 bytes（约 50 KB） | 是 | **是（Hero 候选）** |
| 2 | `web/characters/kanshan-national-team.webp` | `ai-raw/kanshan-national-team.jpeg` | CHARACTER | — | 国家队阶段主角色 | 896×1195 | 69,576 bytes（约 68 KB） | 是 | **是（阶段主角色）** |
| 3 | `web/actions/kanshan-shoot.webp` | `ai-raw/kanshan-shoot.jpeg` | ACTION | SHOOT | 关键投篮事件 | 896×1195 | 74,692 bytes（约 73 KB） | 是 | **是** |
| 4 | `web/actions/kanshan-defense.webp` | `ai-raw/kanshan-defense.jpeg` | ACTION | DEFENSE | 关键防守事件 | 896×1195 | 77,732 bytes（约 76 KB） | 是 | **是** |
| 5 | `web/actions/kanshan-celebrate.webp` | `ai-raw/kanshan-celebrate.jpeg` | ACTION | CELEBRATE | 比赛胜利/庆祝事件 | 896×1195 | 88,954 bytes（约 87 KB） | 是 | **是** |
| 6 | `web/achievements/kanshan-champion.webp` | `ai-raw/kanshan-champion.jpeg` | ACHIEVEMENT | CHAMPION | 夺冠/最终成就 | 1200×1601 | 112,908 bytes（约 110 KB） | 是 | **是（Champion）** |

### 命名映射说明

| AI 原始文件名 | Web 文件名 | 备注 |
|---------------|------------|------|
| `kanshan-master-basketball.jpeg` | `kanshan-basketball.webp` | Web 侧省略 `master-` 前缀 |
| 其余 5 个 | 同名（扩展名改为 `.webp`） | 一一对应 |

---

## 三、覆盖检查

| AI 原始 | 期望 Web 路径 | WebP 是否存在 |
|---------|---------------|---------------|
| `kanshan-master-basketball.jpeg` | `web/characters/kanshan-basketball.webp` | ✅ |
| `kanshan-national-team.jpeg` | `web/characters/kanshan-national-team.webp` | ✅ |
| `kanshan-shoot.jpeg` | `web/actions/kanshan-shoot.webp` | ✅ |
| `kanshan-defense.jpeg` | `web/actions/kanshan-defense.webp` | ✅ |
| `kanshan-celebrate.jpeg` | `web/actions/kanshan-celebrate.webp` | ✅ |
| `kanshan-champion.jpeg` | `web/achievements/kanshan-champion.webp` | ✅ |

**缺少 WebP 的素材：无（0）。**

---

## 四、Demo 推荐（本轮）

### 推荐 Hero

1. **首选**：`web/characters/kanshan-basketball.webp`  
   - 源：`ai-raw/kanshan-master-basketball.jpeg`  
   - 理由：专业篮球阶段主角色、竖构图、体积小、适合角色卡/阶段主视觉。
2. **阶段切换备选**：`web/characters/kanshan-national-team.webp`（国家队阶段）

### 推荐 Action

| visualType | Web 路径 | 用途 |
|------------|----------|------|
| SHOOT | `web/actions/kanshan-shoot.webp` | 关键投篮 |
| DEFENSE | `web/actions/kanshan-defense.webp` | 关键防守 |
| CELEBRATE | `web/actions/kanshan-celebrate.webp` | 胜利/庆祝 |

三者均建议用于 Demo 事件插图。

### 推荐 Champion

- `web/achievements/kanshan-champion.webp`  
  - 源：`ai-raw/kanshan-champion.jpeg`  
  - 用途：夺冠 / 退役成就 / 最终结算页。

---

## 五、数量汇总

| 类别 | 数量 |
|------|------|
| AI 原始素材（ai-raw） | **6** |
| Web 素材（characters + actions + achievements） | **6** |
| 缺少对应 WebP | **0** |

---

## 六、后续接入提示（文档 only，本轮不执行）

1. UI 接入时优先使用 `web/**/*.webp`，避免直接引用 `ai-raw` 大图。  
2. `kanshan-master-basketball` ↔ `kanshan-basketball` 命名不一致，接入代码时注意路径常量。  
3. 接入阶段视觉时，勿改 `game/` 规则；仅做展示映射。
