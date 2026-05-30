import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Markdown } from "./Markdown";
import type { Item } from "../lib/useController";

type AssistantItem = Extract<Item, { kind: "assistant" }>;

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="msg msg--user">
      <span className="msg__caret">›</span>
      <div className="msg__text">{text}</div>
    </div>
  );
}

export function AssistantMessage({ item }: { item: AssistantItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="msg msg--assistant">
      {item.reasoning && (
        <div className="reasoning">
          <button className="reasoning__toggle" onClick={() => setOpen((v) => !v)}>
            <ChevronRight
              className={`reasoning__chevron ${open ? "reasoning__chevron--open" : ""}`}
              size={12}
            />
            thinking
          </button>
          {open && <div className="reasoning__body">{item.reasoning}</div>}
        </div>
      )}
      <div className="msg__body">
        <Markdown text={item.text} />
        {item.streaming && <span className="cursor" />}
      </div>
    </div>
  );
}
