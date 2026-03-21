import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TrialBannerProps {
  daysLeft: number;
  onUpgrade: () => void;
}

export default function TrialBanner({ daysLeft, onUpgrade }: TrialBannerProps) {
  if (daysLeft > 2) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Your free trial ends in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={onUpgrade}>
        <Text style={styles.buttonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '700',
  },
});
