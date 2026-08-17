"use client";

import { useMemo, useRef, useState } from "react";
import { CareerCover } from "@/components/career-cover";
import { CareerEndingArchive } from "@/components/career-ending-archive";
import { CareerEndingCeremony } from "@/components/career-ending-ceremony";
import { CareerEvent } from "@/components/career-event";
import { CareerHeader } from "@/components/career-header";
import { CareerInfo } from "@/components/career-info";
import { CareerTimeline } from "@/components/career-timeline";
import {
  GameResultOverlay,
  type PendingGameResult,
} from "@/components/game-result-overlay";
import {
  computeStatDeltas,
  getStageTransitionCopy,
} from "@/components/career-ui";
import { PlayerCard } from "@/components/player-card";
import { PlayerStats } from "@/components/player-stats";
import { StageTransitionOverlay } from "@/components/stage-transition-overlay";
import { ZhihuContextCard } from "@/components/zhihu-context-card";
import {
  mapCareerAgentOutputToCardStatus,
  requestCareerAgent,
  shouldRequestCareerAgent,
} from "@/lib/career-agent-client";
import type {
  CareerAgentClientContext,
  CareerAgentClientOutput,
  ZhihuCardStatus,
} from "@/lib/career-agent-types";
import {
  applyChoice,
  CAREER_STAGE_ORDER,
  createInitialPlayer,
  getCurrentEvent,
  isCareerFinished,
  type CareerStage,
  type GameEvent,
  type PlayerState,
} from "@/game";

interface StageTransitionState {
  from: CareerStage;
  to: CareerStage;
}

type EndingPhase = "idle" | "ceremony" | "archive";

function buildPlayerSnapshot(player: PlayerState) {
  return {
    name: player.name,
    age: player.age,
    team: player.team,
    overall: player.overall,
    role: player.role,
  };
}

