import { useState } from "react";
import {
  Check,
  ChevronRight,
  FilePen,
  FileText,
  FolderOpen,
  Globe,
  Loader2,
  ListTree,
  Search,
  SquareTerminal,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { CodeViewer } from "./CodeViewer";
import { DiffView } from "./DiffView";
import { extToLang } from "../lib/lang";
import type { Item } from "../lib/useController";

type ToolItem = Extract<Item, { kind: "tool" }>;

const ICONS: Record<string, LucideIcon> = {
  edit_file: FilePen,
  multi_edit: FilePen,
  write_file: FilePen,
  read_file: FileText,
  bash: SquareTerminal,
  ls: FolderOpen,
  glob: Search,
  grep: Search,
  web_fetch: Globe,
  task: ListTree,
};

// subjectOf pulls the most informative one-liner out of a call's args — the
// command for bash, the pattern for search, the path for file tools — so the
// collapsed row reads at a glance (a compact "tool · subject" line).
function subjectOf(name: string, args: string): string {
  try {
    const a = JSON.parse(args) as Record<string, unknown>;
    if (name === "bash") return String(a.command ?? "");
    if (name === "grep" || name === "glob") return String(a.pattern ?? a.path ?? "");
    return String(a.path ?? a.file_path ?? "");
  } catch {
    return "";
  }
}

function editDiff(name: string, args: string): { original: string; modified: string; lang: string } | null {
  if (name !== "edit_file") return null;
  try {
    const a = JSON.parse(args) as { path?: string; old_string?: string; new_string?: string };
    if (typeof a.old_string === "string" && typeof a.new_string === "string") {
      return { original: a.old_string, modified: a.new_string, lang: extToLang(a.path ?? "") };
    }
  } catch {
    /* args not valid JSON yet */
  }
  return null;
}

function pretty(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}

function StatusGlyph({ status }: { status: ToolItem["status"] }) {
  if (status === "running") return <Loader2 className="ico spin" size={13} />;
  if (status === "error") return <X className="ico ico--err" size={13} />;
  return <Check className="ico ico--ok" size={13} />;
}

export function ToolCard({ item }: { item: ToolItem }) {
  const diff = editDiff(item.name, item.args);
  const subject = subjectOf(item.name, item.args);
  const Icon = ICONS[item.name] ?? Wrench;

  // edit diffs are the point of the card, so they're shown inline; everything
  // else folds its args/output away by default.
  const hasBody = !diff && (!!item.args || !!item.output);
  const [open, setOpen] = useState(false);

  return (
    <div className={`tool tool--${item.status}`}>
      <div
        className={`tool__row ${hasBody ? "tool__row--clickable" : ""}`}
        onClick={hasBody ? () => setOpen((v) => !v) : undefined}
      >
        {hasBody ? (
          <ChevronRight className={`tool__chevron ${open ? "tool__chevron--open" : ""}`} size={13} />
        ) : (
          <span className="tool__chevron tool__chevron--placeholder" />
        )}
        <Icon className="tool__icon" size={14} />
        <span className="tool__name">{item.name}</span>
        {subject && <span className="tool__subject">{subject}</span>}
        <span className="tool__meta">
          {item.readOnly && <span className="tag">ro</span>}
          <StatusGlyph status={item.status} />
        </span>
      </div>

      {diff && (
        <div className="tool__body">
          <DiffView original={diff.original} modified={diff.modified} language={diff.lang} maxHeight={260} />
        </div>
      )}

      {hasBody && open && (
        <div className="tool__body">
          {item.args && <CodeViewer value={pretty(item.args)} language="json" maxHeight={180} />}
          {item.output && (
            <>
              <CodeViewer value={item.output} maxHeight={280} />
              {item.truncated && <div className="tool__note">output truncated</div>}
            </>
          )}
        </div>
      )}

      {item.error && <div className="tool__err">{item.error}</div>}
    </div>
  );
}
