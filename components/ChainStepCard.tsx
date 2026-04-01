"use client";

import { useState } from "react";

export interface ChainStepData {
  id: string;
  title: string;
  content: string;
  outputVariable?: string;
}

interface ChainStepCardProps {
  step: ChainStepData;
  index: number;
  totalCount: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (index: number) => void;
  onChange: (index: number, updated: ChainStepData) => void;
  readonly?: boolean;
}

export function ChainStepCard({
  step,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChange,
  readonly = false,
}: ChainStepCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(
    !!step.outputVariable && step.outputVariable.length > 0
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px",
    background: "var(--cn-bg-s2)", border: "1px solid var(--cn-border)",
    borderRadius: 8, fontSize: 13, color: "var(--cn-text)",
    outline: "none", transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      background: "var(--cn-bg-card)",
      border: "1px solid var(--cn-border)",
      borderRadius: 12, padding: "18px 20px",
      position: "relative",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <span style={{
            flexShrink: 0,
            width: 28, height: 28, borderRadius: "50%",
            background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
            fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {index + 1}
          </span>
          {readonly ? (
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--cn-text)" }}>
              {step.title || `Step ${index + 1}`}
            </h3>
          ) : (
            <input
              type="text"
              value={step.title}
              onChange={(e) => onChange(index, { ...step, title: e.target.value })}
              placeholder={`Step ${index + 1} title`}
              style={{ ...inputStyle, flex: 1 }}
            />
          )}
        </div>

        {!readonly && (
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0, marginLeft: 8 }}>
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              aria-label="Move step up"
              style={{
                padding: 6, borderRadius: "50%", border: "none",
                background: "transparent", cursor: index === 0 ? "not-allowed" : "pointer",
                color: "var(--cn-muted)", opacity: index === 0 ? 0.3 : 1,
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { if (index !== 0) e.currentTarget.style.background = "var(--cn-bg-s2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === totalCount - 1}
              aria-label="Move step down"
              style={{
                padding: 6, borderRadius: "50%", border: "none",
                background: "transparent", cursor: index === totalCount - 1 ? "not-allowed" : "pointer",
                color: "var(--cn-muted)", opacity: index === totalCount - 1 ? 0.3 : 1,
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { if (index !== totalCount - 1) e.currentTarget.style.background = "var(--cn-bg-s2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label="Remove step"
              style={{
                padding: 6, borderRadius: "50%", border: "none",
                background: "transparent", cursor: "pointer",
                color: "var(--cn-dim)", transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cn-dim)"; }}
            >
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ paddingLeft: 40 }}>
        {readonly ? (
          <>
            <p style={{ fontSize: 13, color: "var(--cn-text2)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {step.content}
            </p>
            {step.outputVariable && (
              <p style={{ marginTop: 8, fontSize: 12, color: "var(--cn-muted)" }}>
                Output variable:{" "}
                <code style={{
                  padding: "1px 6px", borderRadius: 4,
                  background: "var(--cn-bg-s2)", fontFamily: "ui-monospace,monospace",
                  fontSize: 11, color: "var(--cn-text2)",
                }}>
                  {step.outputVariable}
                </code>
              </p>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea
              value={step.content}
              onChange={(e) => onChange(index, { ...step, content: e.target.value })}
              placeholder="Enter the prompt content for this step..."
              rows={4}
              style={{
                ...inputStyle,
                fontFamily: "inherit",
                resize: "vertical", lineHeight: 1.75,
              }}
            />

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, color: "var(--cn-muted)",
                background: "none", border: "none", cursor: "pointer",
                transition: "color 0.12s", alignSelf: "flex-start",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text2)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
            >
              <svg
                style={{ width: 11, height: 11, transition: "transform 0.15s", transform: showAdvanced ? "rotate(90deg)" : "rotate(0deg)" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced options
            </button>

            {showAdvanced && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--cn-muted)" }}>
                  Output Variable Name
                </label>
                <input
                  type="text"
                  value={step.outputVariable || ""}
                  onChange={(e) => onChange(index, { ...step, outputVariable: e.target.value || undefined })}
                  placeholder="e.g. step1_output"
                  style={{ ...inputStyle, maxWidth: 280, fontFamily: "ui-monospace,monospace" }}
                />
                <p style={{ fontSize: 11, color: "var(--cn-dim)" }}>
                  Name this step&apos;s output so later steps can reference it.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
