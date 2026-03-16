import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Food } from '../data/mockFoods';
import { PrimaryButton } from '../components/PrimaryButton';
import { ServingSizeInput } from '../components/ServingSizeInput';
import { NutritionPerServing } from '../components/NutritionPerServing';
import { NutritionPer100g } from '../components/NutritionPer100g';
import { supabase } from '../../lib/supabase';

export function ResultScreen() {
  const params = useLocalSearchParams();
  const barcode = params.barcode as string;
  const productData = params.product as string;
  const notFound = params.notFound === 'true';
  const isLabelScan = params.isLabelScan === 'true';
  const errorMessage = params.error as string;

  const product: Food | null = productData ? JSON.parse(productData) : null;

  const originalServingSizeGrams = product?.servingSizeGrams || 100;

  const [servingSizeGrams, setServingSizeGrams] = useState(originalServingSizeGrams);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteId, setFavouriteId] = useState<string | null>(null);

  const labelData = {
    calories: parseFloat((params.calories as string) || '0'),
    protein: parseFloat((params.protein as string) || '0'),
    carbs: parseFloat((params.carbs as string) || '0'),
    fat: parseFloat((params.fat as string) || '0'),
    fiber: parseFloat((params.fiber as string) || '0'),
    servingSizeGrams: parseFloat((params.servingSize as string) || '100'),
  };

  const [labelServingSizeGrams, setLabelServingSizeGrams] = useState(labelData.servingSizeGrams);

  const isUncertain = params.uncertain === 'true';

  useEffect(() => {
    checkIfFavourite();
  }, [product, isLabelScan]);

  const checkIfFavourite = async () => {
    if (!product && !isLabelScan) return;

    const productName = product?.name || 'Nutrition Label Scan';

    try {
      const { data, error } = await supabase
        .from('favourites')
        .select('id')
        .eq('product_name', productName)
        .maybeSingle();

      if (error) {
        console.error('Error checking favourite:', error);
        return;
      }

      if (data) {
        setIsFavourite(true);
        setFavouriteId(data.id);
      } else {
        setIsFavourite(false);
        setFavouriteId(null);
      }
    } catch (error) {
      console.error('Error checking favourite:', error);
    }
  };

  const toggleFavourite = async () => {
    const productName = product?.name || 'Nutrition Label Scan';

    const productDataToSave = isLabelScan
      ? {
          name: 'Nutrition Label Scan',
          isLabelScan: true,
          per100g: labelPer100g,
          servingSizeGrams: labelData.servingSizeGrams,
          uncertain: isUncertain,
        }
      : {
          name: product?.name,
          barcode,
          isLabelScan: false,
          per100g: per100g,
          servingSizeGrams: originalServingSizeGrams,
        };

    if (isFavourite && favouriteId) {
      try {
        const { error } = await supabase
          .from('favourites')
          .delete()
          .eq('id', favouriteId);

        if (error) {
          console.error('Error removing favourite:', error);
          return;
        }

        setIsFavourite(false);
        setFavouriteId(null);
      } catch (error) {
        console.error('Error removing favourite:', error);
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('favourites')
          .insert({
            product_name: productName,
            product_data: productDataToSave,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error adding favourite:', error);
          return;
        }

        setIsFavourite(true);
        setFavouriteId(data.id);
      } catch (error) {
        console.error('Error adding favourite:', error);
      }
    }
  };

  // Goal Calculator state
  type Nutrient = 'protein' | 'calories' | 'carbs' | 'fat' | 'fiber';
  const [selectedNutrient, setSelectedNutrient] = useState<Nutrient>('protein');
  const [targetAmount, setTargetAmount] = useState('');
  const [calculationResult, setCalculationResult] = useState<{
    amountOfProduct: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  } | null>(null);

  /**
   * Per-100g calculation (FIXED, calculated from original API data):
   *
   * factor = 100 / originalServingSizeGrams
   * caloriesPer100g = caloriesPerServing * factor
   * proteinPer100g = proteinPerServing * factor
   * carbsPer100g = carbsPerServing * factor
   * fatPer100g = fatPerServing * factor
   * fiberPer100g = fiberPerServing * factor
   *
   * This converts the original per-serving nutrition values into per-100g values
   * using the ORIGINAL serving size. These values NEVER change.
   */
  const calculatePer100g = () => {
    if (!product) return null;

    const factor = 100 / originalServingSizeGrams;

    return {
      calories: product.caloriesPerServing * factor,
      protein: product.proteinPerServing * factor,
      carbs: product.carbsPerServing * factor,
      fat: product.fatPerServing * factor,
      fiber: product.fiberPerServing * factor,
    };
  };

  const per100g = calculatePer100g();

  /**
   * Per-serving calculation (UPDATES when user changes serving size):
   *
   * per_serving = (per_100g_value / 100) * servingSizeGrams
   *
   * This calculates nutrition values for the user's custom serving size.
   */
  const calculatePerServing = () => {
    if (!per100g) return null;

    return {
      calories: (per100g.calories / 100) * servingSizeGrams,
      protein: (per100g.protein / 100) * servingSizeGrams,
      carbs: (per100g.carbs / 100) * servingSizeGrams,
      fat: (per100g.fat / 100) * servingSizeGrams,
      fiber: (per100g.fiber / 100) * servingSizeGrams,
    };
  };

  const perServing = calculatePerServing();

  const calculateLabelPer100g = () => {
    return {
      calories: (labelData.calories / labelData.servingSizeGrams) * 100,
      protein: (labelData.protein / labelData.servingSizeGrams) * 100,
      carbs: (labelData.carbs / labelData.servingSizeGrams) * 100,
      fat: (labelData.fat / labelData.servingSizeGrams) * 100,
      fiber: (labelData.fiber / labelData.servingSizeGrams) * 100,
    };
  };

  const labelPer100g = calculateLabelPer100g();

  const calculateLabelPerServing = () => {
    return {
      calories: (labelPer100g.calories / 100) * labelServingSizeGrams,
      protein: (labelPer100g.protein / 100) * labelServingSizeGrams,
      carbs: (labelPer100g.carbs / 100) * labelServingSizeGrams,
      fat: (labelPer100g.fat / 100) * labelServingSizeGrams,
      fiber: (labelPer100g.fiber / 100) * labelServingSizeGrams,
    };
  };

  const labelPerServing = calculateLabelPerServing();

  const handleScanAnother = () => {
    router.push('/');
  };

  const handleCalculateGoal = (per100gData: { calories: number; protein: number; carbs: number; fat: number; fiber: number }) => {
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      return;
    }

    const per100gValue = per100gData[selectedNutrient];
    if (per100gValue === 0) {
      return;
    }

    // Formula: amount_of_product = (target / per100g_value) * 100
    const amountOfProduct = (target / per100gValue) * 100;

    // Calculate all other values: (per100g_value * amount_of_product) / 100
    setCalculationResult({
      amountOfProduct: Math.round(amountOfProduct * 10) / 10,
      calories: Math.round(((per100gData.calories * amountOfProduct) / 100) * 10) / 10,
      protein: Math.round(((per100gData.protein * amountOfProduct) / 100) * 10) / 10,
      carbs: Math.round(((per100gData.carbs * amountOfProduct) / 100) * 10) / 10,
      fat: Math.round(((per100gData.fat * amountOfProduct) / 100) * 10) / 10,
      fiber: Math.round(((per100gData.fiber * amountOfProduct) / 100) * 10) / 10,
    });
  };

  const renderGoalCalculator = (per100gData: { calories: number; protein: number; carbs: number; fat: number; fiber: number }) => {
    const nutrientUnit = selectedNutrient === 'calories' ? 'kcal' : 'g';

    return (
      <View style={styles.goalCalculatorContainer}>
        <Text style={styles.goalCalculatorTitle}>GOAL CALCULATOR</Text>
        <Text style={styles.goalCalculatorSubtitle}>Calculate by goal</Text>

        <View style={styles.nutrientButtonsRow}>
          {(['protein', 'calories', 'carbs', 'fat', 'fiber'] as Nutrient[]).map((nutrient) => (
            <TouchableOpacity
              key={nutrient}
              style={[
                styles.nutrientButton,
                selectedNutrient === nutrient && styles.nutrientButtonSelected,
              ]}
              onPress={() => {
                setSelectedNutrient(nutrient);
                setCalculationResult(null);
              }}
            >
              <Text
                style={[
                  styles.nutrientButtonText,
                  selectedNutrient === nutrient && styles.nutrientButtonTextSelected,
                ]}
              >
                {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.goalInputRow}>
          <TextInput
            style={styles.goalInput}
            placeholder={`Target ${selectedNutrient} (${nutrientUnit})`}
            keyboardType="numeric"
            value={targetAmount}
            onChangeText={setTargetAmount}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={() => handleCalculateGoal(per100gData)}
          >
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {calculationResult && (
          <View style={styles.calculationResultContainer}>
            <Text style={styles.calculationResultTitle}>
              To get {targetAmount}{nutrientUnit} {selectedNutrient} you need{' '}
              {calculationResult.amountOfProduct}g of this product
            </Text>
            <Text style={styles.calculationResultValues}>
              Which gives: {calculationResult.calories} kcal | {calculationResult.protein}g protein |{' '}
              {calculationResult.carbs}g carbs | {calculationResult.fat}g fat |{' '}
              {calculationResult.fiber}g fiber
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (isLabelScan && errorMessage) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Error</Text>
          <Text style={styles.notFoundMessage}>{errorMessage}</Text>
          <View style={styles.buttonContainer}>
            <PrimaryButton title="Try again" onPress={handleScanAnother} />
          </View>
        </View>
      </View>
    );
  }

  if (isLabelScan && labelData.calories) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavourite} style={styles.heartButton}>
            <Heart
              size={28}
              color={isFavourite ? '#FF69B4' : '#666666'}
              fill={isFavourite ? '#FF69B4' : 'none'}
            />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.productName}>Nutrition Label Scan</Text>
            {isUncertain && (
              <View style={styles.uncertaintyBanner}>
                <Text style={styles.uncertaintyText}>
                  Some values may be uncertain. Please review the calculated values.
                </Text>
              </View>
            )}

            <ServingSizeInput
              servingSizeGrams={labelServingSizeGrams}
              originalServingSizeGrams={labelData.servingSizeGrams}
              onChangeServingSize={setLabelServingSizeGrams}
            />

            <NutritionPer100g
              calories={labelPer100g.calories}
              protein={labelPer100g.protein}
              carbs={labelPer100g.carbs}
              fat={labelPer100g.fat}
              fiber={labelPer100g.fiber}
            />

            <NutritionPerServing
              calories={labelPerServing.calories}
              protein={labelPerServing.protein}
              carbs={labelPerServing.carbs}
              fat={labelPerServing.fat}
              fiber={labelPerServing.fiber}
            />

            {renderGoalCalculator(labelPer100g)}

            <View style={styles.buttonContainer}>
              <PrimaryButton title="Scan another label" onPress={handleScanAnother} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (!product || notFound) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>
            {errorMessage ? 'Error' : 'Product not found'}
          </Text>
          <Text style={styles.notFoundMessage}>
            {errorMessage || 'Product not found. Try scanning the nutrition label instead.'}
          </Text>
          {barcode && (
            <Text style={styles.barcodeText}>Scanned barcode: {barcode}</Text>
          )}
          <View style={styles.buttonContainer}>
            <PrimaryButton title="Scan another product" onPress={handleScanAnother} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavourite} style={styles.heartButton}>
          <Heart
            size={28}
            color={isFavourite ? '#FF69B4' : '#666666'}
            fill={isFavourite ? '#FF69B4' : 'none'}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.barcodeText}>Barcode: {barcode}</Text>

          <ServingSizeInput
            servingSizeGrams={servingSizeGrams}
            originalServingSizeGrams={originalServingSizeGrams}
            onChangeServingSize={setServingSizeGrams}
          />

          {per100g && (
            <NutritionPer100g
              calories={per100g.calories}
              protein={per100g.protein}
              carbs={per100g.carbs}
              fat={per100g.fat}
              fiber={per100g.fiber}
            />
          )}

          {perServing && (
            <NutritionPerServing
              calories={perServing.calories}
              protein={perServing.protein}
              carbs={perServing.carbs}
              fat={perServing.fat}
              fiber={perServing.fiber}
            />
          )}

          {per100g && renderGoalCalculator(per100g)}

          <View style={styles.buttonContainer}>
            <PrimaryButton title="Scan another product" onPress={handleScanAnother} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2D7A4F',
    fontWeight: '600',
  },
  heartButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  notFoundMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  uncertaintyBanner: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  uncertaintyText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  goalCalculatorContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalCalculatorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  goalCalculatorSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  nutrientButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  nutrientButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  nutrientButtonSelected: {
    backgroundColor: '#2D7A4F',
    borderColor: '#2D7A4F',
  },
  nutrientButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  nutrientButtonTextSelected: {
    color: '#ffffff',
  },
  goalInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  goalInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calculateButton: {
    backgroundColor: '#2D7A4F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  calculationResultContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2D7A4F',
  },
  calculationResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 22,
  },
  calculationResultValues: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
