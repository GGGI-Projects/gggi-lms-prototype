"use client";

import { useEffect, useRef, useState } from "react";
import type { Programme } from "@/content/site";
import { ProgrammeScene } from "@/components/art/scenes";
import { PauseIcon, PlayIcon } from "@/components/student-portal/icons";

/**
 * The lecture player.
 *
 * There is no video file. The prototype ships zero external assets on purpose
 * - it will be demoed on a projector on conference wifi - so this is a working
 * MOCK of a player rather than a `<video>` element with nothing behind it: the
 * transport runs, the scrubber advances, the elapsed time counts and the track
 * can be scrubbed. What it is playing is the programme's own illustration.
 *
 * It says so, quietly, under the frame. A demo where the play button appears
 * broken costs the room five minutes of the wrong conversation; a demo where
 * the play button plays a fake and does not admit it costs more than that
 * later.
 *
 * REAL TIME, not accelerated. A scrubber that crosses an eight-minute lecture
 * in twenty seconds is a more obvious lie than a still frame, and the clock is
 * the one part of a player people read closely.
 *
 * When a real video arrives, this component keeps its shape: replace the
 * interval with `timeupdate` on a `<video>` and the frame, the controls and
 * the layout around it do not move.
 */
export function VideoStage({
  title,
  minutes,
  scene,
}: {
  title: string;
  minutes: number;
  scene: Programme["scene"];
}) {
  const total = minutes * 60;
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const trackRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!playing) return;

    const id = window.setInterval(() => {
      setElapsed((seconds) => {
        if (seconds + 1 >= total) {
          setPlaying(false);
          return total;
        }
        return seconds + 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [playing, total]);

  const percent = total ? (elapsed / total) * 100 : 0;

  /** Click anywhere on the track to seek, the way a real player behaves. */
  function seek(event: React.MouseEvent<HTMLButtonElement>) {
    const element = trackRef.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    const fraction = Math.min(
      1,
      Math.max(0, (event.clientX - box.left) / box.width),
    );
    setElapsed(Math.round(fraction * total));
  }

  return (
    <figure>
      <div className="relative isolate aspect-video overflow-hidden rounded-md bg-primary-950">
        <ProgrammeScene
          scene={scene}
          className="absolute inset-0 -z-10 size-full object-cover opacity-45"
        />
        {/* A scrim under the controls, so the white transport is legible over
            whichever illustration this programme happens to use. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-linear-to-t from-primary-950/95 to-transparent"
        />

        <button
          type="button"
          onClick={() => setPlaying((state) => !state)}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="group absolute inset-0 grid place-items-center"
        >
          <span
            className={`grid size-20 place-items-center rounded-full bg-accent text-primary-950 shadow-lg transition-transform duration-500 ease-out-expo group-hover:scale-105 ${
              // The button steps back once it is playing rather than
              // disappearing: a control that vanishes leaves nothing to aim at
              // when you want to stop.
              playing ? "scale-90 opacity-0 group-hover:opacity-100" : ""
              }`}
          >
            {playing ? (
              <PauseIcon className="size-8" />
            ) : (
              <PlayIcon className="ml-1 size-8" />
            )}
          </span>
        </button>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-10 sm:px-6">
          <button
            ref={trackRef}
            type="button"
            onClick={seek}
            aria-label="Seek"
            className="block h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-paper/25"
          >
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${percent}%` }}
            />
          </button>

          <div className="mt-3 flex items-center justify-between text-sm font-medium text-paper/85">
            <span className="tabular-nums">{clock(elapsed)}</span>
            <span className="truncate px-4 text-paper/70">{title}</span>
            <span className="tabular-nums">{clock(total)}</span>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-sm text-muted">
        Design prototype - the transport is live, but no video file is attached
        yet.
      </figcaption>
    </figure>
  );
}

/** `485` -> `8:05`. Two fields only; no lecture here runs past an hour. */
function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
