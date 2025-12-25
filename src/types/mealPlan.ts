export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Dessert";
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface MealPlanItem {
    id: string; // Unique ID for the placement
    recipeId: string;
    day: DayOfWeek;
    date: string; // ISO date string YYYY-MM-DD
    mealType: MealType;
    order: number;
}

export const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Dessert"];
