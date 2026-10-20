interface MealOption { description: string; portion: string; calories: number }
export interface MonthlyMeal extends MealOption { title: string; time: string }

const breakfasts: MealOption[] = [
  { description: 'Overnight oats con yogur y frutos rojos', portion: '⅓ taza de avena, ½ taza de leche, ¼ taza de yogur y ½ taza de fruta', calories: 380 },
  { description: 'Huevos con frijoles y tortilla', portion: '2 huevos, ½ taza de frijoles, 1 tortilla y ¼ de aguacate', calories: 390 },
  { description: 'Tostadas integrales con queso y fruta', portion: '2 tostadas, 2 oz de queso fresco y 1 porción de fruta', calories: 370 },
  { description: 'Yogur con granola, semillas y fresas', portion: '¾ taza de yogur, 2 cdas. de granola, 2 cdas. de semillas y ½ taza de fresas', calories: 360 },
  { description: 'Quesadillas de desayuno', portion: '2 tortillas, ½ taza de frijoles, 1½ oz de mozzarella y ¼ de aguacate', calories: 400 },
];

const morningSnacks: MealOption[] = [
  { description: 'Manzana con almendras', portion: '1 manzana mediana y 6 almendras', calories: 170 },
  { description: 'Papaya con semillas', portion: '¾ taza de papaya y 2 cdas. de semillas', calories: 160 },
  { description: 'Yogur griego con fruta', portion: '1 yogur griego y ½ taza de fruta', calories: 180 },
  { description: 'Pera con maní', portion: '1 pera mediana y 10 maníes naturales', calories: 175 },
];

const lunches: MealOption[] = [
  { description: 'Pollo a la plancha, arroz integral y ensalada', portion: '5 oz de pollo, ⅓ taza de arroz y 1½ taza de ensalada', calories: 560 },
  { description: 'Tacos de camarones con guacamole', portion: '3 tortillas, 5 oz de camarones, ¼ de aguacate y 1 taza de chirmol', calories: 550 },
  { description: 'Bowl mexicano de pollo', portion: '5 oz de pollo, ⅓ taza de arroz, ½ taza de frijoles y vegetales', calories: 570 },
  { description: 'Pasta integral con atún y vegetales', portion: '⅔ taza de pasta, 1 lata de atún en agua y 1 taza de vegetales', calories: 540 },
  { description: 'Carne magra con puré y ensalada', portion: '5 oz de carne, ½ taza de puré y 1½ taza de ensalada', calories: 580 },
  { description: 'Salmón con quinoa y vegetales', portion: '5 oz de salmón, ⅓ taza de quinoa y 1 taza de vegetales', calories: 575 },
];

const afternoonSnacks: MealOption[] = [
  { description: 'Batido de fruta con bebida de almendra', portion: '1½ taza de bebida de almendra, ½ taza de fruta y 1 cda. de mantequilla de maní', calories: 220 },
  { description: 'Yogur con chía y fruta', portion: '1 yogur griego, 2 cdas. de chía y ½ taza de fruta', calories: 210 },
  { description: 'Tostada con mantequilla de maní', portion: '1 tostada integral, 1 cda. de mantequilla de maní y ½ taza de fruta', calories: 215 },
  { description: 'Pudín de chía y cocoa', portion: '1 yogur natural, 2 cdas. de chía y cocoa sin azúcar', calories: 200 },
];

const dinners: MealOption[] = [
  { description: 'Crema de verduras con tostada integral', portion: '1½ taza de crema, 1 tostada integral y 2 oz de queso fresco', calories: 410 },
  { description: 'Wraps de pollo con vegetales', portion: '3 tortillas pequeñas, 4 oz de pollo, vegetales y ¼ de aguacate', calories: 430 },
  { description: 'Ensalada mexicana con pollo', portion: '2 tazas de vegetales, 4 oz de pollo, ½ taza de frijoles y ¼ de aguacate', calories: 420 },
  { description: 'Sándwich integral de pollo', portion: '2 rebanadas de pan, 4 oz de pollo, vegetales y 1 cda. de aderezo ligero', calories: 425 },
  { description: 'Quesadillas con frijoles y chirmol', portion: '3 tortillas, 3 oz de mozzarella, ½ taza de frijoles y 1 taza de chirmol', calories: 440 },
];

export function monthlyMealsForDay(day: number, monthIndex = 9, calorieTarget = 1750): MonthlyMeal[] {
  const offset = day + monthIndex;
  const pick = (title: string, time: string, options: MealOption[], extra: number): MonthlyMeal => ({ title, time, ...options[(offset + extra) % options.length] });
  const meals = [
    pick('Desayuno', '07:00', breakfasts, 0),
    pick('Merienda', '10:30', morningSnacks, 1),
    pick('Almuerzo', '13:00', lunches, 2),
    pick('Merienda', '16:30', afternoonSnacks, 3),
    pick('Cena', '19:30', dinners, 4),
  ];
  const total = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const adjusted = meals.map((meal) => ({ ...meal, calories: Math.round((meal.calories * calorieTarget / total) / 5) * 5 }));
  adjusted[adjusted.length - 1].calories += calorieTarget - adjusted.reduce((sum, meal) => sum + meal.calories, 0);
  return adjusted;
}
