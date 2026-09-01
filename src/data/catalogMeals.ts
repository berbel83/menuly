import { meals as originalMeals } from "./meals";
import type { Category, Meal } from "../types/meal";

type Method = "horno" | "plancha" | "guiso" | "arroz" | "pasta" | "airfryer" | "frio";

function instructionsFor(meal: Meal, method: Method): string[] {
  const ingredients = meal.ingredients
    .map((item) => item.name.toLowerCase())
    .filter(
      (name) =>
        !/(aceite|sal|pimienta|orégano|romero|perejil|pimentón|curry|caldo|limón|lima)/.test(name),
    );
  const main = ingredients[0] ?? "ingrediente principal";
  const side = ingredients.slice(1, 3).join(" y ");

  const methods: Record<Method, string[]> = {
    horno: [
      `Precalienta el horno a 200 °C. Limpia, corta y sazona ${side || "los acompañamientos"}.`,
      `Coloca ${main} y el resto de ingredientes en una fuente, añade el aceite medido y mezcla para repartir el aliño.`,
      `Hornea hasta que ${main} alcance el punto adecuado y la guarnición esté tierna, removiendo o dando la vuelta a mitad de cocción.`,
      "Deja reposar 3 minutos, comprueba el punto y sirve.",
    ],
    plancha: [
      `Prepara ${side || "la guarnición"} y sazona ${main}.`,
      `Calienta bien una sartén o plancha con el aceite y cocina ${main} sin moverlo hasta que se dore.`,
      "Da la vuelta, termina la cocción a fuego medio y prepara mientras la guarnición indicada.",
      "Sirve recién hecho y ajusta el aliño al gusto.",
    ],
    guiso: [
      `Trocea y prepara ${main}, ${side || "las verduras"} antes de empezar.`,
      "Sofríe primero los ingredientes aromáticos con el aceite hasta que comiencen a ablandarse.",
      `Añade ${main}, rehoga para que tome color y cubre con el líquido indicado.`,
      "Cocina a fuego suave hasta que esté tierno, remueve de vez en cuando y rectifica de sal antes de servir.",
    ],
    arroz: [
      `Trocea y sazona ${main}; prepara también ${side || "el resto de ingredientes"}.`,
      "Rehoga la proteína y las verduras con el aceite hasta que empiecen a dorarse.",
      "Incorpora el arroz, mezcla durante un minuto y añade el caldo caliente.",
      "Cuece sin remover en exceso hasta que el arroz esté en su punto y déjalo reposar 5 minutos.",
    ],
    pasta: [
      "Cuece la pasta en agua con sal hasta dejarla al dente y reserva un poco del agua de cocción.",
      `Mientras, cocina ${main} con ${side || "el resto de ingredientes"} en una sartén amplia.`,
      "Añade la pasta escurrida, mezcla con la salsa y usa un poco del agua reservada si necesita quedar más jugosa.",
      "Cocina todo junto un minuto y sirve recién hecho.",
    ],
    airfryer: [
      `Precalienta la airfryer a 190 °C y prepara ${main} con el aliño indicado.`,
      `Coloca ${main} en una sola capa, sin amontonar, y pulveriza o reparte el aceite medido.`,
      "Cocina hasta que quede dorado, dando la vuelta o agitando la cesta a mitad del tiempo.",
      "Comprueba que el interior esté bien cocinado y sirve con la guarnición.",
    ],
    frio: [
      `Lava, seca y corta ${side || "todos los ingredientes frescos"}.`,
      `Prepara ${main} y deja que se temple antes de mezclarlo si se ha cocinado.`,
      "Combina los ingredientes en un bol amplio y prepara el aliño por separado.",
      "Aliña justo antes de servir, mezcla bien y ajusta el punto de sal.",
    ],
  };

  return methods[method];
}

