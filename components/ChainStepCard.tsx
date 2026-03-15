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

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6 relative group">
      {/* Step number badge and controls row */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-semibold flex-shrink-0">
            {index + 1}
          </span>
          {readonly ? (
            <h3 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100">
              {step.title || `Step ${index + 1}`}
            </h3>
          ) : (
            <input
              type="text"
              value={step.title}
              onChange={(e) =>
                onChange(index, { ...step, title: e.target.value })
              }
              placeholder={`Step ${index + 1} title`}
              className="flex-1 min-w-0 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
            />
          )}
        </div>

        {!readonly && (
          <div className="flex items-center gap-1">
            {/* Move Up */}
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              aria-label="Move step up"
              className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            {/* Move Down */}
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === totalCount - 1}
              aria-label="Move step down"
              className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Remove */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label="Remove step"
              className="p-1.5 rounded-full text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {readonly ? (
        <div className="pl-9 sm:pl-11">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
            {step.content}
          </p>
          {step.outputVariable && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Output variable:{" "}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-700 dark:text-neutral-300">
                {step.outputVariable}
              </code>
            </p>
          )}
        </div>
      ) : (
        <div className="pl-9 sm:pl-11 space-y-3">
          <textarea
            value={step.content}
            onChange={(e) =>
              onChange(index, { ...step, content: e.target.value })
            }
            placeholder="Enter the prompt content for this step..."
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-y font-mono"
          />

          {/* Advanced section toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Output Variable Name
              </label>
              <input
                type="text"
                value={step.outputVariable || ""}
                onChange={(e) =>
                  onChange(index, {
                    ...step,
                    outputVariable: e.target.value || undefined,
                  })
                }
                placeholder="e.g. step1_output"
                className="w-full max-w-xs px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 font-mono"
              />
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Name this step&apos;s output so later steps can reference it.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
