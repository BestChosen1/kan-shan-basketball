import type { Choice, GameEvent } from "../types.ts";
import { NBA_ARC_SENTINEL } from "../nba-arc.ts";

function C(
  id: string,
  text: string,
  bag: Choice["effects"] &
    Pick<
      Partial<Choice>,
      | "intent"
      | "nextEventId"
      | "nextStage"
      | "setFlags"
      | "clearFlags"
      | "advanceNbaSeason"
    > = {},
  extra: Partial<Choice> = {},
): Choice {
  const merged = { ...bag, ...extra };
  const effects: Choice["effects"] = {};
  for (const [key, value] of Object.entries(merged)) {
    if (
      key === "intent" ||
      key === "nextEventId" ||
      key === "nextStage" ||
      key === "setFlags" ||
      key === "clearFlags" ||
      key === "advanceNbaSeason" ||
      key === "id" ||
      key === "text" ||
      key === "effects" ||
      value === undefined
    ) {
      continue;
    }
    (effects as Record<string, number>)[key] = value as number;
  }
  return {
    id,
    text,
    effects,
    intent: merged.intent,
    nextEventId: merged.nextEventId,
    nextStage: merged.nextStage,
    setFlags: merged.setFlags,
    clearFlags: merged.clearFlags,
    advanceNbaSeason: merged.advanceNbaSeason,
  };
}

/**
 * NBA 核心模拟：
 * 新秀线 → 多赛季循环（开营→弧光早期→常规赛→弧光中段→弧光晚期→季后赛→休赛期）
 * 弧光阶段由年龄 + OVR 动态决定，同赛季骨架下事件内容不同。
 */
