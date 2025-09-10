import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Importación condicional de react-native-maps
let MapView: any = null;
let Marker: any = null;
let Region: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Region = Maps.Region;
  } catch (error) {
    console.log('react-native-maps no disponible');
  }
}

interface MapComponentProps {
  location: Location.LocationObject | null;
  height?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  location, 
  height = 300
}) => {
  const mapRef = useRef<any>(null);

  // Si es web, mostrar mensaje en lugar del mapa
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholder}>
          <Ionicons name="globe-outline" size={40} color="#666" />
          <Text style={styles.placeholderText}>
            🗺️ Mapa no disponible en versión web
          </Text>
          <Text style={styles.webText}>
            Ejecuta en dispositivo iOS/Android para ver el mapa
          </Text>
        </View>
      </View>
    );
  }

  // Si react-native-maps no está disponible
  if (!MapView || !Marker) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholder}>
          <Ionicons name="alert-circle-outline" size={40} color="#e74c3c" />
          <Text style={styles.placeholderText}>
            ❌ react-native-maps no disponible
          </Text>
        </View>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholder}>
          <Ionicons name="map-outline" size={40} color="#666" />
          <Text style={styles.placeholderText}>Cargando mapa...</Text>
        </View>
      </View>
    );
  }

  const { latitude, longitude } = location.coords;

  const initialRegion: any = {
    latitude,
    longitude,
    latitudeDelta: 0.0052,
    longitudeDelta: 0.0051,
  };

  const centerMap = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          title="Ubicación actual"
          description={`Lat: ${latitude.toFixed(6)}\nLon: ${longitude.toFixed(6)}`}
          pinColor="#007AFF"
        />
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={centerMap}>
          <Ionicons name="locate" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    gap: 10,
    padding: 20,
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  webText: {
    color: '#3498db',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 8,
  },
  controlButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default MapComponent;