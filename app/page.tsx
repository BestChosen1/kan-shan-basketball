"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CareerEvent } from "@/components/career-event";
import { CareerHeader } from "@/components/career-header";
import { CareerInfo } from "@/components/career-info";
import { CareerSummary } from "@/components/career-summary";
import { CareerTimeline } from "@/components/career-timeline";
import { ChoiceButtons } from "@/components/choice-buttons";
import { ChoiceResultOverlay } from "@/components/choice-result-overlay";
import {
  computeStatDeltas,
  getStageTransitionCopy,
  type StatDelta,
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

interface ChoiceResultState {
  choiceText: string;
  deltas: StatDelta[];
}

interface StageTransitionState {
  from: CareerStage;
  to: CareerStage;
}

const CHOICE_FEEDBACK_MS = 1000;
const STAGE_TRANSITION_MS = 1600;

export default function Home() {
  const [player, setPlayer] = useState<PlayerState>(() => createInitialPlayer());
  const [displayPlayer, setDisplayPlayer] = useState<PlayerState>(() =>
    createInitialPlayer(),
  );
  const [choiceResult, setChoiceResult] = useState<ChoiceResultState | null>(
    null,
  );
  const [stageTransition, setStageTransition] =
    useState<StageTransitionState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const event = getCurrentEvent(displayPlayer);
  const finished = isCareerFinished(displayPlayer);
  const viewPlayer = choiceResult ? player : displayPlayer;

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

  const highlightKeys = choiceResult?.deltas.map((item) => item.key) ?? [];

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  function clearTimers() {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }

  function handleChoice(choiceId: string) {
    if (isTransitioning || finished) return;

    const before = player;
    const currentEvent = getCurrentEvent(before);
    if (!currentEvent) return;

    const choice = currentEvent.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    const after = applyChoice(before, choiceId);
    const deltas = computeStatDeltas(before, after);
    const stageChanged = before.stage !== after.stage;

    clearTimers();
    setIsTransitioning(true);
    setPlayer(after);
    setChoiceResult({
      choiceText: choice.text,
      deltas,
    });

    schedule(() => {
      setChoiceResult(null);

      if (stageChanged) {
        setStageTransition({ from: before.stage, to: after.stage });
        schedule(() => {
          setStageTransition(null);
          setDisplayPlayer(after);
          setIsTransitioning(false);
        }, STAGE_TRANSITION_MS);
      } else {
        setDisplayPlayer(after);
        setIsTransitioning(false);
      }
    }, CHOICE_FEEDBACK_MS);
  }

  function handleRestart() {
    clearTimers();
    const next = createInitialPlayer();
    setPlayer(next);
    setDisplayPlayer(next);
    setChoiceResult(null);
    setStageTransition(null);
    setIsTransitioning(false);
  }

  const transitionCopy = stageTransition
    ? getStageTransitionCopy(stageTransition.from, stageTransition.to)
    : null;

  return (
    <div className="arctic-bg flex min-h-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-8 lg:max-w-7xl">
        <CareerHeader stage={viewPlayer.stage} />

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <PlayerCard player={viewPlayer} />
            <CareerTimeline
              currentStage={viewPlayer.stage}
              completedStages={completedStages}
            />
          </div>

          <div className="space-y-4">
            <PlayerStats player={viewPlayer} highlightKeys={highlightKeys} />
            <CareerInfo player={viewPlayer} />
          </div>
        </div>

        {finished && !choiceResult && !stageTransition ? (
          <CareerSummary player={displayPlayer} onRestart={handleRestart} />
        ) : event ? (
          <div className="space-y-4">
            <CareerEvent event={event} />
            <ChoiceButtons
              choices={event.choices}
              disabled={isTransitioning}
              onChoose={handleChoice}
            />
          </div>
        ) : null}
      </div>

      {choiceResult ? (
        <ChoiceResultOverlay
          choiceText={choiceResult.choiceText}
          deltas={choiceResult.deltas}
        />
      ) : null}

      {transitionCopy ? (
        <StageTransitionOverlay
          eyebrow={transitionCopy.eyebrow}
          title={transitionCopy.title}
          subtitle={transitionCopy.subtitle}
        />
      ) : null}
    </div>
  );
}
