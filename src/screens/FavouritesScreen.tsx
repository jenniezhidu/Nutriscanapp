import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Heart } from 'lucide-react-native';

interface FavouriteProduct {
  id: string;
  product_name: string;
  product_data: {
    name: string;
    barcode?: string;
    isLabelScan: boolean;
    per100g: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    servingSizeGrams: number;
    uncertain?: boolean;
  };
  created_at: string;
}

export function FavouritesScreen() {
  const [favourites, setFavourites] = useState<FavouriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    try {
      const { data, error } = await supabase
        .from('favourites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading favourites:', error);
        return;
      }

      setFavourites(data || []);
    } catch (error) {
      console.error('Error loading favourites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavourite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing favourite:', error);
        return;
      }

      setFavourites((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error removing favourite:', error);
    }
  };

  const handleProductPress = (favourite: FavouriteProduct) => {
    const productData = favourite.product_data;

    const productForRoute = {
      name: productData.name,
      servingSizeGrams: productData.servingSizeGrams,
      caloriesPerServing: (productData.per100g.calories / 100) * productData.servingSizeGrams,
      proteinPerServing: (productData.per100g.protein / 100) * productData.servingSizeGrams,
      carbsPerServing: (productData.per100g.carbs / 100) * productData.servingSizeGrams,
      fatPerServing: (productData.per100g.fat / 100) * productData.servingSizeGrams,
      fiberPerServing: (productData.per100g.fiber / 100) * productData.servingSizeGrams,
    };

    router.push({
      pathname: '/result',
      params: {
        barcode: productData.barcode || '',
        product: JSON.stringify(productForRoute),
      },
    });
  };

  const renderItem = ({ item }: { item: FavouriteProduct }) => {
    const calories = Math.round(item.product_data.per100g.calories);

    return (
      <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product_data.name}
          </Text>
          <Text style={styles.caloriesText}>{calories} kcal per 100g</Text>
        </View>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => handleRemoveFavourite(item.id)}
        >
          <Heart size={24} color="#FF69B4" fill="#FF69B4" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourites</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : favourites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No favourites yet</Text>
          <Text style={styles.emptySubtext}>
            Add products to your favourites by tapping the heart icon on the results screen
          </Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 30,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  caloriesText: {
    fontSize: 14,
    color: '#666666',
  },
  heartButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
