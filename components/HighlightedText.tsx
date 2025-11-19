interface HighlightedTextProps {
  text: string;
  highlight: string;
}

export default function HighlightedText({ text, highlight }: HighlightedTextProps) {
  const cleanedText = text.trim();
  const cleanedHighlight = highlight.trim();

  if (!cleanedHighlight) return <>{cleanedText}</>;

  // Escape regex characters
  const safeHighlight = cleanedHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let regex: RegExp | null = null;

  try {
    regex = new RegExp(`(${safeHighlight})`, "gi");
  } catch {
    return <>{cleanedText}</>;
  }

  const parts = cleanedText.split(regex);

  return (
    <>
      {parts.map((part: string, i: number) =>
        regex!.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-300 text-black px-1 rounded font-bold"
          >
            {part.trim()}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
