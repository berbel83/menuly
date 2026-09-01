import { useState } from "react";

import type { NewHouseholdMeal } from "../../services/mealCatalogService";
import type { Category, Ingredient, Meal } from "../../types/meal";

const categories: Category[] = [
  "Pollo", "Carne", "Pescado", "Pasta", "Arroz", "Huevos",
  "Wraps", "Caprichos", "Ligero", "Merienda",
];

interface Props {
  meal?: Meal;
  onClose(): void;
  onSave(meal: NewHouseholdMeal): Promise<void>;
  onDelete?(): Promise<void>;
}

function parseIngredients(value: string): Ingredient[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, quantity = "Al gusto"] = line.split("|").map((part) => part.trim());
      return { name, quantity };
    });
}

export default function MealEditorModal({ meal, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(meal?.name ?? "");
  const [category, setCategory] = useState<Category>(meal?.category ?? "Pollo");
  const [cookingTime, setCookingTime] = useState(String(meal?.cookingTime ?? 30));
  const [ingredients, setIngredients] = useState(
    meal?.ingredients.map((item) => `${item.name} | ${item.quantity}`).join("\n") ?? "",
  );
  const [instructions, setInstructions] = useState(meal?.instructions.join("\n") ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit() {
    const parsedIngredients = parseIngredients(ingredients);
    const parsedInstructions = instructions.split("\n").map((line) => line.trim()).filter(Boolean);
    const minutes = Number(cookingTime);

    if (!name.trim() || parsedIngredients.length === 0 || parsedInstructions.length === 0) {
      setErrorMessage("Indica el nombre, al menos un ingrediente y un paso.");
      return;
    }

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 360) {
      setErrorMessage("El tiempo debe estar entre 1 y 360 minutos.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      await onSave({ name, category, ingredients: parsedIngredients, instructions: parsedInstructions, cookingTime: minutes });
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el plato.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!onDelete || !window.confirm(`¿Eliminar “${name}” definitivamente?`)) return;
    try {
      setSaving(true);
      await onDelete();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el plato.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[28px] bg-[#FBF8F3] p-5 shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D96536]">Vuestro catálogo</p>
            <h2 className="mt-1 font-serif text-[26px] font-semibold">{meal ? "Editar plato" : "Añadir un plato"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#625B54]">✕</button>
        </div>

        <label className="mt-5 block text-xs font-semibold text-[#5F695F]">
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="mt-2 w-full rounded-2xl border border-[#DDD5CC] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#D96536]" placeholder="Ej. Pollo de la abuela" />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-[#5F695F]">
            Categoría
            <select value={category} onChange={(event) => setCategory(event.target.value as Category)} className="mt-2 w-full rounded-2xl border border-[#DDD5CC] bg-white px-3 py-3.5 text-sm">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-[#5F695F]">
            Minutos
            <input type="number" min="1" max="360" value={cookingTime} onChange={(event) => setCookingTime(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#DDD5CC] bg-white px-4 py-3.5 text-sm" />
          </label>
        </div>

        <label className="mt-4 block text-xs font-semibold text-[#5F695F]">
          Ingredientes · uno por línea
          <textarea value={ingredients} onChange={(event) => setIngredients(event.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-[#DDD5CC] bg-white px-4 py-3 text-sm leading-6" placeholder={"Pechuga de pollo | 300 g\nPatatas | 400 g"} />
          <span className="mt-1 block font-normal text-[#91877E]">Separa ingrediente y cantidad con una barra |</span>
        </label>

        <label className="mt-4 block text-xs font-semibold text-[#5F695F]">
          Preparación · un paso por línea
          <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-[#DDD5CC] bg-white px-4 py-3 text-sm leading-6" placeholder={"Corta y sazona el pollo.\nCocínalo a la plancha."} />
        </label>

        {errorMessage && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

        <button type="button" disabled={saving} onClick={submit} className="mt-5 w-full rounded-2xl bg-[#D96536] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Guardando..." : meal ? "Guardar cambios" : "Guardar plato"}
        </button>
        {meal && onDelete && (
          <button type="button" disabled={saving} onClick={remove} className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-50">
            Eliminar este plato
          </button>
        )}
      </div>
    </div>
  );
}
