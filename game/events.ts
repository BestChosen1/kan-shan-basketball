import type { GameEvent } from "./types.ts";

export const CAREER_EVENTS: GameEvent[] = [
  // —— NORTH_POLE (2) ——
  {
    id: "np-first-ball",
    stage: "NORTH_POLE",
    visualType: "NONE",
    title: "第一次接触篮球",
    description:
      "极夜漫长，冰面空旷。一只被人遗弃的旧篮球滚到你脚边——你第一次真正握住它。",
    kanShanDialogue: "这球好沉……但在冰上弹起来的声音，比风好听。",
    choices: [
      {
        id: "np-first-ball-shoot",
        text: "对着雪堆练投篮手感",
        effects: { shooting: 3, stamina: -2 },
      },
      {
        id: "np-first-ball-dribble",
        text: "在冰面上反复运球找节奏",
        effects: { finishing: 2, physical: 1, stamina: -3 },
      },
      {
        id: "np-first-ball-think",
        text: "观察轨迹，琢磨球为什么会弹",
        effects: { basketballIQ: 3, mental: 1, stamina: -1 },
      },
    ],
  },
  {
    id: "np-arctic-training",
    stage: "NORTH_POLE",
    visualType: "NONE",
    title: "北极训练",
    description:
      "极寒中的体能课：负重奔跑、雪地折返、手套外的指尖投篮。你的身体在极限里适应篮球。",
    kanShanDialogue: "冷可以忍，但球不能不碰。今天再多一组。",
    nextStageAfterComplete: "SCHOOL",
    choices: [
      {
        id: "np-arctic-physical",
        text: "加练爆发力与对抗",
        effects: { physical: 4, defense: 1, stamina: -4 },
      },
      {
        id: "np-arctic-endurance",
        text: "专注耐力，撑完整堂课",
        effects: { stamina: 5, mental: 2, physical: 1 },
      },
      {
        id: "np-arctic-form",
        text: "冻得发抖也保持投篮姿势",
        effects: { shooting: 2, basketballIQ: 1, stamina: -3, mental: 2 },
      },
    ],
  },

  // —— SCHOOL (3) ——
  {
    id: "school-tryout",
    stage: "SCHOOL",
    visualType: "NONE",
    title: "校队选拔",
    description:
      "体育馆里挤满报名的学生。教练只看三轮：运球、投篮、一对一。名单今晚公布。",
    kanShanDialogue: "北极来的？没关系，球架高度全世界一样。",
    choices: [
      {
        id: "school-tryout-score",
        text: "用投篮表现抢眼",
        effects: { shooting: 3, fame: 2, stamina: -2 },
      },
      {
        id: "school-tryout-defend",
        text: "死咬对手，防守抢戏",
        effects: { defense: 3, physical: 1, stamina: -3 },
      },
      {
        id: "school-tryout-pass",
        text: "串联队友，展示视野",
        effects: { passing: 3, basketballIQ: 1, zhihuReputation: 1 },
      },
    ],
  },
  {
    id: "school-first-game",
    stage: "SCHOOL",
    visualType: "NONE",
    title: "第一次正式比赛",
    description:
      "校际联赛首秀。替补席上心跳如鼓，教练突然喊你的名字——上场两分钟，决定你是否留下。",
    kanShanDialogue: "别想北极，别想观众。只想下一次空位。",
    choices: [
      {
        id: "school-first-attack",
        text: "主动要球强攻篮下",
        effects: { finishing: 3, fame: 2, stamina: -3, mental: -1 },
      },
      {
        id: "school-first-smart",
        text: "按战术跑位，稳妥处理球",
        effects: { basketballIQ: 3, passing: 1, mental: 2 },
      },
      {
        id: "school-first-hustle",
        text: "拼抢篮板和防守轮转",
        effects: { defense: 2, physical: 2, stamina: -4 },
      },
    ],
  },
  {
    id: "school-focus",
    stage: "SCHOOL",
    visualType: "NONE",
    title: "选择主攻方向",
    description:
      "教练约谈：你想成为射手、锋线终结者，还是能支配球的组织手？暑假特训名额有限。",
    kanShanDialogue: "我想把短板补上，也想让长板更长。",
    nextStageAfterComplete: "CUBA",
    choices: [
      {
        id: "school-focus-three",
        text: "主攻三分射程",
        effects: { shooting: 4, stamina: -2, potential: 1 },
      },
      {
        id: "school-focus-paint",
        text: "主攻篮下终结",
        effects: { finishing: 4, physical: 1, stamina: -3 },
      },
      {
        id: "school-focus-point",
        text: "主攻组织与阅读",
        effects: { passing: 3, basketballIQ: 2, mental: 1 },
      },
    ],
  },

  // —— CUBA (4) ——
  {
    id: "cuba-school-choice",
    stage: "CUBA",
    visualType: "NONE",
    title: "CUBA 选校",
    description:
      "几所大学抛来橄榄枝：豪强争冠队、培养体系强的中游校、以及给你首发承诺的新军。",
    kanShanDialogue: "我想打球，也想赢。但不能只为了舒服。",
    choices: [
      {
        id: "cuba-school-power",
        text: "加入争冠豪强，先当蓝领",
        effects: { defense: 2, basketballIQ: 2, fame: 3, mental: -1 },
      },
      {
        id: "cuba-school-system",
        text: "选择体系完善的中游校",
        effects: { basketballIQ: 3, potential: 2, stamina: 1 },
      },
      {
        id: "cuba-school-minutes",
        text: "去新军换首发时间",
        effects: { finishing: 2, shooting: 2, fame: 1, mental: 2 },
      },
    ],
  },
  {
    id: "cuba-first-league",
    stage: "CUBA",
    visualType: "SHOOT",
    title: "第一次大学联赛",
    description:
      "CUBA 分区赛开打。强度远超高中：挡拆质量、轮转速度、体能消耗都上了一个台阶。",
    kanShanDialogue: "大学篮球会惩罚每一次走神。",
    choices: [
      {
        id: "cuba-league-volume",
        text: "提高出手量，建立得分威胁",
        effects: { shooting: 3, finishing: 1, fame: 2, stamina: -4 },
      },
      {
        id: "cuba-league-glue",
        text: "做胶水人，防守+传球",
        effects: { defense: 2, passing: 2, basketballIQ: 1, stamina: -3 },
      },
      {
        id: "cuba-league-recover",
        text: "严格管理负荷，保证出场质量",
        effects: { stamina: 4, mental: 2, potential: 1 },
      },
    ],
  },
  {
    id: "cuba-finals",
    stage: "CUBA",
    visualType: "SHOOT",
    title: "决赛关键时刻",
    description:
      "全国赛决赛，倒计时 28 秒，落后两分。球到你手上——教练喊暂停，所有人看着你。",
    kanShanDialogue: "我不怕投丢。我怕不敢投。",
    choices: [
      {
        id: "cuba-finals-iso",
        text: "单打造杀伤冲击篮筐",
        effects: { finishing: 3, physical: 1, fame: 4, stamina: -3, mental: 2 },
      },
      {
        id: "cuba-finals-three",
        text: "直接拔三分追平/超分",
        effects: { shooting: 3, fame: 5, mental: 1, stamina: -2 },
      },
      {
        id: "cuba-finals-dish",
        text: "吸引包夹后传给空位队友",
        effects: { passing: 3, basketballIQ: 3, fame: 2, zhihuReputation: 2 },
      },
    ],
  },
  {
    id: "cuba-draft-decision",
    stage: "CUBA",
    visualType: "NONE",
    title: "是否参加职业选秀",
    description:
      "CUBA 赛季结束。经纪人、教练、家人意见不一：申报 CBA 选秀，还是再读一年冲全国冠军？",
    kanShanDialogue: "职业是目标，但时机也对。",
    nextStageAfterComplete: "CBA",
    choices: [
      {
        id: "cuba-draft-declare",
        text: "立刻申报选秀冲击职业",
        effects: { fame: 4, mental: 2, potential: 1, money: 5000 },
      },
      {
        id: "cuba-draft-wait",
        text: "再留一年打磨技术",
        effects: { basketballIQ: 3, shooting: 2, potential: 2, fame: -1 },
      },
      {
        id: "cuba-draft-train",
        text: "休赛期特训后再做决定",
        effects: { physical: 2, stamina: 3, defense: 1, mental: 1 },
      },
    ],
  },

  // —— CBA (4) ——
  {
    id: "cba-draft",
    stage: "CBA",
    visualType: "NONE",
    title: "CBA 选秀",
    description:
      "选秀夜灯光刺眼。你的名字被念出——职业生涯正式开始，合同与期望一同落下。",
    kanShanDialogue: "从北极到职业联赛，这只是真正开始。",
    choices: [
      {
        id: "cba-draft-showcase-skill",
        text: "试训秀进攻技术抢顺位",
        effects: { shooting: 2, finishing: 2, fame: 3, money: 20000 },
      },
      {
        id: "cba-draft-showcase-defense",
        text: "用防守态度打动球队",
        effects: { defense: 3, physical: 1, fame: 2, money: 15000 },
      },
      {
        id: "cba-draft-interview",
        text: "访谈强调可塑性与球商",
        effects: { basketballIQ: 2, mental: 3, zhihuReputation: 3, money: 12000 },
      },
    ],
  },
  {
    id: "cba-first-pro-camp",
    stage: "CBA",
    visualType: "DEFENSE",
    title: "第一次职业训练",
    description:
      "职业队训练强度、录像分析、营养与恢复一应俱全。你第一次明白：天赋只是入场券。",
    kanShanDialogue: "以前觉得自己够拼，现在才知道职业是什么意思。",
    choices: [
      {
        id: "cba-camp-skills",
        text: "加班加练投篮与脚步",
        effects: { shooting: 3, finishing: 2, stamina: -5 },
      },
      {
        id: "cba-camp-film",
        text: "跟教练组抠战术录像",
        effects: { basketballIQ: 4, passing: 1, mental: 1 },
      },
      {
        id: "cba-camp-body",
        text: "优先力量与恢复体系",
        effects: { physical: 3, stamina: 3, defense: 1 },
      },
    ],
  },
  {
    id: "cba-starting-battle",
    stage: "CBA",
    visualType: "DEFENSE",
    title: "首发竞争",
    description:
      "同位置老将仍在，教练公开说：谁能守住对位、谁能稳定贡献，谁就拿首发。",
    kanShanDialogue: "尊重前辈，但位置要用表现去要。",
    choices: [
      {
        id: "cba-start-score",
        text: "用稳定得分施压教练组",
        effects: { shooting: 2, finishing: 2, fame: 3, stamina: -3 },
      },
      {
        id: "cba-start-lockdown",
        text: "专吃对方箭头，防守上位",
        effects: { defense: 4, physical: 1, fame: 2, stamina: -4 },
      },
      {
        id: "cba-start-team",
        text: "做战术润滑剂赢信任",
        effects: { passing: 3, basketballIQ: 2, mental: 2 },
      },
    ],
  },
  {
    id: "cba-big-decision",
    stage: "CBA",
    visualType: "NONE",
    title: "职业生涯第一次重大选择",
    description:
      "球队摆上两条路：续约深耕国内冲击总冠军，或走出国门冲击更高舞台的试训机会。",
    kanShanDialogue: "我来职业不是为了停在舒适区。",
    nextStageAfterComplete: "NBA",
    choices: [
      {
        id: "cba-decision-champion",
        text: "留下冲击 CBA 总冠军",
        effects: {
          mental: 3,
          basketballIQ: 2,
          fame: 4,
          money: 50000,
          zhihuReputation: 3,
        },
      },
      {
        id: "cba-decision-overseas",
        text: "接受海外试训冲击更高联赛",
        effects: { potential: 3, physical: 2, fame: 5, mental: 1, money: 30000 },
      },
      {
        id: "cba-decision-balance",
        text: "短期留下，休赛期再赴海外",
        effects: { shooting: 2, defense: 1, stamina: 2, money: 40000, fame: 2 },
      },
    ],
  },

  // —— NBA (4) ——
  {
    id: "nba-draft",
    stage: "NBA",
    visualType: "NONE",
    title: "NBA 选秀",
    description:
      "布鲁克林的舞台比任何联赛都大。球衣还没穿上，镜头已经把你推到世界面前。",
    kanShanDialogue: "从冰原到这里——深呼吸，然后打球。",
    choices: [
      {
        id: "nba-draft-workout-offense",
        text: "试训展示投射与持球威胁",
        effects: { shooting: 3, finishing: 1, fame: 5, money: 100000 },
      },
      {
        id: "nba-draft-workout-two-way",
        text: "强调攻防一体与转换",
        effects: { defense: 2, physical: 2, fame: 4, money: 90000 },
      },
      {
        id: "nba-draft-media",
        text: "媒体日讲清故事与心态",
        effects: {
          mental: 3,
          zhihuReputation: 5,
          fame: 3,
          money: 80000,
        },
      },
    ],
  },
  {
    id: "nba-summer-league",
    stage: "NBA",
    visualType: "NONE",
    title: "夏季联赛",
    description:
      "拉斯维加斯的夏联是新人战场：球权更多，容错更少，教练组在评估你的地板与天花板。",
    kanShanDialogue: "这里每个人都想被看见。那就用比赛说话。",
    choices: [
      {
        id: "nba-summer-hero",
        text: "承担终结权，冲击数据",
        effects: { finishing: 3, shooting: 2, fame: 3, stamina: -5, mental: -1 },
      },
      {
        id: "nba-summer-system",
        text: "按 NBA 体系跑位学习",
        effects: { basketballIQ: 4, passing: 2, potential: 1 },
      },
      {
        id: "nba-summer-defense",
        text: "先靠防守与体力站稳轮换",
        effects: { defense: 3, stamina: 2, physical: 1, fame: 1 },
      },
    ],
  },
  {
    id: "nba-regular-season",
    stage: "NBA",
    visualType: "SHOOT",
    title: "NBA 常规赛",
    description:
      "82 场漫长旅程。背靠背、时区、身体对抗、角色定位——每一场都在重新定义你是谁。",
    kanShanDialogue: "职业不是一夜爆红，是八十二次证明。",
    choices: [
      {
        id: "nba-rs-specialist",
        text: "做定点空间型射手",
        effects: { shooting: 4, basketballIQ: 1, fame: 2, stamina: -3 },
      },
      {
        id: "nba-rs-connector",
        text: "做连接者提升球队净效率",
        effects: { passing: 3, basketballIQ: 3, mental: 2 },
      },
      {
        id: "nba-rs-two-way",
        text: "攻防两端抢脏活上位",
        effects: { defense: 3, physical: 2, stamina: -4, fame: 2 },
      },
    ],
  },
  {
    id: "nba-playoff-game",
    stage: "NBA",
    visualType: "NONE",
    title: "季后赛关键比赛",
    description:
      "季后赛 G5，胜者晋级。对手针对性极强，裁判尺度更紧，观众声浪几乎要把地板掀翻。",
    kanShanDialogue: "关键球，我接。",
    nextStageAfterComplete: "NATIONAL_TEAM",
    choices: [
      {
        id: "nba-po-clutch-shot",
        text: "关键投篮自己出手",
        effects: { shooting: 3, mental: 4, fame: 6, stamina: -3 },
      },
      {
        id: "nba-po-drive",
        text: "冲击篮筐造杀伤",
        effects: { finishing: 3, physical: 2, fame: 5, stamina: -4 },
      },
      {
        id: "nba-po-trust",
        text: "信任体系，找到最佳出手点",
        effects: { passing: 2, basketballIQ: 4, fame: 4, zhihuReputation: 3 },
      },
    ],
  },

  // —— NATIONAL_TEAM (3) ——
  {
    id: "nt-camp",
    stage: "NATIONAL_TEAM",
    visualType: "NONE",
    title: "国家队集训",
    description:
      "红衣入营。位置竞争激烈，战术用语与俱乐部不同，荣誉感与压力同时拉满。",
    kanShanDialogue: "这身队服，比任何合同都重。",
    choices: [
      {
        id: "nt-camp-role",
        text: "快速吃透国家队战术角色",
        effects: { basketballIQ: 3, passing: 2, mental: 2 },
      },
      {
        id: "nt-camp-condition",
        text: "把身体状态调到巅峰",
        effects: { stamina: 4, physical: 2, defense: 1 },
      },
      {
        id: "nt-camp-shooting",
        text: "加练国际赛场空间投射",
        effects: { shooting: 3, finishing: 1, stamina: -2, fame: 1 },
      },
    ],
  },
  {
    id: "nt-asia",
    stage: "NATIONAL_TEAM",
    visualType: "DEFENSE",
    title: "亚洲赛场",
    description:
      "亚洲赛场节奏更快、身体接触更多。你需要在国家队体系里证明自己配得上球衣。",
    kanShanDialogue: "代表的不只是自己，是身后那片冰原和整个国家。",
    choices: [
      {
        id: "nt-asia-score",
        text: "成为稳定得分点",
        effects: { shooting: 2, finishing: 2, fame: 4, zhihuReputation: 3 },
      },
      {
        id: "nt-asia-lock",
        text: "盯防对方核心",
        effects: { defense: 4, physical: 1, fame: 3, stamina: -3 },
      },
      {
        id: "nt-asia-lead",
        text: "场上指挥与情绪稳定器",
        effects: { basketballIQ: 2, mental: 4, passing: 1, zhihuReputation: 4 },
      },
    ],
  },
  {
    id: "nt-world-final",
    stage: "NATIONAL_TEAM",
    visualType: "CHAMPION",
    title: "国际大赛决赛",
    description:
      "国际大赛决赛夜。哨响之前，你回想起北极的第一下运球——然后走向中圈。",
    kanShanDialogue: "无论结局如何，这球，我打完。",
    nextStageAfterComplete: "RETIRED",
    choices: [
      {
        id: "nt-final-hero",
        text: "关键球亲自终结",
        effects: { shooting: 2, finishing: 2, mental: 5, fame: 8, stamina: -4 },
      },
      {
        id: "nt-final-team",
        text: "把队友带到最佳位置",
        effects: {
          passing: 3,
          basketballIQ: 3,
          mental: 4,
          fame: 6,
          zhihuReputation: 5,
        },
      },
      {
        id: "nt-final-wall",
        text: "最后一防赌上一切",
        effects: {
          defense: 4,
          physical: 2,
          mental: 4,
          fame: 7,
          stamina: -5,
        },
      },
    ],
  },
];

export function getEventsByStage(stage: GameEvent["stage"]): GameEvent[] {
  return CAREER_EVENTS.filter((event) => event.stage === stage);
}

export function getEventById(eventId: string): GameEvent | undefined {
  return CAREER_EVENTS.find((event) => event.id === eventId);
}
