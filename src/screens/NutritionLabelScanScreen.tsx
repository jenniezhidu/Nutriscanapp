import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { router, useFocusEffect } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { saveLabelScan, checkProductByName } from '../services/foodService';

interface NutritionData {
  product_name: string;
  serving_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
}

export function NutritionLabelScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(false);
  const cameraRef = useRef<any>(null);
  const isProcessing = useRef(false);

  useFocusEffect(() => {
    isProcessing.current = false;
  });

  useEffect(() => {
    requestMediaLibraryPermission();
  }, []);

  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        setHasMediaLibraryPermission(true);
        await loadLastPhoto();
      } else {
        setHasMediaLibraryPermission(false);
      }
    } catch (error) {
      console.log('Could not request media library permission:', error);
      setHasMediaLibraryPermission(false);
    }
  };

  const loadLastPhoto = async () => {
    try {
      const recentPhotos = await MediaLibrary.getAssetsAsync({
        first: 1,
        sortBy: ['creationTime'],
        mediaType: 'photo',
      });
      if (recentPhotos.assets.length > 0) {
        setLastPhoto(recentPhotos.assets[0].uri);
      }
    } catch (error) {
      console.log('Could not load last photo:', error);
    }
  };

  const extractTextWithGoogleVision = async (base64Image: string): Promise<string> => {
    console.log('📤 Sending image to Google Cloud Vision API...');
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;

    if (!apiKey) {
      throw new Error('Google Vision API key not configured');
    }

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        } ),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Vision API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const textAnnotations = data.responses[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      throw new Error('No text detected in image');
    }

    const extractedText = textAnnotations[0].description;
    console.log('📥 Google Vision extracted text:');
    console.log('='.repeat(50));
    console.log(extractedText);
    console.log('='.repeat(50));

    return extractedText;
  };

  const parseTextWithGPT = async (extractedText: string): Promise<NutritionData> => {
    console.log('📤 Sending extracted text to GPT-3.5-turbo for parsing...');
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Extract nutrition facts from this label text. Return ONLY a JSON object with numeric values (no units ): { product_name: string, serving_g: number, calories: number, protein_g: number, carbs_g: number, fat_g: number, fiber_g: number or null }

CRITICAL EXTRACTION RULES:
1. Extract values exactly as shown PER SERVING (not per 100g)
2. Return raw numbers only - strip all units (g, kcal, mg, etc)
3. Serving size should be between 10g and 300g (if ambiguous, choose the realistic interpretation)
4. CALORIES EXTRACTION - EXTREMELY IMPORTANT:
   - ONLY read the calories value under "Amount per serving" section
   - This is the LARGE BOLD number directly under "Amount per serving"
   - IGNORE any other calorie numbers on the label (per 100g, daily value %, etc)
   - Double-check: calories per serving should ALWAYS be less than 1000 kcal for normal foods`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }

    let nutritionData: NutritionData;
    try {
      nutritionData = JSON.parse(jsonMatch[0]) as NutritionData;
    } catch (parseError: any) {
      throw new Error(`Failed to parse JSON: ${parseError.message}. Content: ${jsonMatch[0]}`);
    }

    // Apply defaults for missing values
    nutritionData = {
      product_name: nutritionData.product_name || 'Unknown Product',
      serving_g: nutritionData.serving_g || 100,
      calories: nutritionData.calories || 0,
      protein_g: nutritionData.protein_g || 0,
      carbs_g: nutritionData.carbs_g || 0,
      fat_g: nutritionData.fat_g || 0,
      fiber_g: nutritionData.fiber_g ?? null,
    };

    return nutritionData;
  };

  const fallbackToGPT4Vision = async (base64Image: string): Promise<NutritionData> => {
    console.log('⚠️ Falling back to GPT-4o vision...');
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract nutrition facts from this label image. Return ONLY a JSON object with numeric values (no units ): { product_name: string, serving_g: number, calories: number, protein_g: number, carbs_g: number, fat_g: number, fiber_g: number or null }

CRITICAL EXTRACTION RULES:
1. Extract values exactly as shown PER SERVING (not per 100g)
2. Return raw numbers only - strip all units (g, kcal, mg, etc)
3. Serving size should be between 10g and 300g (if ambiguous, choose the realistic interpretation)
4. Apply sanity checks BEFORE returning:
   - protein_g must be ≤ serving_g
   - carbs_g must be ≤ serving_g
   - fat_g must be ≤ serving_g
   - fiber_g must be ≤ serving_g
   - Sum of protein_g + carbs_g + fat_g should be ≤ serving_g
5. If you see values that would create impossible nutrition ratios, re-examine the image for OCR errors
6. Common OCR errors to watch for:
   - Missing decimal points (18 read as 1.8)
   - Missing digits (110 read as 10)
   - Misread zeros (100 read as 10 or 1000)
7. Double-check that the extracted values make sense together (e.g., a 2g serving shouldn't have 100 calories)
8. If any value is missing or unclear, use 0 as default
9. If the label has multiple columns (e.g. "As Packaged" and "As Prepared"), always use the "As Packaged" column
10. If serving size contains multiple formats (e.g. "1/2 tsp (1.8g) makes 2 Tbsp"), extract only the gram value in parentheses
11. If no gram value is found, convert common units: 1 tsp = 5g, 1 tbsp = 15g, 1 cup = 240g, 1 oz = 28.35g`,
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/```json\n?/g, '');
    cleanedContent = cleanedContent.replace(/```\n?/g, '');
    cleanedContent = cleanedContent.trim();

    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }

    return JSON.parse(jsonMatch[0]) as NutritionData;
  };

  const checkScanLimit = async (): Promise<boolean> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const scansJson = await AsyncStorage.getItem('daily_scans');
      const scans = scansJson ? JSON.parse(scansJson) : { date: today, count: 0 };

      if (scans.date !== today) {
        scans.date = today;
        scans.count = 0;
      }

      if (scans.count >= 5) {
        Alert.alert(
          'Daily Limit Reached',
          'You have used your 5 free label scans for today. Upgrade to Premium for unlimited scans!',
          [
            { text: 'OK' },
            { text: 'Upgrade', onPress: () => console.log('Upgrade pressed') }
          ]
        );
        return false;
      }

      scans.count += 1;
      await AsyncStorage.setItem('daily_scans', JSON.stringify(scans));
      return true;
    } catch (error) {
      console.error('Error checking scan limit:', error);
      return true;
    }
  };

  const checkDatabaseForProduct = async (productName: string): Promise<NutritionData | null> => {
    try {
      console.log('🔍 Checking database for product:', productName);
      const cachedProduct = await checkProductByName(productName);

      if (cachedProduct) {
        console.log('✅ Product found in database (free lookup):', cachedProduct.product_name);
        return cachedProduct;
      }

      return null;
    } catch (error) {
      console.error('Error checking database:', error);
      return null;
    }
  };

  const analyzeNutritionLabel = async (base64Image: string): Promise<NutritionData> => {
    try {
      const extractedText = await extractTextWithGoogleVision(base64Image);
      const nutritionData = await parseTextWithGPT(extractedText);

      // Check if this product already exists in database
      const cachedProduct = await checkDatabaseForProduct(nutritionData.product_name);
      if (cachedProduct) {
        return cachedProduct;
      }

      return nutritionData;
    } catch (visionError: any) {
      console.warn('❌ Google Vision + GPT-3.5 failed:', visionError.message);
      console.log('🔄 Attempting fallback to GPT-4o vision...');
      const nutritionData = await fallbackToGPT4Vision(base64Image);

      // Check if this product already exists in database
      const cachedProduct = await checkDatabaseForProduct(nutritionData.product_name);
      if (cachedProduct) {
        return cachedProduct;
      }

      return nutritionData;
    }
  };

  const processImage = async (base64Image: string) => {
    if (isProcessing.current) {
      return;
    }
    isProcessing.current = true;
    try {
      console.log('🟢 Image selected successfully, starting analysis');
      setIsAnalyzing(true);

      let nutritionData: NutritionData;

      try {
        nutritionData = await analyzeNutritionLabel(base64Image);
        console.log('✅ Successfully extracted nutrition data:', nutritionData);
      } catch (error: any) {
        console.error('❌ AI extraction failed:', error.message);
        console.log('⚠️ Allowing manual entry with default values');

        // Navigate to result screen with default values that user can edit
        router.push({
          pathname: '/result',
          params: {
            isLabelScan: 'true',
            servingSize: '100',
            calories: '0',
            protein: '0',
            carbs: '0',
            fat: '0',
            fiber: '0',
            error: 'Could not extract nutrition data. Please enter values manually or try again.',
          },
        });
        return;
      }

      // Save to database with product name
      await saveLabelScan(
        nutritionData.product_name,
        nutritionData.calories,
        nutritionData.protein_g,
        nutritionData.carbs_g,
        nutritionData.fat_g,
        nutritionData.fiber_g || 0,
        nutritionData.serving_g
      );

      console.log('🔄 Navigating to result screen...');

      router.push({
        pathname: '/result',
        params: {
          isLabelScan: 'true',
          product_name: nutritionData.product_name,
          servingSize: nutritionData.serving_g.toString(),
          calories: nutritionData.calories.toString(),
          protein: nutritionData.protein_g.toString(),
          carbs: nutritionData.carbs_g.toString(),
          fat: nutritionData.fat_g.toString(),
          fiber: (nutritionData.fiber_g || 0).toString(),
        },
      });
    } catch (error: any) {
      console.error('❌ Unexpected error during processing:', error);
      router.push({
        pathname: '/result',
        params: {
          isLabelScan: 'true',
          servingSize: '100',
          calories: '0',
          protein: '0',
          carbs: '0',
          fat: '0',
          fiber: '0',
          error: 'An error occurred. Please enter nutrition values manually or try scanning again.',
        },
      });
    } finally {
      setIsAnalyzing(false);
      isProcessing.current = false;
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isProcessing.current) {
      return;
    }

    const canProceed = await checkScanLimit();
    if (!canProceed) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo?.base64) {
        await processImage(photo.base64);
        await loadLastPhoto();
      }
    } catch (error: any) {
      console.error('❌ ERROR taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      isProcessing.current = false;
    }
  };

  const handleChooseFromLibrary = async () => {
    if (isProcessing.current) {
      return;
    }

    const canProceed = await checkScanLimit();
    if (!canProceed) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        console.log('🟡 Image selection canceled by user');
        return;
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulatedImage.base64) {
        throw new Error('Failed to convert image to base64');
      }

      await processImage(manipulatedImage.base64);
    } catch (error: any) {
      console.error('❌ ERROR choosing from library:', error);
      Alert.alert('Error', 'Failed to choose image from library');
      isProcessing.current = false;
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2d8659" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Camera size={80} color="#000000" strokeWidth={1.5} />
          <Text style={styles.permissionTitle}>Allow Camera Access</Text>
          <Text style={styles.permissionSubtitle}>
            NutriScan needs camera access to scan nutrition labels.
          </Text>
        </View>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.cancelTopButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.cancelTopButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.libraryButton}
              onPress={handleChooseFromLibrary}
              disabled={isAnalyzing}
            >
              {lastPhoto ? (
                <Image
                  source={{ uri: lastPhoto }}
                  style={styles.libraryThumbnail}
                />
              ) : (
                <View style={styles.libraryPlaceholder}>
                  <Text style={styles.libraryPlaceholderIcon}>🏔</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shutterButton, isAnalyzing && styles.shutterButtonDisabled]}
              onPress={handleTakePhoto}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <View style={styles.shutterButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.libraryButtonSpacer} />
          </View>

          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <View style={styles.analyzingBox}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.analyzingText}>Analyzing nutrition label...</Text>
              </View>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelTopButton: {
    alignSelf: 'flex-start',
  },
  cancelTopButtonText: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '400',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  libraryButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  libraryThumbnail: {
    width: '100%',
    height: '100%',
  },
  libraryPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryPlaceholderIcon: {
    fontSize: 20,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonDisabled: {
    opacity: 0.5,
  },
  shutterButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#ffffff',
  },
  libraryButtonSpacer: {
    width: 50,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  analyzingText: {
    color: '#ffffff',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#2d8659',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
