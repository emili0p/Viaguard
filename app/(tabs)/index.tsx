import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import MapComponent from '@/components/Mapa';

export default function App() {
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Acelerómetro
  useEffect(() => {
    const subscription = Accelerometer.addListener((data) => {
      setAccelData(data);
    });

    Accelerometer.setUpdateInterval(500);

    return () => {
      subscription.remove();
    };
  }, []);

  // Ubicación
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        // 1. Solicitar permisos
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado');
          setIsLoading(false);
          return;
        }

        // 2. Obtener la ubicación actual
        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Best,
          timeout: 15000
        });
        
        setLocation(loc);
        setErrorMsg('');
        
      } catch (error) {
        console.log('Error obteniendo ubicación:', error);
        setErrorMsg('Error al obtener la ubicación');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>📱 Sensor & Mapa App</Text>
        
        {/* Sección del Acelerómetro */}
        <View style={styles.section}>
          <Text style={styles.title}>Datos del Acelerómetro:</Text>
          <View style={styles.dataBox}>
            <Text style={styles.dataText}>X: {accelData.x.toFixed(4)}</Text>
            <Text style={styles.dataText}>Y: {accelData.y.toFixed(4)}</Text>
            <Text style={styles.dataText}>Z: {accelData.z.toFixed(4)}</Text>
          </View>
        </View>

        {/* Sección de Ubicación */}
        <View style={styles.section}>
          <Text style={styles.title}>📍 Coordenadas:</Text>
          <View style={styles.dataBox}>
            {isLoading ? (
              <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
            ) : location ? (
              <View>
                <Text style={styles.coordinateText}>
                  Latitud: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateText}>
                  Longitud: {location.coords.longitude.toFixed(6)}
                </Text>
                <Text style={styles.accuracyText}>
                  Precisión: ±{location.coords.accuracy?.toFixed(2)} metros
                </Text>
              </View>
            ) : (
              <Text style={styles.errorText}>
                {errorMsg || 'No se pudo obtener la ubicación'}
              </Text>
            )}
          </View>
        </View>

        {/* Componente del Mapa */}
        {location && (
          <View style={styles.section}>
            <Text style={styles.title}>🗺️ Mapa de Ubicación:</Text>
            <MapComponent 
              location={location} 
              height={350}
            />
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Mueve el dispositivo para ver cambios en el acelerómetro
          </Text>
          <Text style={styles.infoText}>
            🗺️ El mapa muestra tu ubicación actual en tiempo real
          </Text>
          {errorMsg && (
            <Text style={styles.errorInfoText}>
              ⚠️ {errorMsg}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  dataBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dataText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#34495e',
  },
  coordinateText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#2980b9',
    fontWeight: '500',
  },
  accuracyText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    color: '#f39c12',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    width: '100%',
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  errorInfoText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 10,
    fontWeight: '500',
  },
});