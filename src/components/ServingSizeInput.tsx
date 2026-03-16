import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';

type Unit = 'g' | 'oz' | 'cup' | 'tbsp' | 'tsp' | 'ml' | 'liter' | 'lb' | 'serving';

interface ServingSizeInputProps {
  servingSizeGrams: number;
  originalServingSizeGrams: number;
  onChangeServingSize: (grams: number) => void;
}

const UNIT_CONVERSIONS: Record<Unit, (value: number, originalServing: number) => number> = {
  g: (value) => value,
  oz: (value) => value * 28.35,
  cup: (value) => value * 240,
  tbsp: (value) => value * 15,
  tsp: (value) => value * 5,
  ml: (value) => value * 1,
  liter: (value) => value * 1000,
  lb: (value) => value * 453.59,
  serving: (value, originalServing) => value * originalServing,
};

export function ServingSizeInput({
  servingSizeGrams,
  originalServingSizeGrams,
  onChangeServingSize
}: ServingSizeInputProps) {
  const [inputValue, setInputValue] = useState(servingSizeGrams.toString());
  const [selectedUnit, setSelectedUnit] = useState<Unit>('g');

  const units: Unit[] = ['g', 'oz', 'cup', 'tbsp', 'tsp', 'ml', 'liter', 'lb', 'serving'];

  const handleConfirm = () => {
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      const gramsValue = UNIT_CONVERSIONS[selectedUnit](numericValue, originalServingSizeGrams);
      onChangeServingSize(gramsValue);
    }
    Keyboard.dismiss();
  };

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Serving Size</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
          placeholder="Enter amount"
        />

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.unitSelector}>
        {units.map((unit) => (
          <TouchableOpacity
            key={unit}
            style={[
              styles.unitButton,
              selectedUnit === unit && styles.unitButtonSelected
            ]}
            onPress={() => handleUnitSelect(unit)}
          >
            <Text style={[
              styles.unitButtonText,
              selectedUnit === unit && styles.unitButtonTextSelected
            ]}>
              {unit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.conversionText}>
        = {servingSizeGrams.toFixed(1)}g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#2d8659',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  confirmButton: {
    backgroundColor: '#2d8659',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#ffffff',
  },
  unitButtonSelected: {
    backgroundColor: '#2d8659',
    borderColor: '#2d8659',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  unitButtonTextSelected: {
    color: '#ffffff',
  },
  conversionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
});
