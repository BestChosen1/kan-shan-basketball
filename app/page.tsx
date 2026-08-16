"use client";

import { useMemo, useState } from "react";
import { CareerEvent } from "@/components/career-event";
import { CareerHeader } from "@/components/career-header";
import { CareerInfo } from "@/components/career-info";
import { CareerSummary } from "@/components/career-summary";
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
import {
  applyChoice,
  CAREER_STAGE_ORDER,
  createInitialPlayer,
  getCurrentEvent,
  isCareerFinished,
  type CareerStage,
  type PlayerState,
} from "@/game";

interface StageTransitionState {
  from: CareerStage;
  to: CareerStage;
}

export default function Home() {
  const [player, setPlayer] = useState<PlayerState>(() => createInitialPlayer());
  const [displayPlayer, setDisplayPlayer] = useState<PlayerState>(() =>
    createInitialPlayer(),
  );
  const [pendingResult, setPendingResult] = useState<PendingGameResult | null>(
    null,
  );
  const [stageTransition, setStageTransition] =
    useState<StageTransitionState | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const event = getCurrentEvent(displayPlayer);
  const finished =
    isCareerFinished(displayPlayer) && !pendingResult && !stageTransition;
  const viewPlayer = pendingResult || stageTransition ? player : displayPlayer;

  const completedStages = useMemo(() => {
    const done = new Set<CareerStage>();
    const currentIndex = CAREER_STAGE_ORDER.indexOf(viewPlayer.stage);

    for (let i = 0; i < currentIndex; i += 1) {
      const stage = CAREER_STAGE_ORDER[i];
      if (stage) done.add(stage);
    }

    if (viewPlayer.stage === "RETIRED") {
      for (const stage of CAREER_STAGE_ORDER) {
        done.add(stage);
      }
      done.delete("RETIRED");
    }

    return done;
  }, [viewPlayer.stage]);

  function revealPlayer(next: PlayerState) {
    setDisplayPlayer(next);
    setIsBusy(false);
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
    if (isBusy || pendingResult || stageTransition || finished) return;

    const before = player;
    const currentEvent = getCurrentEvent(before);
    if (!currentEvent) return;

    const choice = currentEvent.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    const after = applyChoice(before, choiceId);
    const deltas = computeStatDeltas(before, after);

    setIsBusy(true);
    setPlayer(after);

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

  function handleRestart() {
    const next = createInitialPlayer();
    setPlayer(next);
    setDisplayPlayer(next);
    setPendingResult(null);
    setStageTransition(null);
    setIsBusy(false);
  }

  const transitionCopy = stageTransition
    ? getStageTransitionCopy(stageTransition.from, stageTransition.to)
    : null;

  return (
    <div className="arctic-bg flex min-h-full flex-1 flex-col overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-2.5 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 lg:px-6">
        <CareerHeader stage={viewPlayer.stage} />

        <div className="grid gap-2.5 lg:grid-cols-[1.35fr_0.9fr] lg:items-stretch">
          <PlayerCard player={viewPlayer} />
          <PlayerStats player={viewPlayer} />
        </div>

        {finished ? (
          <CareerSummary player={displayPlayer} onRestart={handleRestart} />
        ) : event ? (
          <CareerEvent
            event={event}
            stage={displayPlayer.stage}
            historyCount={displayPlayer.careerHistory.length}
            disabled={isBusy || Boolean(pendingResult) || Boolean(stageTransition)}
            onChoose={handleChoice}
          />
        ) : null}

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
    </div>
  );
}
