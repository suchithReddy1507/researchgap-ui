import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, GraduationCap, Download, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { exportGap, EngineOfflineError, type Gap, type GapExportFormat } from "@/lib/api";

const PAPER_FORMATS: { id: GapExportFormat; label: string }[] = [
  { id: "ieee", label: "IEEE" },
  { id: "acm", label: "ACM" },
  { id: "apa", label: "APA" },
];

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function GapExportPanel({
  jobId,
  gapIndex,
  gap,
  onBack,
}: {
  jobId: string;
  gapIndex: number;
  gap: Gap;
  onBack: () => void;
}) {
  const [choosingFormat, setChoosingFormat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [format, setFormat] = useState<GapExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (fmt: GapExportFormat) => {
    setLoading(true);
    setError(null);
    setContent(null);
    try {
      const res = await exportGap(jobId, gapIndex, fmt);
      setContent(res.content);
      setFormat(fmt);
    } catch (e) {
      setError(
        e instanceof EngineOfflineError
          ? "Could not reach the ResearchGap engine."
          : e instanceof Error
            ? e.message
            : "Could not generate the export.",
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setContent(null);
    setFormat(null);
    setError(null);
    setChoosingFormat(false);
  };

  return (
    <div className="glass hud-corners mt-10 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
          GAP {gapIndex + 1} · {gap.topic_a} × {gap.topic_b}
        </span>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> BACK TO FULL REPORT
        </button>
      </div>

      <div className="p-6 md:p-8">
        {!content && !loading && (
          <>
            <p className="mb-5 text-sm text-muted-foreground">Export just this gap as:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => run("report_style")}
                className="glass glass-hover flex flex-col items-start gap-2 rounded-xl p-5 text-left"
              >
                <FileText className="h-5 w-5 text-[var(--cyan)]" />
                <span className="font-semibold">This Gap's Detail Only</span>
                <span className="text-xs text-muted-foreground">
                  Same depth as today's report — name, why it's a gap, research agenda.
                </span>
              </button>
              <button
                onClick={() => setChoosingFormat(true)}
                className={`glass glass-hover flex flex-col items-start gap-2 rounded-xl p-5 text-left ${
                  choosingFormat ? "ring-2 ring-[var(--violet)]" : ""
                }`}
              >
                <GraduationCap className="h-5 w-5 text-[var(--violet)]" />
                <span className="font-semibold">Academic Paper Draft</span>
                <span className="text-xs text-muted-foreground">
                  Title, abstract, intro, literature framing, methodology, references.
                </span>
              </button>
            </div>

            {choosingFormat && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {PAPER_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => run(f.id)}
                    className="rounded-lg bg-[var(--violet)]/15 px-4 py-2 font-mono text-xs tracking-wider text-[var(--violet)] ring-1 ring-[var(--violet)]/40 hover:bg-[var(--violet)]/25"
                  >
                    {f.label}
                  </button>
                ))}
              </motion.div>
            )}

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--danger)]/10 p-3 text-xs text-[var(--danger)] ring-1 ring-[var(--danger)]/30">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                {error}
              </p>
            )}
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Generating…</p>
          </div>
        )}

        {content && format && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-widest text-[var(--cyan)]">
                {format === "report_style" ? "GAP DETAIL" : `${format.toUpperCase()} DRAFT`}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={reset} className="font-mono text-[11px] tracking-wider text-muted-foreground hover:text-foreground">
                  CHOOSE DIFFERENT
                </button>
                <button
                  onClick={() => download(`gap-${gapIndex + 1}-${format}.md`, content)}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--cyan)]/15 px-3 py-1.5 font-mono text-[11px] tracking-wider text-[var(--cyan)] ring-1 ring-[var(--cyan)]/40 hover:bg-[var(--cyan)]/25"
                >
                  <Download className="h-3 w-3" /> DOWNLOAD
                </button>
              </div>
            </div>
            <article className="report-md font-serif text-[15px] leading-relaxed text-foreground/90">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          </>
        )}
      </div>
    </div>
  );
}
