import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import type { InteractiveId } from "@/lessons/schema";

export type InteractiveState = Record<string, unknown>;

export interface InteractiveResult {
  solved: boolean;
  failureMode?: string;
  state: InteractiveState;
}

export interface InteractiveHandle {
  commit(): InteractiveResult;
  reset(): void;
}

export interface InteractiveProps {
  params?: Record<string, unknown>;
  goal: Record<string, string | number | boolean>;
  reducedMotion: boolean;
  onChange?(state: InteractiveState): void;
}

type InteractiveComponent = ForwardRefExoticComponent<
  InteractiveProps & RefAttributes<InteractiveHandle>
>;

interface LabeledSpecies {
  formula: string;
  label: string;
}

const CombineTwo = forwardRef<InteractiveHandle, InteractiveProps>(function CombineTwo(
  { params, goal, onChange },
  ref
) {
  const reactants = getSpeciesList(params?.reactants);
  const product = getSpecies(params?.product) ?? { formula: String(goal.product ?? "H2O"), label: "Sản phẩm" };
  const [selected, setSelected] = useState<string[]>([]);
  const solved = reactants.length > 0 && reactants.every((item) => selected.includes(item.formula));
  const state = useMemo(() => ({ selected, product: solved ? product.formula : null }), [product.formula, selected, solved]);

  useEffect(() => {
    onChange?.(state);
  }, [onChange, state]);

  useImperativeHandle(
    ref,
    () => ({
      commit: () => ({
        solved,
        failureMode: solved ? undefined : "missingReactant",
        state
      }),
      reset: () => setSelected([])
    }),
    [solved, state]
  );

  const toggle = (formula: string) => {
    setSelected((current) =>
      current.includes(formula)
        ? current.filter((item) => item !== formula)
        : [...current, formula]
    );
  };

  return (
    <div className="interactive-panel combine-panel">
      <div className="molecule-tray" aria-label="Chất tham gia">
        {reactants.map((item) => (
          <button
            className={`molecule-chip ${selected.includes(item.formula) ? "is-selected" : ""}`}
            key={item.formula}
            onClick={() => toggle(item.formula)}
            type="button"
          >
            <strong>{item.label}</strong>
            <span>{formatFormula(item.formula)}</span>
          </button>
        ))}
      </div>
      <div className={`product-preview ${solved ? "is-ready" : ""}`} aria-live="polite">
        {solved ? (
          <>
            <span>→</span>
            <strong>{product.label}</strong>
            <span>{formatFormula(product.formula)}</span>
          </>
        ) : (
          "Chọn đủ chất tham gia"
        )}
      </div>
    </div>
  );
});

const RatioMixer = forwardRef<InteractiveHandle, InteractiveProps>(function RatioMixer(
  { params, onChange },
  ref
) {
  const reactants = getSpeciesList(params?.reactants);
  const h2 = reactants[0] ?? { formula: "H2", label: "H₂" };
  const o2 = reactants[1] ?? { formula: "O2", label: "O₂" };
  const product = getSpecies(params?.product) ?? { formula: "H2O", label: "H₂O" };
  const range = getRange(params?.range);
  const [counts, setCounts] = useState<Record<string, number>>({
    [h2.formula]: 0,
    [o2.formula]: 0
  });

  const h2Count = counts[h2.formula] ?? 0;
  const o2Count = counts[o2.formula] ?? 0;
  const solved = h2Count > 0 && o2Count > 0 && h2Count === 2 * o2Count;
  const productCount = solved ? o2Count * 2 : 0;
  const state = useMemo(
    () => ({ ...counts, product: product.formula, productCount }),
    [counts, product.formula, productCount]
  );

  useEffect(() => {
    onChange?.(state);
  }, [onChange, state]);

  useImperativeHandle(
    ref,
    () => ({
      commit: () => {
        if (h2Count === 0 || o2Count === 0) return { solved: false, failureMode: "missingReactant", state };
        if (h2Count > 2 * o2Count) return { solved: false, failureMode: "leftoverH2", state };
        if (h2Count < 2 * o2Count) return { solved: false, failureMode: "leftoverO2", state };
        return { solved: true, state };
      },
      reset: () => setCounts({ [h2.formula]: 0, [o2.formula]: 0 })
    }),
    [h2.formula, h2Count, o2.formula, o2Count, state]
  );

  const updateCount = (formula: string, delta: number) => {
    setCounts((current) => {
      const nextValue = Math.max(range.min, Math.min(range.max, (current[formula] ?? 0) + delta));
      return { ...current, [formula]: nextValue };
    });
  };

  return (
    <div className="interactive-panel ratio-mixer">
      <div className="ratio-controls">
        {[h2, o2].map((item) => (
          <div className="ratio-control" key={item.formula}>
            <span className="ratio-label">{item.label}</span>
            <div className="stepper-control">
              <button
                aria-label={`Giảm ${item.label}`}
                onClick={() => updateCount(item.formula, -1)}
                type="button"
              >
                −
              </button>
              <strong aria-label={`${item.label}: ${counts[item.formula] ?? 0}`}>
                {counts[item.formula] ?? 0}
              </strong>
              <button
                aria-label={`Tăng ${item.label}`}
                onClick={() => updateCount(item.formula, 1)}
                type="button"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={`reaction-preview ${solved ? "is-ready" : ""}`} aria-live="polite">
        <span>
          {h2Count} {h2.label} + {o2Count} {o2.label}
        </span>
        <span>→</span>
        <strong>{solved ? `${productCount} ${product.label}` : "?"}</strong>
      </div>
    </div>
  );
});

const interactives: Record<InteractiveId, InteractiveComponent> = {
  "ratio-mixer": RatioMixer,
  combine: CombineTwo
};

export function getInteractive(id: InteractiveId): InteractiveComponent {
  return interactives[id];
}

function getSpecies(value: unknown): LabeledSpecies | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.formula !== "string") return null;
  return {
    formula: item.formula,
    label: typeof item.label === "string" ? item.label : formatFormula(item.formula)
  };
}

function getSpeciesList(value: unknown): LabeledSpecies[] {
  return Array.isArray(value) ? value.map(getSpecies).filter((item): item is LabeledSpecies => Boolean(item)) : [];
}

function getRange(value: unknown): { min: number; max: number } {
  if (!value || typeof value !== "object") return { min: 0, max: 6 };
  const range = value as Record<string, unknown>;
  return {
    min: typeof range.min === "number" ? range.min : 0,
    max: typeof range.max === "number" ? range.max : 6
  };
}

function formatFormula(formula: string): string {
  return formula
    .replaceAll("2", "₂")
    .replaceAll("3", "₃")
    .replaceAll("4", "₄")
    .replaceAll("6", "₆");
}
