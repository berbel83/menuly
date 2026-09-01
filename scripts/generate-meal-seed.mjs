import { writeFileSync } from "node:fs";
import { createJiti } from "jiti";

const [, , sourcePath, outputPath] = process.argv;

if (!sourcePath || !outputPath) {
  throw new Error("Uso: node generate-meal-seed.mjs <fuente.ts> <salida.sql>");
}

const jiti = createJiti(import.meta.url);
const { catalogMeals } = await jiti.import(sourcePath);

function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const values = catalogMeals.map((meal) => `(
  ${meal.id},
  ${literal(meal.name)},
  ${literal(meal.description ?? "")},
  ${literal(meal.collection ?? "main_fasting")},
  ${literal(meal.category)},
  ${literal(JSON.stringify(meal.ingredients))}::jsonb,
  ${literal(JSON.stringify(meal.instructions))}::jsonb,
  ${meal.cookingTime},
  ${literal(meal.difficulty)},
  array[${(meal.tags ?? []).map(literal).join(", ")}]::text[],
  ${meal.protein},
  ${meal.healthy},
  ${meal.airFryer},
  ${literal(meal.notes ?? "")}
)`).join(",\n");

const sql = `begin;

insert into public.meals (
  id, name, description, collection, category, ingredients, instructions,
  cooking_time, difficulty, tags, protein, healthy, air_fryer, notes
)
values
${values}
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  collection = excluded.collection,
  category = excluded.category,
  ingredients = excluded.ingredients,
  instructions = excluded.instructions,
  cooking_time = excluded.cooking_time,
  difficulty = excluded.difficulty,
  tags = excluded.tags,
  protein = excluded.protein,
  healthy = excluded.healthy,
  air_fryer = excluded.air_fryer,
  notes = excluded.notes,
  updated_at = now()
where public.meals.household_id is null;

commit;
`;

writeFileSync(outputPath, sql);
