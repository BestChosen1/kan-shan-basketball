"use client";

import { useState } from "react";
import {
  applyChoice,
  createInitialPlayer,
  getCurrentEvent,
  isCareerFinished,
  restartCareer,
  STAGE_LABEL,
  type PlayerState,
} from "@/game";

const SKILL_ROWS = [
  { key: "shooting", label: "投篮" },
  { key: "finishing", label: "终结" },
  { key: "passing", label: "传球" },
  { key: "defense", label: "防守" },
  { key: "physical", label: "身体" },
  { key: "basketballIQ", label: "球商" },
] as const;

function StatLine({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-200 py-1 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-900">{value}</span>
    </div>
  );
}

export default function Home() {
  const [player, setPlayer] = useState<PlayerState>(() => createInitialPlayer());
  const event = getCurrentEvent(player);
  const finished = isCareerFinished(player);

  function handleChoice(choiceId: string) {
    setPlayer((current) => applyChoice(current, choiceId));
  }

  function handleRestart() {
    setPlayer(restartCareer());
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-100 text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="space-y-1">
          <p className="text-sm text-zinc-500">看山篮球生涯模拟器 · Step 2 验证</p>
          <h1 className="text-3xl font-semibold tracking-tight">{player.name}</h1>
          <p className="text-zinc-600">
            {STAGE_LABEL[player.stage]} · {player.team}
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              状态
            </h2>
            <StatLine label="阶段" value={STAGE_LABEL[player.stage]} />
            <StatLine label="球队" value={player.team} />
            <StatLine label="Overall" value={player.overall} />
            <StatLine label="年龄" value={player.age} />
            <StatLine label="体能" value={player.stamina} />
            <StatLine label="名气" value={player.fame} />
            <StatLine label="金钱" value={player.money} />
            <StatLine label="历史事件" value={player.careerHistory.length} />
          </div>

          <div className="space-y-1 rounded-lg bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              六项属性
            </h2>
            {SKILL_ROWS.map((row) => (
              <StatLine key={row.key} label={row.label} value={player[row.key]} />
            ))}
          </div>
        </section>

        {finished || !event ? (
          <section className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">生涯结束</h2>
            <p className="text-zinc-600">
              刘看山已完成从北极到国家队的旅程，现已退役。共经历{" "}
              {player.careerHistory.length} 个关键事件。
            </p>
            <p className="text-sm text-zinc-500">
              最终 Overall {player.overall} · 名气 {player.fame} · 知乎声望{" "}
              {player.zhihuReputation}
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              重新开始生涯
            </button>
          </section>
        ) : (
          <section className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                当前事件 · {event.id}
              </p>
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-zinc-700">{event.description}</p>
              <blockquote className="border-l-2 border-zinc-300 pl-3 text-sm italic text-zinc-600">
                看山：{event.kanShanDialogue}
              </blockquote>
            </div>

            <div className="flex flex-col gap-2">
              {event.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleChoice(choice.id)}
                  className="rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3 text-left text-sm hover:border-zinc-900 hover:bg-white"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
