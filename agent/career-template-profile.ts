import type { CareerFlag, PlayerState, SkillStat } from "../game/types.ts";

export type PlaystyleTrait =
  | "SCORING"
  | "SHOOTING"
  | "DEFENSE"
  | "PLAYMAKING"
  | "PHYSICAL"
  | "IQ"
  | "TWO_WAY"
  | "ROLE";

export type TemperamentTrait =
  | "HOT_HEADED"
  | "EMOTIONAL"
  | "MILD"
  | "HUSTLE"
  | "MEDIA_REACTIVE"
  | "TEAM_FIRST"
  | "RISK_TAKER"
  | "RESILIENT";

export interface CareerTemplateProfile {
  playstyles: PlaystyleTrait[];
  temperaments: TemperamentTrait[];
  topSkills: SkillStat[];
  flags: CareerFlag[];
  /** 供知乎搜索的中文关键词片段 */
  searchHints: string[];
  /** 人类可读画像摘要 */
  summary: string;
}

const SKILL_LABEL: Record<SkillStat, string> = {
  shooting: "投射",
  finishing: "突破终结",
  passing: "组织传球",
  defense: "防守",
  physical: "身体对抗",
  basketballIQ: "篮球智商",
};

const HOT_CHOICE_RE =
  /(clapback|leak|party|whine|clash|fight|quit|sink|regret|bust|hide|choke)/i;
const MILD_CHOICE_RE =
  /(ignore|listen|team|trust|follow|system|humble|therapy|rest|smart)/i;
const HUSTLE_CHOICE_RE = /(hustle|defend|wall|physical|grind|two-way|two_way)/i;
const RISK_CHOICE_RE = /(risk|iso|insist|bet|drive|hero)/i;

function skillEntries(player: PlayerState): Array<[SkillStat, number]> {
  return [
    ["shooting", player.shooting],
    ["finishing", player.finishing],
    ["passing", player.passing],
    ["defense", player.defense],
    ["physical", player.physical],
    ["basketballIQ", player.basketballIQ],
  ];
}

function derivePlaystyles(player: PlayerState): {
  playstyles: PlaystyleTrait[];
  topSkills: SkillStat[];
} {
  const ranked = skillEntries(player).sort((a, b) => b[1] - a[1]);
  const topSkills = ranked.slice(0, 2).map(([key]) => key);
  const mean =
    ranked.reduce((sum, [, value]) => sum + value, 0) / Math.max(ranked.length, 1);

  const playstyles = new Set<PlaystyleTrait>();

  for (const skill of topSkills) {
    if (skill === "shooting") playstyles.add("SHOOTING");
    if (skill === "finishing" || skill === "shooting") playstyles.add("SCORING");
    if (skill === "defense") playstyles.add("DEFENSE");
    if (skill === "passing") playstyles.add("PLAYMAKING");
    if (skill === "physical") playstyles.add("PHYSICAL");
    if (skill === "basketballIQ") playstyles.add("IQ");
  }

  const defense = player.defense;
  const offense = (player.shooting + player.finishing) / 2;
  if (defense >= mean + 4 && offense >= mean) {
    playstyles.add("TWO_WAY");
  }
  if (player.role === "BENCH" || player.role === "ROTATION") {
    playstyles.add("ROLE");
  }
  if (playstyles.size === 0) {
    playstyles.add("ROLE");
  }

  return { playstyles: [...playstyles].slice(0, 4), topSkills };
}

function deriveTemperaments(player: PlayerState): TemperamentTrait[] {
  const traits = new Set<TemperamentTrait>();
  const choiceBlob = player.careerHistory
    .map((entry) => `${entry.choiceId} ${entry.choiceText}`)
    .join(" ");

  if (HOT_CHOICE_RE.test(choiceBlob) || player.flags.includes("MEDIA_BACKLASH")) {
    traits.add("HOT_HEADED");
    traits.add("EMOTIONAL");
  }
  if (player.flags.includes("MEDIA_BACKLASH")) {
    traits.add("MEDIA_REACTIVE");
  }
  if (MILD_CHOICE_RE.test(choiceBlob)) {
    traits.add("MILD");
    traits.add("TEAM_FIRST");
  }
  if (HUSTLE_CHOICE_RE.test(choiceBlob) || player.flags.includes("SCHOOL_GRIND")) {
    traits.add("HUSTLE");
  }
  if (RISK_CHOICE_RE.test(choiceBlob)) {
    traits.add("RISK_TAKER");
  }
  if (
    player.flags.includes("NBA_BUST") ||
    player.flags.includes("INJURY_PRONE")
  ) {
    traits.add("RESILIENT");
  }
  if (player.mental >= 75 && !traits.has("HOT_HEADED")) {
    traits.add("MILD");
  }
  if (player.mental < 55) {
    traits.add("EMOTIONAL");
  }
  if (traits.size === 0) {
    traits.add("TEAM_FIRST");
  }

  return [...traits].slice(0, 4);
}

function playstyleHint(trait: PlaystyleTrait): string {
  switch (trait) {
    case "SCORING":
      return "得分手";
    case "SHOOTING":
      return "射手";
    case "DEFENSE":
      return "防守尖兵";
    case "PLAYMAKING":
      return "组织核心";
    case "PHYSICAL":
      return "身体对抗型";
    case "IQ":
      return "高球商";
    case "TWO_WAY":
      return "攻防一体";
    case "ROLE":
      return "角色球员";
  }
}

function temperamentHint(trait: TemperamentTrait): string {
  switch (trait) {
    case "HOT_HEADED":
      return "脾气火爆";
    case "EMOTIONAL":
      return "情绪化";
    case "MILD":
      return "性格温和";
    case "HUSTLE":
      return "拼命三郎";
    case "MEDIA_REACTIVE":
      return "舆论敏感";
    case "TEAM_FIRST":
      return "团队优先";
    case "RISK_TAKER":
      return "敢于冒险";
    case "RESILIENT":
      return "韧性强";
  }
}

/**
 * 从最终 PlayerState 推导生涯模版画像。
 * 只读分析，不修改任何属性。
 */
export function buildCareerTemplateProfile(
  player: PlayerState,
): CareerTemplateProfile {
  const { playstyles, topSkills } = derivePlaystyles(player);
  const temperaments = deriveTemperaments(player);

  const searchHints = [
    ...playstyles.map(playstyleHint),
    ...temperaments.map(temperamentHint),
    ...topSkills.map((skill) => SKILL_LABEL[skill]),
    player.nbaSeason > 0 ? "NBA球员" : "篮球运动员",
  ];

  const skillText = topSkills.map((skill) => SKILL_LABEL[skill]).join("、");
  const styleText = playstyles.map(playstyleHint).join("、");
  const temperText = temperaments.map(temperamentHint).join("、");

  return {
    playstyles,
    temperaments,
    topSkills,
    flags: [...player.flags],
    searchHints,
    summary: `技术侧偏${skillText || "均衡"}（${styleText}）；性格侧偏${temperText}。`,
  };
}

export function buildPlayerSearchQuery(profile: CareerTemplateProfile): string {
  const parts = [
    "NBA",
    "篮球球员",
    ...profile.searchHints.slice(0, 5),
    "风格 像谁",
  ];
  return parts.join(" ").slice(0, 100);
}

export function buildPlayerCommentQuery(playerName: string): string {
  return `${playerName} 篮球 评价`.slice(0, 100);
}
