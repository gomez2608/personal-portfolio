/**
 * The HTML caption bar under the stage, shared by `ClipPlayer` and the snapshot route so
 * snapshots show captions exactly as the page does. Up to 70 characters: 3 lines are
 * reserved on phones, 2 from sm up, so the bar never jumps. Hidden from screen readers;
 * the player gives them the whole transcript instead.
 */
export function CaptionBar({ text }: { text: string }) {
  return (
    <p
      aria-hidden="true"
      className="m-0 flex min-h-[calc(3*1.4em+1rem)] items-center justify-center border-t border-line bg-card px-4 py-2 text-center font-sans text-[15px] leading-[1.4] font-semibold text-ink sm:min-h-[calc(2*1.4em+1rem)] sm:text-base"
    >
      {text}
    </p>
  );
}
