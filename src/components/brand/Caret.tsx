// Up/down triangle glyph using currentColor, so it inherits the surrounding
// text color (green for up, red for down). Ported from fb-shared.jsx Caret.
export function Caret({ up, size = 10 }: { up?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <path d={up ? 'M5 2l3.5 5h-7z' : 'M5 8l3.5-5h-7z'} fill="currentColor" />
    </svg>
  );
}

export default Caret;
