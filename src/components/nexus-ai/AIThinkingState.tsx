const bars = [0, 1, 2, 3, 4];

const AIThinkingState = ({ label = "NEXUS AI يفكّر" }: { label?: string }) => (
  <div className="flex items-center gap-3 px-1 py-2" role="status" aria-live="polite">
    <div className="flex items-end gap-[3px] h-4">
      {bars.map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary/70 motion-safe:animate-[pulse_1.1s_ease-in-out_infinite]"
          style={{ height: `${6 + (i % 3) * 5}px`, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
    <p className="nx-meta">{label}…</p>
  </div>
);

export default AIThinkingState;
