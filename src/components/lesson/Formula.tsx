import type { ReactionSpecies } from "@/lessons/schema";

interface FormulaProps {
  reactants: ReactionSpecies[];
  products: ReactionSpecies[];
}

export function Formula({ reactants, products }: FormulaProps) {
  return (
    <div className="formula" aria-label="Phương trình hóa học">
      <FormulaSide species={reactants} />
      <span className="formula__arrow">→</span>
      <FormulaSide species={products} />
    </div>
  );
}

function FormulaSide({ species }: { species: ReactionSpecies[] }) {
  return (
    <span className="formula__side">
      {species.map((item, index) => (
        <span className="formula__species" key={`${item.formula}-${index}`}>
          {index > 0 ? <span className="formula__plus">+</span> : null}
          {item.coefficient > 1 ? <span className="formula__coefficient">{item.coefficient}</span> : null}
          <ChemicalFormula formula={item.formula} />
        </span>
      ))}
    </span>
  );
}

function ChemicalFormula({ formula }: { formula: string }) {
  const parts = formula.match(/[A-Z][a-z]?|\d+/g) ?? [formula];
  return (
    <span>
      {parts.map((part, index) =>
        /^\d+$/.test(part) ? <sub key={`${part}-${index}`}>{part}</sub> : <span key={`${part}-${index}`}>{part}</span>
      )}
    </span>
  );
}
