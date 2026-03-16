export interface Food {
  barcode: string;
  name: string;
  servingSizeGrams: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  fiberPerServing: number;
}

export const mockFoods: Food[] = [
  {
    barcode: '5060292302560',
    name: 'Oat Granola Bar',
    servingSizeGrams: 50,
    caloriesPerServing: 125,
    proteinPerServing: 4.3,
    carbsPerServing: 16,
    fatPerServing: 5,
    fiberPerServing: 2.1,
  },
  {
    barcode: '7622300441227',
    name: 'Dark Chocolate Bar',
    servingSizeGrams: 100,
    caloriesPerServing: 546,
    proteinPerServing: 6.2,
    carbsPerServing: 47,
    fatPerServing: 36,
    fiberPerServing: 11,
  },
  {
    barcode: '5000112576221',
    name: 'Protein Shake',
    servingSizeGrams: 330,
    caloriesPerServing: 165,
    proteinPerServing: 20,
    carbsPerServing: 18,
    fatPerServing: 1.5,
    fiberPerServing: 0.5,
  },
  {
    barcode: '8712100648403',
    name: 'Greek Yogurt',
    servingSizeGrams: 170,
    caloriesPerServing: 102,
    proteinPerServing: 17,
    carbsPerServing: 6.8,
    fatPerServing: 0.9,
    fiberPerServing: 0,
  },
  {
    barcode: '4008400402826',
    name: 'Whole Grain Bread',
    servingSizeGrams: 30,
    caloriesPerServing: 72,
    proteinPerServing: 2.7,
    carbsPerServing: 12,
    fatPerServing: 1.2,
    fiberPerServing: 2.4,
  },
];
