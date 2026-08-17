import type {
  PlaystyleTrait,
  TemperamentTrait,
} from "./career-template-profile.ts";

export interface FallbackPlayerTemplate {
  id: string;
  name: string;
  league: "NBA" | "CBA" | "OTHER";
  teamHint: string;
  playstyles: PlaystyleTrait[];
  temperaments: TemperamentTrait[];
  rationale: string;
}

/** 离线 fallback：无外网 / CLI 时仍可给出模版。 */
export const FALLBACK_PLAYER_TEMPLATES: readonly FallbackPlayerTemplate[] = [
  {
    id: "kawhi",
    name: "科怀·伦纳德",
    league: "NBA",
    teamHint: "快船 / 猛龙",
    playstyles: ["TWO_WAY", "DEFENSE", "SCORING"],
    temperaments: ["MILD", "TEAM_FIRST"],
    rationale: "攻防一体、比赛情绪稳定，像一台冷静机器。",
  },
  {
    id: "curry",
    name: "斯蒂芬·库里",
    league: "NBA",
    teamHint: "勇士",
    playstyles: ["SHOOTING", "SCORING", "IQ"],
    temperaments: ["MILD", "TEAM_FIRST"],
    rationale: "空间型投射核，用投篮改变比赛几何。",
  },
  {
    id: "draymond",
    name: "德雷蒙德·格林",
    league: "NBA",
    teamHint: "勇士",
    playstyles: ["DEFENSE", "PLAYMAKING", "IQ"],
    temperaments: ["HOT_HEADED", "EMOTIONAL", "TEAM_FIRST"],
    rationale: "防守大脑 + 情绪外放，更衣室与球场都存在感极强。",
  },
  {
    id: "harden",
    name: "詹姆斯·哈登",
    league: "NBA",
    teamHint: "多支球队",
    playstyles: ["SCORING", "PLAYMAKING", "SHOOTING"],
    temperaments: ["MEDIA_REACTIVE", "RISK_TAKER"],
    rationale: "持球造杀伤与组织兼备，舆论场同样高光。",
  },
  {
    id: "jokic",
    name: "尼古拉·约基奇",
    league: "NBA",
    teamHint: "掘金",
    playstyles: ["PLAYMAKING", "IQ", "SCORING"],
    temperaments: ["MILD", "TEAM_FIRST"],
    rationale: "高球商组织中枢，比赛阅读优先于情绪表演。",
  },
  {
    id: "giannis",
    name: "扬尼斯·阿德托昆博",
    league: "NBA",
    teamHint: "雄鹿",
    playstyles: ["PHYSICAL", "SCORING", "TWO_WAY"],
    temperaments: ["HUSTLE", "RESILIENT"],
    rationale: "身体优势推动转换进攻，拼劲与成长故事突出。",
  },
  {
    id: "pg13",
    name: "保罗·乔治",
    league: "NBA",
    teamHint: "多支球队",
    playstyles: ["TWO_WAY", "SHOOTING", "SCORING"],
    temperaments: ["MEDIA_REACTIVE", "EMOTIONAL"],
    rationale: "锋线得分防守都能打，媒体表达感强。",
  },
  {
    id: "butler",
    name: "吉米·巴特勒",
    league: "NBA",
    teamHint: "热火等",
    playstyles: ["TWO_WAY", "SCORING", "PHYSICAL"],
    temperaments: ["HOT_HEADED", "HUSTLE", "RISK_TAKER"],
    rationale: "硬汉季后赛属性，态度鲜明、对抗性强。",
  },
  {
    id: "cp3",
    name: "克里斯·保罗",
    league: "NBA",
    teamHint: "多支球队",
    playstyles: ["PLAYMAKING", "IQ", "DEFENSE"],
    temperaments: ["HOT_HEADED", "TEAM_FIRST"],
    rationale: "控场大师，比赛控制欲强，偶有火爆一面。",
  },
  {
    id: "yi",
    name: "易建联",
    league: "CBA",
    teamHint: "中国男篮 / CBA",
    playstyles: ["SCORING", "PHYSICAL", "ROLE"],
    temperaments: ["MILD", "RESILIENT", "TEAM_FIRST"],
    rationale: "从海外到国内的韧性轨迹，国民级存在感。",
  },
  {
    id: "guo",
    name: "郭艾伦",
    league: "CBA",
    teamHint: "CBA",
    playstyles: ["SCORING", "PLAYMAKING"],
    temperaments: ["HOT_HEADED", "EMOTIONAL", "MEDIA_REACTIVE"],
    rationale: "持球冲击力强，情绪与舆论话题并存。",
  },
  {
    id: "iggy",
    name: "安德烈·伊戈达拉",
    league: "NBA",
    teamHint: "勇士等",
    playstyles: ["DEFENSE", "IQ", "ROLE", "TWO_WAY"],
    temperaments: ["MILD", "TEAM_FIRST", "HUSTLE"],
    rationale: "顶级角色与防守智慧，赢球优先。",
  },
] as const;

export function scoreTemplateMatch(
  template: FallbackPlayerTemplate,
  playstyles: readonly PlaystyleTrait[],
  temperaments: readonly TemperamentTrait[],
): number {
  let score = 0;
  for (const trait of playstyles) {
    if (template.playstyles.includes(trait)) score += 3;
  }
  for (const trait of temperaments) {
    if (template.temperaments.includes(trait)) score += 2;
  }
  if (template.league === "NBA") score += 1;
  return score;
}

export function pickFallbackTemplate(
  playstyles: readonly PlaystyleTrait[],
  temperaments: readonly TemperamentTrait[],
): FallbackPlayerTemplate {
  let best = FALLBACK_PLAYER_TEMPLATES[0]!;
  let bestScore = -1;
  for (const template of FALLBACK_PLAYER_TEMPLATES) {
    const score = scoreTemplateMatch(template, playstyles, temperaments);
    if (score > bestScore) {
      best = template;
      bestScore = score;
    }
  }
  return best;
}