export const NBA_EVENTS: GameEvent[] = [
  {
    id: "nba-draft",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "DRAFT",
    draftConfig: { league: "NBA" },
    requiresFlags: ["NBA_BOUND"],
    nextEventId: "nba-summer-league",
    title: "NBA 选秀",
    description:
      "布鲁克林的舞台比任何联赛都大。球衣还没穿上，镜头已经把你推到世界面前。",
    kanShanDialogue: "从冰原到这里——深呼吸，然后打球。",
    choices: [
      C(
        "nba-draft-workout-offense",
        "试训展示投射与持球威胁",
        { shooting: 3, finishing: 1, fame: 5, money: 100000, draftStock: 4 },
        { intent: "DECLARE" },
      ),
      C(
        "nba-draft-workout-two-way",
        "强调攻防一体与转换",
        { defense: 2, physical: 2, fame: 4, money: 90000 },
        { intent: "DECLARE" },
      ),
      C(
        "nba-draft-media",
        "媒体日讲清故事与心态",
        { mental: 3, zhihuReputation: 5, fame: 3, money: 80000 },
        { intent: "WAIT" },
      ),
    ],
  },
  {
    id: "nba-summer-league",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 58, stakes: "REGULAR" },
    nextEventId: "nba-roster-crunch",
    title: "夏季联赛",
    description:
      "拉斯维加斯的夏联是新人战场：球权更多，容错更少，教练组在评估你的地板与天花板。",
    kanShanDialogue: "这里每个人都想被看见。那就用比赛说话。",
    choices: [
      C(
        "nba-summer-hero",
        "承担终结权，冲击数据",
        { finishing: 3, shooting: 2, fame: 3, stamina: -5, mental: -1 },
        { intent: "SCORE" },
      ),
      C(
        "nba-summer-system",
        "按 NBA 体系跑位学习",
        { basketballIQ: 4, passing: 2, potential: 1 },
        { intent: "SAFE" },
      ),
      C(
        "nba-summer-defense",
        "先靠防守与体力站稳轮换",
        { defense: 3, stamina: 2, physical: 1, fame: 1 },
        { intent: "DEFEND" },
      ),
    ],
  },
  {
    id: "nba-roster-crunch",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    title: "裁员名单前夜",
    description:
      "开季名单只剩两个名额。总经理约谈：你可能留下，也可能被裁后转 G 联赛或回国。",
    kanShanDialogue: "名额很残酷，但它比谎言干净。",
    choices: [
      C(
        "nba-roster-earn",
        "最后一场对抗拼到抽筋",
        { physical: 2, defense: 2, stamina: -6, mental: 2 },
        { nextEventId: "nba-season-tipoff" },
      ),
      C(
        "nba-roster-accept-g",
        "接受发展联赛历练",
        { mental: 1, potential: 2, fame: -2 },
        { nextEventId: "nba-gleague-grind" },
      ),
      C(
        "nba-roster-bust",
        "心态崩溃表现失常",
        { mental: -5, fame: -4, draftStock: -8 },
        {
          setFlags: ["NBA_BUST"],
          clearFlags: ["NBA_BOUND"],
          nextEventId: "cba-bust-return",
        },
      ),
    ],
  },
  {
    id: "nba-gleague-grind",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    matchConfig: { opponentStrength: 62, stakes: "REGULAR" },
    nextEventId: "nba-season-tipoff",
    title: "发展联赛征途",
    description:
      "巴士、小馆、更少镜头。你要在这里把自己重新打造成「可上场的轮换」。",
    kanShanDialogue: "小馆也能出大事。",
    choices: [
      C(
        "nba-g-score",
        "场场冲击高效得分",
        { shooting: 3, finishing: 2, stamina: -4 },
        { intent: "SCORE" },
      ),
      C(
        "nba-g-two-way",
        "攻防两端抢存在感",
        { defense: 3, physical: 2, fame: 1 },
        { intent: "DEFEND" },
      ),
      C(
        "nba-g-whine",
        "抱怨舞台太小",
        { mental: -4, fame: -2, potential: -1 },
        { intent: "RISK" },
      ),
    ],
  },

  // —— 赛季循环主干（按弧光阶段分流 early/mid/late）——
  {
    id: "nba-season-tipoff",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: NBA_ARC_SENTINEL.early,
    title: "新赛季开营",
    description:
      "又一个 NBA 赛季开始了。训练营里新人换血、体系微调——你此刻的生涯阶段，决定了教练白板上写给你的关键词。",
    kanShanDialogue: "新赛季，旧球鞋——把脚再磨出茧。",
    choices: [
      C("nba-tip-work", "加练投射与脚步", {
        shooting: 2,
        finishing: 1,
        stamina: -2,
      }),
      C("nba-tip-film", "研究对手与体系", {
        basketballIQ: 3,
        passing: 1,
        mental: 1,
      }),
      C("nba-tip-media", "媒体日讲目标", {
        fame: 2,
        zhihuReputation: 2,
        mental: 1,
      }),
    ],
  },

  // —— 新秀 ——
  {
    id: "nba-arc-rookie-wall",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-regular-season",
    title: "新秀墙来袭",
    description:
      "赛程过半前，身体与阅读速度同时掉线。老将说「每个人都会撞墙」，教练只问你能不能爬过去。",
    kanShanDialogue: "墙不是终点，是考卷。",
    choices: [
      C("nba-rw-film", "加练录像补防守轮转", {
        basketballIQ: 3,
        defense: 1,
        stamina: -2,
      }),
      C("nba-rw-rest", "主动申请减负恢复", {
        stamina: 4,
        physical: 1,
        fame: -1,
      }),
      C("nba-rw-force", "硬撑刷数据证明自己", {
        shooting: 2,
        fame: 2,
        stamina: -5,
        mental: -2,
      }),
    ],
  },
  {
    id: "nba-arc-rookie-coach",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: NBA_ARC_SENTINEL.late,
    title: "教练组特训",
    description:
      "助教把你留到深夜：挡拆阅读、弱侧补防、底角出手选择。新秀的成长，往往发生在空荡球馆。",
    kanShanDialogue: "多听一句，少错一轮。",
    choices: [
      C("nba-rc-absorb", "虚心吃透每个细节", {
        basketballIQ: 4,
        passing: 1,
        mental: 2,
      }),
      C("nba-rc-ask", "主动要更多球权练习", {
        finishing: 2,
        fame: 1,
        mental: 1,
        stamina: -2,
      }),
      C("nba-rc-resist", "觉得被管太严而抵触", {
        mental: -3,
        fame: -1,
        potential: -1,
      }),
    ],
  },
  {
    id: "nba-arc-rookie-showcase",
    stage: "NBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 64, stakes: "REGULAR" },
    nextEventId: "nba-playoff-game",
    title: "新秀展示之夜",
    description:
      "主帅破例给你大分钟。球探席坐满，国内直播弹幕刷屏——这是你第一次被当成「答案」而不是「问题」。",
    kanShanDialogue: "别想选秀顺位，想下一回合。",
    choices: [
      C(
        "nba-rs-show-score",
        "大胆持球创造",
        { shooting: 3, finishing: 2, fame: 3, stamina: -4 },
        { intent: "SCORE" },
      ),
      C(
        "nba-rs-show-team",
        "按体系做对的事",
        { passing: 3, basketballIQ: 2, fame: 1 },
        { intent: "TEAM" },
      ),
      C(
        "nba-rs-show-def",
        "用防守换信任",
        { defense: 3, physical: 2, stamina: -3 },
        { intent: "DEFEND" },
      ),
    ],
  },

  // —— 轮换 ——
  {
    id: "nba-arc-rotation-minutes",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-regular-season",
    title: "轮换分钟争夺",
    description:
      "同样位置还有两人排队。你的价值不在首发发布会，而在第二节谁先被叫上场。",
    kanShanDialogue: "分钟是货币，表现是汇率。",
    choices: [
      C("nba-rot-min-ready", "保持随时可上场的状态", {
        stamina: 3,
        defense: 1,
        mental: 1,
      }),
      C("nba-rot-min-special", "练死一个绝技", {
        shooting: 3,
        stamina: -2,
        fame: 1,
      }),
      C("nba-rot-min-complain", "抱怨角色不清", {
        fame: 1,
        mental: -3,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
  {
    id: "nba-arc-rotation-spark",
    stage: "NBA",
    visualType: "CELEBRATE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 64, stakes: "REGULAR" },
    nextEventId: NBA_ARC_SENTINEL.late,
    title: "替补点火之战",
    description:
      "主力陷入泥潭，教练把你推上火线。你要做的是点燃第二节，而不是抢戏。",
    kanShanDialogue: "火花不用很大，但要烧得及时。",
    choices: [
      C(
        "nba-rot-spark-score",
        "连续出手撕开僵局",
        { shooting: 3, fame: 2, stamina: -3 },
        { intent: "SCORE" },
      ),
      C(
        "nba-rot-spark-energy",
        "防守与篮板拉高能量",
        { defense: 3, physical: 2, stamina: -4 },
        { intent: "DEFEND" },
      ),
      C(
        "nba-rot-spark-safe",
        "稳妥执行少犯错",
        { basketballIQ: 2, mental: 2, passing: 1 },
        { intent: "SAFE" },
      ),
    ],
  },
  {
    id: "nba-arc-rotation-prove",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-playoff-game",
    title: "证明自己的窗口",
    description:
      "交易截止日前，流言把你写成筹码。你能做的只有：在仅有的窗口里打出不可替代。",
    kanShanDialogue: "名字在传闻里，球权还在场上。",
    choices: [
      C("nba-rot-prove-lock", "锁死对位完成任务", {
        defense: 3,
        mental: 2,
        fame: 1,
      }),
      C("nba-rot-prove-ask", "约谈教练要清晰定位", {
        basketballIQ: 2,
        mental: 2,
        fame: 1,
      }),
      C("nba-rot-prove-noise", "放话回应交易传闻", {
        fame: 3,
        zhihuReputation: -2,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },

  // —— 首发 ——
  {
    id: "nba-arc-starter-weight",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-regular-season",
    title: "首发责任加重",
    description:
      "你的名字留在首发五人。随之而来的是对位核心、赛后发布会，以及「带队失败」的锅。",
    kanShanDialogue: "首发不是荣誉，是账单。",
    choices: [
      C("nba-st-weight-lead", "主动承担场上沟通", {
        passing: 2,
        mental: 3,
        basketballIQ: 1,
      }),
      C("nba-st-weight-craft", "打磨稳定进攻套餐", {
        shooting: 2,
        finishing: 2,
        stamina: -2,
      }),
      C("nba-st-weight-hide", "关键回合把球让出去", {
        mental: -2,
        fame: -1,
        passing: 1,
      }),
    ],
  },
  {
    id: "nba-arc-starter-media",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: NBA_ARC_SENTINEL.late,
    title: "首发媒体日压力",
    description:
      "记者追问胜负责任与合同年。国内栏目把你和更响的名字对比，评论区比防守轮转还密。",
    kanShanDialogue: "问题可以尖锐，回答必须清醒。",
    choices: [
      C("nba-st-media-calm", "克制回应，把焦点拉回比赛", {
        mental: 3,
        zhihuReputation: 2,
        fame: 1,
      }),
      C("nba-st-media-fire", "用硬话刺激自己", {
        fame: 3,
        mental: -1,
        potential: 1,
      }),
      C("nba-st-media-scroll", "深夜刷黑评内耗", {
        mental: -4,
        stamina: -2,
        fame: -1,
      }),
    ],
  },
  {
    id: "nba-arc-starter-lock",
    stage: "NBA",
    visualType: "DEFENSE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 68, stakes: "REGULAR" },
    nextEventId: "nba-playoff-game",
    title: "锁死对位之夜",
    description:
      "对面当家球星点名打你。教练组只要一件事：让他今晚不好受。",
    kanShanDialogue: "防守赢信任，比得分快。",
    choices: [
      C(
        "nba-st-lock-deny",
        "全场领防消耗",
        { defense: 4, physical: 2, stamina: -5, fame: 2 },
        { intent: "DEFEND" },
      ),
      C(
        "nba-st-lock-help",
        "团队协防体系优先",
        { basketballIQ: 3, passing: 1, defense: 1 },
        { intent: "TEAM" },
      ),
      C(
        "nba-st-lock-trade",
        "对攻赌效率",
        { shooting: 3, finishing: 1, stamina: -4, mental: -1 },
        { intent: "RISK" },
      ),
    ],
  },

  // —— 全明星 ——
  {
    id: "nba-arc-as-expectation",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-regular-season",
    title: "全明星级期待",
    description:
      "票选榜单有你的名字。期待值抬高后，普通的高效夜晚会被说成「状态下滑」。",
    kanShanDialogue: "被期待，是能力税。",
    choices: [
      C("nba-as-exp-steady", "维持节奏不追热搜", {
        mental: 3,
        basketballIQ: 1,
        fame: 1,
      }),
      C("nba-as-exp-push", "加练冲击更高天花板", {
        shooting: 2,
        finishing: 1,
        stamina: -3,
        potential: 1,
      }),
      C("nba-as-exp-brand", "加大商业曝光", {
        fame: 4,
        money: 25000,
        stamina: -2,
        basketballIQ: -1,
      }),
    ],
  },
  {
    id: "nba-arc-as-campaign",
    stage: "NBA",
    visualType: "CELEBRATE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: NBA_ARC_SENTINEL.late,
    title: "全明星竞选噪音",
    description:
      "球队公关推投票，球迷组织拉票，对手暗示「水分」。你要决定：参与喧嚣，还是用比赛投票。",
    kanShanDialogue: "票在网上，球在筐里。",
    choices: [
      C("nba-as-camp-play", "拒绝过多宣传，多打球", {
        shooting: 2,
        mental: 2,
        fame: -1,
      }),
      C("nba-as-camp-engage", "配合拉票与公益行程", {
        fame: 4,
        zhihuReputation: 2,
        stamina: -3,
      }),
      C("nba-as-camp-clapback", "回击质疑言论", {
        fame: 2,
        mental: -2,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
  {
    id: "nba-arc-as-statement",
    stage: "NBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 70, stakes: "REGULAR" },
    nextEventId: "nba-playoff-game",
    title: "全明星级宣言战",
    description:
      "全国转播夜。解说反复提到你的选票——你需要一场配得上讨论的比赛。",
    kanShanDialogue: "让讨论变成录像。",
    choices: [
      C(
        "nba-as-state-score",
        "全程高用量进攻",
        { shooting: 4, fame: 4, stamina: -5 },
        { intent: "SCORE" },
      ),
      C(
        "nba-as-state-two",
        "攻防两端造亮点",
        { defense: 3, finishing: 2, fame: 3, stamina: -4 },
        { intent: "DEFEND" },
      ),
      C(
        "nba-as-state-team",
        "带动全队净效率",
        { passing: 3, basketballIQ: 3, fame: 2 },
        { intent: "TEAM" },
      ),
    ],
  },

  // —— 超级巨星 ——
  {
    id: "nba-arc-super-target",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-regular-season",
    title: "被联盟针对",
    description:
      "对手为你准备专属防守策略，裁判尺度更紧，镜头更爱抓你的表情。巨星税开始征收。",
    kanShanDialogue: "被针对，说明值得。",
    choices: [
      C("nba-su-target-adapt", "变化出手点与节奏", {
        basketballIQ: 3,
        shooting: 2,
        mental: 1,
      }),
      C("nba-su-target-bully", "用身体硬解包夹", {
        physical: 3,
        finishing: 2,
        stamina: -4,
      }),
      C("nba-su-target-frustrate", "抱怨哨子与针对", {
        fame: 2,
        mental: -3,
        setFlags: ["MEDIA_BACKLASH"],
      }),
    ],
  },
  {
    id: "nba-arc-mvp-race",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: NBA_ARC_SENTINEL.late,
    title: "MVP 讨论漩涡",
    description:
      "专栏开始写你的名字。有人说数据撑得住，有人说球队战绩不够。漩涡里每一步都会被放大。",
    kanShanDialogue: "奖项是结果，过程仍是下一场。",
    choices: [
      C("nba-mvp-focus", "屏蔽噪音只盯净效率", {
        basketballIQ: 3,
        mental: 3,
        fame: 1,
      }),
      C("nba-mvp-stat", "适度追求关键数据", {
        shooting: 2,
        fame: 3,
        passing: -1,
        stamina: -2,
      }),
      C("nba-mvp-load", "为长期健康接受轮休争议", {
        stamina: 4,
        fame: -2,
        mental: 1,
      }),
    ],
  },
  {
    id: "nba-arc-legacy-night",
    stage: "NBA",
    visualType: "CHAMPION",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 72, stakes: "PLAYOFF" },
    nextEventId: "nba-playoff-game",
    title: "王朝级焦点战",
    description:
      "这不是普通对位，是叙事之战。胜者写入赛季故事线，负者变成「还能不能算超巨」的注脚。",
    kanShanDialogue: "故事我写，笔是比赛。",
    choices: [
      C(
        "nba-leg-hero",
        "关键回合亲自终结",
        { shooting: 3, mental: 4, fame: 5, stamina: -4 },
        { intent: "SCORE" },
      ),
      C(
        "nba-leg-trust",
        "信任体系制造空位",
        { passing: 3, basketballIQ: 4, fame: 3 },
        { intent: "TEAM" },
      ),
      C(
        "nba-leg-wall",
        "用防守定调整场",
        { defense: 4, physical: 2, fame: 3, stamina: -5 },
        { intent: "DEFEND" },
      ),
    ],
  },

  // —— 老将 ——
  {
    id: "nba-arc-vet-body",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: "nba-regular-season",
    title: "老将的身体账本",
    description:
      "训练师把恢复分钟表拍在你面前。经验还在巅峰，爆发力却开始谈条件。",
    kanShanDialogue: "懂自己的身体，也是一种球商。",
    choices: [
      C("nba-vet-body-science", "严格执行恢复与力量方案", {
        stamina: 4,
        physical: 1,
        mental: 1,
      }),
      C("nba-vet-body-minutes", "与教练协商负荷管理", {
        mental: 2,
        basketballIQ: 1,
        fame: -1,
      }),
      C("nba-vet-body-stubborn", "拒绝减负硬打", {
        fame: 2,
        stamina: -5,
        physical: -2,
        setFlags: ["INJURY_PRONE"],
      }),
    ],
  },
  {
    id: "nba-arc-vet-mentor",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    nextEventId: NBA_ARC_SENTINEL.late,
    title: "更衣室导师",
    description:
      "新人看你的眼神变了：你是活的战术手册。带人会分走精力，但也能延长你的价值曲线。",
    kanShanDialogue: "把走过的坑填平，后人少摔。",
    choices: [
      C("nba-vet-men-teach", "系统带教挡拆与站位", {
        basketballIQ: 3,
        passing: 2,
        mental: 2,
      }),
      C("nba-vet-men-compete", "训练里继续正面硬刚", {
        physical: 2,
        defense: 1,
        fame: 1,
      }),
      C("nba-vet-men-distance", "保持距离专注残留巅峰", {
        shooting: 2,
        mental: -1,
        fame: -1,
      }),
    ],
  },
  {
    id: "nba-arc-vet-ring",
    stage: "NBA",
    visualType: "CHAMPION",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 70, stakes: "PLAYOFF" },
    nextEventId: "nba-playoff-game",
    title: "为戒指而战",
    description:
      "窗口期越来越窄。你不再需要证明天赋，只需要证明：这赛季的故事配得上一枚戒指。",
    kanShanDialogue: "戒指不是装饰，是收据。",
    choices: [
      C(
        "nba-vet-ring-role",
        "甘做拼图完成脏活",
        { defense: 3, passing: 2, mental: 3, fame: 2 },
        { intent: "TEAM" },
      ),
      C(
        "nba-vet-ring-iso",
        "关键时刻仍要球",
        { shooting: 3, mental: 3, fame: 3, stamina: -3 },
        { intent: "SCORE" },
      ),
      C(
        "nba-vet-ring-calm",
        "稳住情绪与节奏",
        { mental: 4, basketballIQ: 2, fame: 1 },
        { intent: "SAFE" },
      ),
    ],
  },

  {
    id: "nba-regular-season",
    stage: "NBA",
    visualType: "SHOOT",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 66, stakes: "REGULAR" },
    nextEventId: NBA_ARC_SENTINEL.mid,
    title: "NBA 常规赛",
    description:
      "漫长赛季里的一场关键战。背靠背、时区、身体对抗、角色定位——每一次出手都在重新定义你是谁。",
    kanShanDialogue: "职业不是一夜爆红，是一场场证明。",
    choices: [
      C(
        "nba-rs-specialist",
        "做定点空间型射手",
        { shooting: 4, basketballIQ: 1, fame: 2, stamina: -3 },
        { intent: "SCORE" },
      ),
      C(
        "nba-rs-connector",
        "做连接者提升球队净效率",
        { passing: 3, basketballIQ: 3, mental: 2 },
        { intent: "TEAM" },
      ),
      C(
        "nba-rs-two-way",
        "攻防两端抢脏活上位",
        { defense: 3, physical: 2, stamina: -4, fame: 2 },
        { intent: "DEFEND" },
      ),
    ],
  },
  {
    id: "nba-playoff-game",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "MATCH",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    matchConfig: { opponentStrength: 72, stakes: "PLAYOFF" },
    nextEventId: "nba-offseason",
    title: "季后赛关键比赛",
    description:
      "季后赛关键战。对手针对性极强，裁判尺度更紧，观众声浪几乎要把地板掀翻。",
    kanShanDialogue: "关键球，我接。",
    choices: [
      C(
        "nba-po-clutch-shot",
        "关键投篮自己出手",
        { shooting: 3, mental: 4, fame: 6, stamina: -3 },
        { intent: "SCORE" },
      ),
      C(
        "nba-po-drive",
        "冲击篮筐造杀伤",
        { finishing: 3, physical: 2, fame: 5, stamina: -4 },
        { intent: "RISK" },
      ),
      C(
        "nba-po-trust",
        "信任体系，找到最佳出手点",
        { passing: 2, basketballIQ: 4, fame: 4, zhihuReputation: 3 },
        { intent: "TEAM" },
      ),
    ],
  },
  {
    id: "nba-offseason",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    title: "休赛期抉择",
    description:
      "一个赛季落下帷幕。你可以再战一季、接受国家队征召窗口，或体面退役。NBA 生涯的长度，往往在这一页改写。",
    kanShanDialogue: "还想打多久？身体和心，要一起点头。",
    choices: [
      C(
        "nba-off-continue",
        "再战一个 NBA 赛季",
        { mental: 2, stamina: 2, potential: 1 },
        {
          advanceNbaSeason: true,
          nextEventId: "nba-season-tipoff",
        },
      ),
      C(
        "nba-off-national",
        "接受国家队征召（可选）",
        { fame: 3, zhihuReputation: 4, mental: 2 },
        {
          setFlags: ["NT_CALLED"],
          clearFlags: ["NT_DONE"],
          nextStage: "NATIONAL_TEAM",
        },
      ),
      C(
        "nba-off-retire",
        "宣布退役",
        { mental: 1, fame: 2 },
        { nextStage: "RETIRED" },
      ),
    ],
  },
  {
    id: "nba-injury-shutdown",
    stage: "NBA",
    visualType: "NONE",
    eventKind: "STORY",
    requiresFlags: ["INJURY_PRONE", "NBA_BOUND"],
    excludesFlags: ["NBA_BUST"],
    title: "赛季报销阴影",
    description:
      "扫描结果显示累积劳损。队医建议赛季报销，你也可以选择带伤打。",
    kanShanDialogue: "职业生涯很长，但膝盖只有一双。",
    choices: [
      C(
        "nba-inj-rest",
        "接受赛季报销，直接进入休赛期",
        { stamina: 5, physical: 1, fame: -3, mental: -1 },
        { nextEventId: "nba-offseason" },
      ),
      C(
        "nba-inj-play",
        "带伤继续冲击季后赛",
        { fame: 3, physical: -4, stamina: -4, mental: 2 },
        { nextEventId: "nba-playoff-game" },
      ),
      C(
        "nba-inj-retire",
        "宣布退役",
        { mental: -2, fame: 1 },
        { setFlags: ["EARLY_RETIRE"], nextStage: "RETIRED" },
      ),
    ],
  },
];