function inferMethod(meal: Meal): Method {
  const name = meal.name.toLowerCase();
  if (name.includes("air fryer")) return "airfryer";
  if (name.includes("horno") || name.includes("pizza") || name.includes("lasaña") || name.includes("rellen")) return "horno";
  if (name.includes("arroz") || name.includes("paella")) return "arroz";
  if (name.includes("pasta") || name.includes("espaguet") || name.includes("macarr")) return "pasta";
  if (name.includes("ensalada") || name.includes("huevos rellenos") || name.includes("wrap")) return "frio";
  if (name.includes("albóndigas") || name.includes("curry")) return "guiso";
  return "plancha";
}

function enrich(meal: Meal): Meal {
  return {
    ...meal,
    description: `${meal.name}, preparado como comida principal completa para dos personas.`,
    collection: "main_fasting",
    tags: [
      meal.cookingTime <= 25 ? "Rápido" : "Cocina casera",
      meal.airFryer ? "Airfryer" : "",
      meal.healthy ? "Equilibrado" : "Capricho",
    ].filter(Boolean),
    instructions: instructionsFor(meal, inferMethod(meal)),
    householdId: null,
    isSystem: true,
  };
}

function ingredient(value: string) {
  const [name, quantity] = value.split("|");
  return { name, quantity };
}

function recipe(
  id: number,
  name: string,
  category: Category,
  cookingTime: number,
  method: Method,
  values: string[],
  tags: string[] = [],
): Meal {
  const meal: Meal = {
    id,
    name,
    category,
    image: "",
    ingredients: values.map(ingredient),
    instructions: [],
    cookingTime,
    difficulty: method === "guiso" || cookingTime >= 45 ? "Media" : "Fácil",
    protein: true,
    healthy: !tags.includes("Capricho"),
    favorite: false,
    airFryer: method === "airfryer",
    notes: "Cantidades orientativas para dos adultos; ajusta la guarnición a vuestro apetito.",
    description: `${name}: una opción variada y completa para la comida principal del día.`,
    collection: "main_fasting",
    tags: [cookingTime <= 25 ? "Rápido" : "Cocina casera", ...tags],
    householdId: null,
    isSystem: true,
  };
  meal.instructions = instructionsFor(meal, method);
  return meal;
}

