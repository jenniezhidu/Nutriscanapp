import { Food } from '../data/mockFoods';
import { supabase } from '../../lib/supabase';

/**
 * Looks up a product in the Supabase database by barcode
 */
async function getProductFromDatabase(barcode: string): Promise<Food | null> {
  try {
    const { data, error } = await supabase
      .from('scanned_products')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Convert database format to Food format
    const servingSizeGrams = data.serving_size || 100;
    const factor = servingSizeGrams / 100;

    return {
      barcode: data.barcode,
      name: data.product_name,
      servingSizeGrams,
      caloriesPerServing: data.calories_per_100g * factor,
      proteinPerServing: data.protein_per_100g * factor,
      carbsPerServing: data.carbs_per_100g * factor,
      fatPerServing: data.fat_per_100g * factor,
      fiberPerServing: data.fiber_per_100g * factor,
    };
  } catch (error) {
    console.error('Error looking up product in database:', error);
    return null;
  }
}

/**
 * Saves a scanned product to the database
 */
async function saveScannedProduct(
  barcode: string,
  productName: string,
  servingSize: number,
  caloriesPer100g: number,
  proteinPer100g: number,
  carbsPer100g: number,
  fatPer100g: number,
  fiberPer100g: number
): Promise<void> {
  try {
    const { error } = await supabase.from('scanned_products').insert({
      barcode,
      product_name: productName,
      serving_size: servingSize,
      calories_per_100g: caloriesPer100g,
      protein_per_100g: proteinPer100g,
      carbs_per_100g: carbsPer100g,
      fat_per_100g: fatPer100g,
      fiber_per_100g: fiberPer100g,
    });

    if (error) {
      // Ignore duplicate key errors (product already exists in database)
      if (error.code === '23505') {
        console.log('Product already exists in database, skipping save');
      } else {
        console.error('Error saving scanned product:', error);
      }
    }
  } catch (error) {
    console.error('Error saving scanned product:', error);
  }
}

/**
 * Fetches product data from OpenFoodFacts API with retry logic
 */
async function fetchFromOpenFoodFacts(barcode: string, retryCount = 0): Promise<Food | null> {
  const maxRetries = 1;

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { timeout: 10000 }
    );

    if (!response.ok) {
      if (retryCount < maxRetries) {
        console.log(`⚠️ API call failed (status ${response.status}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchFromOpenFoodFacts(barcode, retryCount + 1);
      }
      return null;
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      if (retryCount < maxRetries) {
        console.log('⚠️ Product not found (status 0), retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchFromOpenFoodFacts(barcode, retryCount + 1);
      }
      return null;
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    const servingSizeGrams = product.serving_quantity
      ? parseFloat(product.serving_quantity)
      : 100;

    const caloriesPerServing = nutriments['energy-kcal_serving']
      ? parseFloat(nutriments['energy-kcal_serving'])
      : nutriments['energy-kcal_100g']
      ? (parseFloat(nutriments['energy-kcal_100g']) * servingSizeGrams) / 100
      : 0;

    const proteinPerServing = nutriments['proteins_serving']
      ? parseFloat(nutriments['proteins_serving'])
      : nutriments['proteins_100g']
      ? (parseFloat(nutriments['proteins_100g']) * servingSizeGrams) / 100
      : 0;

    const carbsPerServing = nutriments['carbohydrates_serving']
      ? parseFloat(nutriments['carbohydrates_serving'])
      : nutriments['carbohydrates_100g']
      ? (parseFloat(nutriments['carbohydrates_100g']) * servingSizeGrams) / 100
      : 0;

    const fatPerServing = nutriments['fat_serving']
      ? parseFloat(nutriments['fat_serving'])
      : nutriments['fat_100g']
      ? (parseFloat(nutriments['fat_100g']) * servingSizeGrams) / 100
      : 0;

    const fiberPerServing = nutriments['fiber_serving']
      ? parseFloat(nutriments['fiber_serving'])
      : nutriments['fiber_100g']
      ? (parseFloat(nutriments['fiber_100g']) * servingSizeGrams) / 100
      : 0;

    const foodProduct = {
      barcode,
      name: product.product_name || 'Unknown Product',
      servingSizeGrams,
      caloriesPerServing,
      proteinPerServing,
      carbsPerServing,
      fatPerServing,
      fiberPerServing,
    };

    // Calculate per-100g values and save to database (only if not already cached)
    const factor = 100 / servingSizeGrams;
    console.log('💾 Saving product to database for future free lookups');
    await saveScannedProduct(
      barcode,
      foodProduct.name,
      servingSizeGrams,
      caloriesPerServing * factor,
      proteinPerServing * factor,
      carbsPerServing * factor,
      fatPerServing * factor,
      fiberPerServing * factor
    );

    return foodProduct;
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log('⚠️ Network error, retrying...', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchFromOpenFoodFacts(barcode, retryCount + 1);
    }
    console.error('Error fetching product from OpenFoodFacts:', error);
    return null;
  }
}

/**
 * Looks up a food product by its barcode.
 * Checks Supabase database first, then falls back to OpenFoodFacts API.
 *
 * OpenFoodFacts is a free, open database of food products.
 * No API key is required for basic product lookups.
 *
 * API Documentation: https://world.openfoodfacts.org/data
 */
export async function getFoodByBarcode(barcode: string): Promise<Food | null> {
  // First, check our database
  console.log('🔍 Checking Supabase database for barcode:', barcode);
  const cachedProduct = await getProductFromDatabase(barcode);

  if (cachedProduct) {
    console.log('✅ Product found in database (free lookup):', cachedProduct.name);
    return cachedProduct;
  }

  console.log('💸 Product not in database, checking OpenFoodFacts API...');
  return fetchFromOpenFoodFacts(barcode);
}

/**
 * Checks if a product with the given name exists in the database
 */
export async function checkProductByName(productName: string): Promise<{
  product_name: string;
  serving_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
} | null> {
  try {
    console.log('🔍 Checking database for product name:', productName);

    // Normalize product name for comparison (case-insensitive, trim whitespace)
    const normalizedName = productName.trim().toLowerCase();

    const { data, error } = await supabase
      .from('scanned_products')
      .select('*')
      .ilike('product_name', normalizedName)
      .maybeSingle();

    if (error || !data) {
      console.log('💸 Product not found in database');
      return null;
    }

    // Convert database format to NutritionData format
    const servingSizeGrams = data.serving_size || 100;
    const factor = servingSizeGrams / 100;

    return {
      product_name: data.product_name,
      serving_g: servingSizeGrams,
      calories: data.calories_per_100g * factor,
      protein_g: data.protein_per_100g * factor,
      carbs_g: data.carbs_per_100g * factor,
      fat_g: data.fat_per_100g * factor,
      fiber_g: data.fiber_per_100g ? data.fiber_per_100g * factor : null,
    };
  } catch (error) {
    console.error('Error checking product by name:', error);
    return null;
  }
}

/**
 * Saves nutrition label scan data to the database
 */
export async function saveLabelScan(
  productName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  servingSize: number
): Promise<void> {
  const factor = 100 / servingSize;
  console.log('💾 Saving label scan to database:', productName);
  await saveScannedProduct(
    'label-scan-' + Date.now(),
    productName,
    servingSize,
    calories * factor,
    protein * factor,
    carbs * factor,
    fat * factor,
    fiber * factor
  );
}
