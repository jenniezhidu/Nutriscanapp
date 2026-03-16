import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Info } from 'lucide-react-native';

interface NutritionPer100gProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function NutritionPer100g({ calories, protein, carbs, fat, fiber }: NutritionPer100gProps) {
  const round = (value: number) => Math.round(value * 10) / 10;

  const getCaloriesColor = (cal: number): string => {
    if (cal < 40) return '#1E7E34';
    if (cal < 150) return '#85BB2F';
    if (cal < 250) return '#FFCC00';
    if (cal < 400) return '#EF7D00';
    return '#CC1F27';
  };

  const getProteinColor = (prot: number): string => {
    if (prot > 20) return '#1E7E34';
    if (prot >= 12) return '#85BB2F';
    if (prot >= 5) return '#FFCC00';
    if (prot >= 2) return '#EF7D00';
    return '#CC1F27';
  };

  const getFatColor = (f: number): string => {
    if (f < 3) return '#1E7E34';
    if (f < 10) return '#85BB2F';
    if (f < 15) return '#FFCC00';
    if (f < 20) return '#EF7D00';
    return '#CC1F27';
  };

  const getCarbsColor = (c: number): string => {
    if (c < 5) return '#1E7E34';
    if (c < 15) return '#85BB2F';
    if (c < 22.5) return '#FFCC00';
    if (c < 35) return '#EF7D00';
    return '#CC1F27';
  };

  const getFiberColor = (fib: number): string => {
    if (fib > 6) return '#1E7E34';
    if (fib >= 3) return '#85BB2F';
    if (fib >= 1) return '#FFCC00';
    if (fib >= 0.5) return '#EF7D00';
    return '#CC1F27';
  };

  const showInfo = () => {
    Alert.alert(
      'Color Coding',
      'Color coding uses Nutriscore colors (A-E scale) based on EU nutrition standards per 100g.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Per 100g</Text>
        <TouchableOpacity onPress={showInfo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Info size={18} color="#666666" />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Calories</Text>
        <View style={[styles.pill, { backgroundColor: getCaloriesColor(calories) }]}>
          <Text style={styles.pillText}>{round(calories)} kcal</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Protein</Text>
        <View style={[styles.pill, { backgroundColor: getProteinColor(protein) }]}>
          <Text style={styles.pillText}>{round(protein)} g</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Carbs</Text>
        <View style={[styles.pill, { backgroundColor: getCarbsColor(carbs) }]}>
          <Text style={styles.pillText}>{round(carbs)} g</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fat</Text>
        <View style={[styles.pill, { backgroundColor: getFatColor(fat) }]}>
          <Text style={styles.pillText}>{round(fat)} g</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fiber</Text>
        <View style={[styles.pill, { backgroundColor: getFiberColor(fiber) }]}>
          <Text style={styles.pillText}>{round(fiber)} g</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  pill: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  pillText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
