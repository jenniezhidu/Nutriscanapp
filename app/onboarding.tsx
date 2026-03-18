import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, FileText, Heart, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Know what you eat',
    description: 'Scan any food in seconds and get full nutrition facts instantly.',
    icon: <Sparkles size={100} color="#2d8659" />,
    color: '#e8f5e9',
  },
  {
    id: '2',
    title: 'Scan a barcode',
    description: 'Point your camera at any barcode and get instant nutrition data from millions of products.',
    icon: <Camera size={100} color="#2d8659" />,
    color: '#e8f5e9',
  },
  {
    id: '3',
    title: 'Scan nutrition labels',
    description: 'Take a photo of any nutrition label and our AI reads it for you—even handwritten ones.',
    note: '5 free scans per day',
    icon: <FileText size={100} color="#2d8659" />,
    color: '#e8f5e9',
  },
  {
    id: '4',
    title: 'Save your favourites',
    description: 'Heart any product to save it and find it quickly next time.',
    icon: <Heart size={100} color="#FF69B4" fill="#FF69B4" />,
    color: '#fce4ec',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    router.replace('/login');
  };

  const renderSlide = ({ item }: any) => (
    <View style={[styles.slide, { backgroundColor: item.color }]}>
      <View style={styles.iconContainer}>{item.icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
        {item.note && <Text style={styles.slideNote}>{item.note}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonWrapper}>
          {currentSlideIndex === SLIDES.length - 1 ? (
            <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => flatListRef.current?.scrollToIndex({ index: currentSlideIndex + 1 })}
            >
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  slideNote: {
    fontSize: 14,
    color: '#2d8659',
    fontWeight: '600',
    marginTop: 12,
  },
  footer: {
    height: height * 0.2,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#2d8659',
    width: 20,
  },
  buttonWrapper: {
    width: '100%',
  },
  nextButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2d8659',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  getStartedButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2d8659',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