function buildCareerAgentContext(input: {
  player: PlayerState;
  event: GameEvent;
  reason: "MATCH" | "DRAFT" | "STAGE_CHANGE" | "CAREER_COMPLETE";
}): CareerAgentClientContext {
  const { player, event, reason } = input;
  const base: CareerAgentClientContext = {
    stage: player.stage,
    eventId: event.id,
    eventTitle: event.title,
    eventDescription: event.description,
    player: buildPlayerSnapshot(player),
    trigger:
      reason === "STAGE_CHANGE"
        ? "STAGE_CHANGE"
        : reason === "CAREER_COMPLETE"
          ? "CAREER_COMPLETE"
          : "EVENT_RESULT",
  };

  if (reason === "MATCH" && player.lastOutcome?.kind === "MATCH") {
    base.match = {
      won: player.lastOutcome.result.won,
      performance: player.lastOutcome.result.performance,
    };
  }

  if (reason === "DRAFT" && player.lastOutcome?.kind === "DRAFT") {
    base.draft = {
      league: player.lastOutcome.result.league,
      pick: player.lastOutcome.result.pick,
      teamName: player.lastOutcome.result.teamName,
    };
  }

  return base;
}

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [player, setPlayer] = useState<PlayerState>(() => createInitialPlayer());
  const [displayPlayer, setDisplayPlayer] = useState<PlayerState>(() =>
    createInitialPlayer(),
  );
  const [pendingResult, setPendingResult] = useState<PendingGameResult | null>(
    null,
  );
  const [stageTransition, setStageTransition] =
    useState<StageTransitionState | null>(null);
  const [endingPhase, setEndingPhase] = useState<EndingPhase>("idle");
  const [isBusy, setIsBusy] = useState(false);
  const [zhihuStatus, setZhihuStatus] = useState<ZhihuCardStatus>("idle");
  const [zhihuResult, setZhihuResult] =
    useState<CareerAgentClientOutput | null>(null);

  const zhihuRequestIdRef = useRef(0);
  const zhihuAbortRef = useRef<AbortController | null>(null);

  const event = getCurrentEvent(displayPlayer);
  const finished =
    isCareerFinished(displayPlayer) && !pendingResult && !stageTransition;
  const showCeremony = finished && endingPhase === "ceremony";
  const showArchive = finished && endingPhase === "archive";
  const viewPlayer = pendingResult || stageTransition ? player : displayPlayer;

  const completedStages = useMemo(() => {
    const done = new Set<CareerStage>();
    for (const entry of viewPlayer.careerHistory) {
      if (entry.stage !== "RETIRED") {
        done.add(entry.stage);
      }
    }
    if (
      viewPlayer.stage !== "RETIRED" &&
      CAREER_STAGE_ORDER.includes(viewPlayer.stage)
    ) {
      // 当前阶段进行中：时间轴上不标为已完成
      done.delete(viewPlayer.stage);
    }
    return done;
  }, [viewPlayer.careerHistory, viewPlayer.stage]);

  function resetZhihuPanel() {
    zhihuAbortRef.current?.abort();
    zhihuAbortRef.current = null;
    zhihuRequestIdRef.current += 1;
    setZhihuStatus("idle");
    setZhihuResult(null);
  }

  function queueZhihuRequest(context: CareerAgentClientContext) {
    zhihuAbortRef.current?.abort();
    const controller = new AbortController();
    zhihuAbortRef.current = controller;

    const requestId = ++zhihuRequestIdRef.current;
    setZhihuStatus("loading");
    setZhihuResult(null);

    void requestCareerAgent(context, { signal: controller.signal })
      .then((response) => {
        if (requestId !== zhihuRequestIdRef.current) {
          return;
        }

        const nextStatus = mapCareerAgentOutputToCardStatus(response);
        setZhihuStatus(nextStatus);
        setZhihuResult(response.ok ? response.data : null);
      })
      .catch((error: unknown) => {
        if (
          (typeof DOMException !== "undefined" &&
            error instanceof DOMException &&
            error.name === "AbortError") ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }
        if (requestId !== zhihuRequestIdRef.current) {
          return;
        }
        setZhihuStatus("error");
        setZhihuResult(null);
      });
  }

  function maybeQueueZhihu(input: {
    before: PlayerState;
    after: PlayerState;
    event: GameEvent;
  }) {
    const reason = shouldRequestCareerAgent({
      eventKind: input.event.eventKind,
      stageChanged: input.before.stage !== input.after.stage,
      careerComplete:
        input.after.stage === "RETIRED" || isCareerFinished(input.after),
    });

    if (!reason) {
      return;
    }

    queueZhihuRequest(
      buildCareerAgentContext({
        player: input.after,
        event: input.event,
        reason,
      }),
    );
  }

  function revealPlayer(next: PlayerState) {
    setDisplayPlayer(next);
    setIsBusy(false);
    if (isCareerFinished(next)) {
      setEndingPhase("ceremony");
    }
  }

  function beginStageTransition(from: CareerStage, to: CareerStage) {
    setStageTransition({ from, to });
  }

  function finishAfterChoice(before: PlayerState, after: PlayerState) {
    if (before.stage !== after.stage) {
      beginStageTransition(before.stage, after.stage);
      return;
    }
    revealPlayer(after);
  }

  function handleChoice(choiceId: string) {
    if (
      isBusy ||
      pendingResult ||
      stageTransition ||
      finished ||
      endingPhase !== "idle"
    ) {
      return;
    }

    const before = player;
    const currentEvent = getCurrentEvent(before);
    if (!currentEvent) return;

    const choice = currentEvent.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    const after = applyChoice(before, choiceId);
    const deltas = computeStatDeltas(before, after);

    setIsBusy(true);
    setPlayer(after);

    // 游戏结果不等待知乎；异步触发且可失败。
    maybeQueueZhihu({ before, after, event: currentEvent });

    if (
      currentEvent.eventKind === "MATCH" &&
      after.lastOutcome?.kind === "MATCH"
    ) {
      setPendingResult({
        kind: "MATCH",
        choiceText: choice.text,
        deltas,
        outcome: after.lastOutcome,
      });
      setIsBusy(false);
      return;
    }

    if (
      currentEvent.eventKind === "DRAFT" &&
      after.lastOutcome?.kind === "DRAFT"
    ) {
      setPendingResult({
        kind: "DRAFT",
        choiceText: choice.text,
        deltas,
        outcome: after.lastOutcome,
      });
      setIsBusy(false);
      return;
    }

    // STORY（及其他无 lastOutcome）：直接进入下一事件 / 阶段过渡
    finishAfterChoice(before, after);
  }

  function handleResultContinue() {
    if (!pendingResult) return;
    const beforeStage = displayPlayer.stage;
    const after = player;
    setPendingResult(null);

    if (beforeStage !== after.stage) {
      beginStageTransition(beforeStage, after.stage);
      return;
    }
    revealPlayer(after);
  }

  function handleStageContinue() {
    if (!stageTransition) return;
    setStageTransition(null);
    revealPlayer(player);
  }

  function handleEndingContinue() {
    setEndingPhase("archive");
  }

  function handleStartCareer() {
    resetZhihuPanel();
    const next = createInitialPlayer();
    setPlayer(next);
    setDisplayPlayer(next);
    setPendingResult(null);
    setStageTransition(null);
    setEndingPhase("idle");
    setIsBusy(false);
    setHasStarted(true);
  }

  function handleRestart() {
    resetZhihuPanel();
    const next = createInitialPlayer();
    setPlayer(next);
    setDisplayPlayer(next);
    setPendingResult(null);
    setStageTransition(null);
    setEndingPhase("idle");
    setIsBusy(false);
    setHasStarted(false);
  }

  const transitionCopy = stageTransition
    ? getStageTransitionCopy(stageTransition.from, stageTransition.to)
    : null;

  if (!hasStarted) {
    return <CareerCover onStart={handleStartCareer} />;
  }

  if (showArchive) {
    return (
      <CareerEndingArchive
        player={displayPlayer}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="arctic-bg flex min-h-full flex-1 flex-col overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-2.5 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 lg:px-6">
        <CareerHeader stage={viewPlayer.stage} />

        <div className="grid gap-2.5 lg:grid-cols-[1.35fr_0.9fr] lg:items-stretch">
          <PlayerCard player={viewPlayer} />
          <PlayerStats player={viewPlayer} />
        </div>

        {event && !showCeremony ? (
          <CareerEvent
            event={event}
            stage={displayPlayer.stage}
            historyCount={displayPlayer.careerHistory.length}
            disabled={
              isBusy ||
              Boolean(pendingResult) ||
              Boolean(stageTransition) ||
              endingPhase !== "idle"
            }
            onChoose={handleChoice}
          />
        ) : null}

        <ZhihuContextCard status={zhihuStatus} result={zhihuResult} />

        <CareerTimeline
          currentStage={viewPlayer.stage}
          completedStages={completedStages}
        />
        <CareerInfo player={viewPlayer} />
      </div>

      {pendingResult ? (
        <GameResultOverlay
          pending={pendingResult}
          onContinue={handleResultContinue}
        />
      ) : null}

      {transitionCopy && stageTransition ? (
        <StageTransitionOverlay
          eyebrow={transitionCopy.eyebrow}
          title={transitionCopy.title}
          subtitle={transitionCopy.subtitle}
          toStage={stageTransition.to}
          onContinue={handleStageContinue}
        />
      ) : null}

      {showCeremony ? (
        <CareerEndingCeremony
          player={displayPlayer}
          onContinue={handleEndingContinue}
        />
      ) : null}
    </div>
  );
}
