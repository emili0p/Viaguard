import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface MapComponentProps {
  location: Location.LocationObject | null;
  height?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  location, 
  height = 300
}) => {
  const mapRef = useRef<MapView>(null);

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

  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.0052,
    longitudeDelta: 0.0051,
  };

  const centerMap = () => {
    mapRef.current?.animateToRegion(initialRegion, 1000);
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

      {/* Controles del mapa */}
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
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
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