const additionalMeals: Meal[] = [
  recipe(51, "Lentejas guisadas con verduras y huevo", "Huevos", 45, "guiso", ["Lentejas cocidas|400 g", "Huevos|2", "Zanahoria|1", "Calabacín|1", "Caldo de verduras|500 ml", "Aceite de oliva|1 cucharada"], ["Legumbres", "Saciantes"]),
  recipe(52, "Garbanzos con espinacas y huevo", "Huevos", 30, "guiso", ["Garbanzos cocidos|400 g", "Espinacas|250 g", "Huevos|2", "Ajo|2 dientes", "Pimentón|1 cucharadita", "Aceite de oliva|1 cucharada"], ["Legumbres"]),
  recipe(53, "Ensalada templada de garbanzos y atún", "Ligero", 20, "frio", ["Garbanzos cocidos|350 g", "Atún al natural|2 latas", "Huevos|2", "Zanahoria|1", "Lechuga|150 g", "Aceite de oliva|1 cucharada"], ["Legumbres", "Rápido"]),
  recipe(54, "Judías blancas con merluza", "Pescado", 35, "guiso", ["Judías blancas cocidas|400 g", "Merluza|300 g", "Zanahoria|1", "Caldo de pescado|400 ml", "Ajo|1 diente", "Aceite de oliva|1 cucharada"], ["Legumbres"]),
  recipe(55, "Alubias con pollo y verduras", "Pollo", 40, "guiso", ["Alubias cocidas|400 g", "Pechuga de pollo|300 g", "Zanahoria|1", "Calabacín|1", "Caldo de pollo|400 ml", "Aceite de oliva|1 cucharada"], ["Legumbres"]),
  recipe(56, "Potaje rápido de garbanzos y bacalao", "Pescado", 35, "guiso", ["Garbanzos cocidos|400 g", "Bacalao desalado|300 g", "Espinacas|200 g", "Caldo de pescado|350 ml", "Pimentón|1 cucharadita", "Aceite de oliva|1 cucharada"], ["Legumbres"]),
  recipe(57, "Pollo guisado con zanahoria y patata", "Pollo", 50, "guiso", ["Muslos de pollo sin piel|500 g", "Patatas|350 g", "Zanahorias|2", "Caldo de pollo|400 ml", "Ajo|2 dientes", "Aceite de oliva|1 cucharada"]),
  recipe(58, "Pollo en salsa de almendras", "Pollo", 45, "guiso", ["Pechuga de pollo|350 g", "Almendras naturales|30 g", "Cebolla|0,5", "Caldo de pollo|300 ml", "Ajo|1 diente", "Aceite de oliva|1 cucharada"]),
  recipe(59, "Pollo mediterráneo con verduras", "Pollo", 40, "horno", ["Pechuga de pollo|350 g", "Calabacín|1", "Berenjena|1", "Tomates cherry|150 g", "Aceite de oliva|1 cucharada", "Orégano|1 cucharadita"]),
  recipe(60, "Muslos de pollo al ajillo con patatas", "Pollo", 50, "horno", ["Muslos de pollo sin piel|500 g", "Patatas|400 g", "Ajo|4 dientes", "Limón|1", "Aceite de oliva|1 cucharada", "Perejil|Al gusto"]),
  recipe(61, "Pavo guisado con champiñones", "Pollo", 40, "guiso", ["Pavo en dados|350 g", "Champiñones|250 g", "Cebolla|0,5", "Caldo de pollo|300 ml", "Aceite de oliva|1 cucharada"]),
  recipe(62, "Pavo al horno con boniato", "Pollo", 40, "horno", ["Filetes de pavo|350 g", "Boniato|400 g", "Calabacín|1", "Aceite de oliva|1 cucharada", "Pimentón|1 cucharadita"]),
  recipe(63, "Tacos de pollo con aguacate", "Wraps", 25, "plancha", ["Pechuga de pollo|300 g", "Tortillas de maíz|6", "Aguacate|1", "Lechuga|150 g", "Lima|1", "Yogur natural|1"]),
  recipe(64, "Burrito de pollo, arroz y frijoles", "Wraps", 30, "plancha", ["Pechuga de pollo|250 g", "Tortillas integrales|2 grandes", "Arroz cocido|160 g", "Frijoles cocidos|150 g", "Lechuga|100 g", "Yogur natural|1"]),
  recipe(65, "Ternera guisada con patatas", "Carne", 60, "guiso", ["Ternera para guisar|400 g", "Patatas|350 g", "Zanahorias|2", "Caldo de carne|500 ml", "Cebolla|0,5", "Aceite de oliva|1 cucharada"]),
  recipe(66, "Ternera con champiñones y arroz", "Carne", 30, "plancha", ["Ternera en tiras|300 g", "Champiñones|250 g", "Arroz|150 g", "Ajo|1 diente", "Aceite de oliva|1 cucharada"]),
  recipe(67, "Solomillo de cerdo con boniato", "Carne", 40, "horno", ["Solomillo de cerdo|400 g", "Boniato|400 g", "Cebolla|1", "Aceite de oliva|1 cucharada", "Romero|1 cucharadita"]),
  recipe(68, "Lomo de cerdo con verduras", "Carne", 30, "plancha", ["Filetes de lomo|350 g", "Calabacín|1", "Champiñones|200 g", "Arroz|130 g", "Aceite de oliva|1 cucharada"]),
  recipe(69, "Albóndigas de pavo en salsa", "Carne", 45, "guiso", ["Carne picada de pavo|400 g", "Huevo|1", "Pan rallado|30 g", "Tomate triturado|300 g", "Zanahoria|1", "Aceite de oliva|1 cucharada"]),
  recipe(70, "Pastel de carne y patata", "Carne", 55, "horno", ["Carne picada de ternera|350 g", "Patatas|500 g", "Zanahoria|1", "Tomate triturado|150 g", "Queso rallado|50 g", "Aceite de oliva|1 cucharada"]),
  recipe(71, "Dorada al horno con patatas", "Pescado", 40, "horno", ["Doradas limpias|2", "Patatas|400 g", "Cebolla|1", "Limón|1", "Aceite de oliva|1 cucharada"]),
  recipe(72, "Lubina al limón con verduras", "Pescado", 35, "horno", ["Lubinas limpias|2", "Calabacín|1", "Zanahorias|2", "Limón|1", "Aceite de oliva|1 cucharada"]),
  recipe(73, "Bacalao con tomate y patata", "Pescado", 40, "guiso", ["Lomos de bacalao|350 g", "Tomate triturado|300 g", "Patatas|300 g", "Cebolla|0,5", "Aceite de oliva|1 cucharada"]),
  recipe(74, "Merluza en salsa verde con guisantes", "Pescado", 30, "guiso", ["Lomos de merluza|350 g", "Guisantes|180 g", "Caldo de pescado|250 ml", "Ajo|2 dientes", "Perejil|Al gusto", "Aceite de oliva|1 cucharada"]),
  recipe(75, "Salmón con boniato en airfryer", "Pescado", 30, "airfryer", ["Lomos de salmón|2", "Boniato|400 g", "Limón|1", "Aceite de oliva|1 cucharada", "Eneldo|Al gusto"], ["Omega 3"]),
  recipe(76, "Atún encebollado con arroz", "Pescado", 35, "guiso", ["Atún fresco en dados|350 g", "Cebollas|2", "Arroz|140 g", "Caldo de pescado|200 ml", "Aceite de oliva|1 cucharada"]),
  recipe(77, "Calamares salteados con arroz", "Pescado", 30, "plancha", ["Calamares limpios|400 g", "Arroz|150 g", "Ajo|2 dientes", "Perejil|Al gusto", "Aceite de oliva|1 cucharada"]),
  recipe(78, "Brochetas de gambas y verduras", "Pescado", 25, "plancha", ["Gambas peladas|350 g", "Calabacín|1", "Pimiento rojo|1", "Arroz|130 g", "Aceite de oliva|1 cucharada"]),
  recipe(79, "Pasta integral con atún y verduras", "Pasta", 25, "pasta", ["Pasta integral|170 g", "Atún al natural|2 latas", "Calabacín|1", "Tomate triturado|200 g", "Aceite de oliva|1 cucharada"]),
  recipe(80, "Pasta boloñesa de lentejas", "Pasta", 35, "pasta", ["Pasta|170 g", "Lentejas cocidas|300 g", "Tomate triturado|300 g", "Zanahoria|1", "Cebolla|0,5", "Aceite de oliva|1 cucharada"], ["Legumbres"]),
  recipe(81, "Macarrones con pollo y espinacas", "Pasta", 30, "pasta", ["Macarrones|170 g", "Pechuga de pollo|250 g", "Espinacas|200 g", "Leche evaporada|120 ml", "Aceite de oliva|1 cucharadita"]),
  recipe(82, "Espaguetis con gambas y calabacín", "Pasta", 25, "pasta", ["Espaguetis|170 g", "Gambas peladas|250 g", "Calabacín|1", "Ajo|2 dientes", "Aceite de oliva|1 cucharada"]),
  recipe(83, "Cuscús con pollo y verduras", "Arroz", 30, "plancha", ["Cuscús|160 g", "Pechuga de pollo|300 g", "Calabacín|1", "Zanahoria|1", "Caldo de pollo|180 ml", "Aceite de oliva|1 cucharada"]),
  recipe(84, "Quinoa con salmón y aguacate", "Arroz", 25, "frio", ["Quinoa|150 g", "Salmón|250 g", "Aguacate|1", "Zanahoria|1", "Limón|1", "Aceite de oliva|1 cucharadita"]),
  recipe(85, "Arroz meloso con pollo y verduras", "Arroz", 40, "arroz", ["Arroz|170 g", "Pollo troceado|350 g", "Calabacín|1", "Zanahoria|1", "Caldo de pollo|600 ml", "Aceite de oliva|1 cucharada"]),
  recipe(86, "Arroz con bacalao y espinacas", "Arroz", 40, "arroz", ["Arroz|170 g", "Bacalao desalado|300 g", "Espinacas|180 g", "Caldo de pescado|500 ml", "Aceite de oliva|1 cucharada"]),
  recipe(87, "Tortilla de calabacín con ensalada", "Huevos", 25, "plancha", ["Huevos|5", "Calabacín|1", "Lechuga|150 g", "Zanahoria|1", "Aceite de oliva|1 cucharada"]),
  recipe(88, "Huevos al plato con verduras", "Huevos", 30, "horno", ["Huevos|4", "Tomate triturado|250 g", "Calabacín|1", "Guisantes|120 g", "Aceite de oliva|1 cucharada"]),
  recipe(89, "Shakshuka suave con garbanzos", "Huevos", 30, "guiso", ["Huevos|4", "Garbanzos cocidos|250 g", "Tomate triturado|350 g", "Pimiento rojo|0,5", "Cebolla|0,5", "Aceite de oliva|1 cucharada"], ["Legumbres"]),
  recipe(90, "Revuelto de pollo, champiñones y patata", "Huevos", 30, "plancha", ["Huevos|4", "Pechuga de pollo|200 g", "Champiñones|200 g", "Patatas|300 g", "Aceite de oliva|1 cucharada"]),
  recipe(91, "Ensalada completa de salmón y patata", "Ligero", 30, "frio", ["Salmón|250 g", "Patatas|350 g", "Huevos|2", "Lechuga|150 g", "Zanahoria|1", "Aceite de oliva|1 cucharada"]),
  recipe(92, "Ensalada de pasta, pollo y huevo", "Ligero", 25, "frio", ["Pasta|160 g", "Pechuga de pollo|250 g", "Huevos|2", "Lechuga|120 g", "Zanahoria|1", "Aceite de oliva|1 cucharada"]),
  recipe(93, "Bowl de arroz, atún y aguacate", "Ligero", 20, "frio", ["Arroz cocido|160 g", "Atún al natural|2 latas", "Aguacate|1", "Huevos|2", "Zanahoria|1", "Limón|1"]),
  recipe(94, "Bowl de pollo, quinoa y verduras", "Ligero", 30, "plancha", ["Pechuga de pollo|300 g", "Quinoa|150 g", "Calabacín|1", "Zanahoria|1", "Aguacate|0,5", "Aceite de oliva|1 cucharada"]),
  recipe(95, "Pizza integral de verduras y pollo", "Caprichos", 35, "horno", ["Base integral de pizza|1", "Pechuga de pollo|220 g", "Tomate triturado|120 g", "Calabacín|0,5", "Queso mozzarella|80 g"], ["Fin de semana"]),
  recipe(96, "Hamburguesa de salmón con patatas", "Caprichos", 35, "plancha", ["Salmón picado|350 g", "Pan de hamburguesa|2", "Huevo|1", "Lechuga|100 g", "Patatas|350 g", "Aceite de oliva|1 cucharada"], ["Fin de semana"]),
  recipe(97, "Piadina de pollo y verduras", "Wraps", 25, "plancha", ["Piadinas|2", "Pechuga de pollo|280 g", "Calabacín|1", "Queso mozzarella|60 g", "Lechuga|100 g"]),
  recipe(98, "Quesadillas de pollo y frijoles", "Wraps", 25, "plancha", ["Tortillas de trigo|4", "Pechuga de pollo|250 g", "Frijoles cocidos|180 g", "Queso rallado|70 g", "Lechuga|100 g"]),
  recipe(99, "Canelones de carne y verduras", "Pasta", 55, "horno", ["Placas de canelones|12", "Carne picada de ternera|350 g", "Calabacín|1", "Tomate triturado|250 g", "Bechamel ligera|250 ml", "Queso rallado|60 g"]),
  recipe(100, "Lasaña de pollo y verduras", "Pasta", 55, "horno", ["Placas de lasaña|8", "Pechuga de pollo picada|350 g", "Calabacín|1", "Zanahoria|1", "Bechamel ligera|250 ml", "Queso rallado|60 g"]),
];

export const catalogMeals = [...originalMeals.map(enrich), ...additionalMeals];
