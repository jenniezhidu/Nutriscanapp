import { View, Text, StyleSheet } from 'react-native';
import { HealthScoreGrade } from '../utils/healthScore';

interface HealthScoreBadgeProps {
  grade: HealthScoreGrade;
  color: string;
  description: string;
  size?: 'small' | 'large';
}

export function HealthScoreBadge({
  grade,
  color,
  description,
  size = 'large',
}: HealthScoreBadgeProps) {
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.container,
        isLarge ? styles.containerLarge : styles.containerSmall,
        { backgroundColor: color },
      ]}
    >
      <Text
        style={[
          styles.grade,
          isLarge ? styles.gradeLarge : styles.gradeSmall,
        ]}
      >
        {grade}
      </Text>
      {isLarge && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  containerLarge: {
    width: 120,
    height: 120,
    paddingHorizontal: 16,
  },
  containerSmall: {
    width: 60,
    height: 60,
  },
  grade: {
    fontWeight: '800',
    color: '#ffffff',
  },
  gradeLarge: {
    fontSize: 48,
    marginBottom: 8,
  },
  gradeSmall: {
    fontSize: 24,
  },
  description: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
