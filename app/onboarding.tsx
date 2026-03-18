import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, Camera, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SLIDES = [
  { id: '1', title: 'NutriScan', description: 'Know what you eat instantly.', icon: <Sparkles size={100} color="#639922" /> },
  { id: '2', title: 'Scan Labels', description: 'Our AI reads nutrition labels for you.', icon: <Camera size={100} color="#639922" /> },
  { id: '3', title: 'Compare', description: 'Compare products side-by-side.', icon: <Heart size={100} color="#FF69B4" fill="#FF69B4" /> },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const handleFinish = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    router.replace('/');
  };
  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#fff'}}>
      <FlatList
        data={SLIDES}
        horizontal
        pagingEnabled
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({item}) => (
          <View style={{width, alignItems:'center', justifyContent:'center', padding:40}}>
            <View style={{width:180, height:180, borderRadius:90, backgroundColor:'#EAF3DE', alignItems:'center', justifyContent:'center', marginBottom:40}}>{item.icon}</View>
            <Text style={{fontSize:32, fontWeight:'900', color:'#3B6D11', marginBottom:16}}>{item.title}</Text>
            <Text style={{fontSize:18, color:'#639922', textAlign:'center'}}>{item.description}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={{margin:40, height:60, backgroundColor:'#639922', borderRadius:16, alignItems:'center', justifyContent:'center'}} onPress={handleFinish}>
        <Text style={{color:'#fff', fontSize:20, fontWeight:'800'}}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
