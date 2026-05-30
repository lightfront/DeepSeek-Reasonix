import { useState } from "react";
import type { KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";

export function Composer({
  running,
  onSend,
  onCancel,
}: {
  running: boolean;
  onSend: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts a newline. isComposing guards IME input
    // (e.g. pinyin) so confirming a candidate doesn't fire a send.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
    // Esc interrupts the in-flight turn (matches the Stop button's hint).
    if (e.key === "Escape" && running) {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="composer">
      <span className="composer__caret">›</span>
      <textarea
        className="composer__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Message Reasonix…"
        rows={1}
      />
      {running ? (
        <button className="composer__btn composer__btn--stop" onClick={onCancel} title="Stop (Esc)">
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          className="composer__btn composer__btn--send"
          onClick={submit}
          disabled={!text.trim()}
          title="Send (Enter)"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </div>
  );
}
