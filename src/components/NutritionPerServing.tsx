import { View, Text, StyleSheet } from 'react-native';

interface NutritionPerServingProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function NutritionPerServing({ calories, protein, carbs, fat, fiber }: NutritionPerServingProps) {
  const round = (value: number) => Math.round(value * 10) / 10;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Per Serving</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Calories</Text>
        <Text style={styles.value}>{round(calories)} kcal</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Protein</Text>
        <Text style={styles.value}>{round(protein)} g</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Carbs</Text>
        <Text style={styles.value}>{round(carbs)} g</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fat</Text>
        <Text style={styles.value}>{round(fat)} g</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fiber</Text>
        <Text style={styles.value}>{round(fiber)} g</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
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
    color: '#1a1a1a',
  },
});
