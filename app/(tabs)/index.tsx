import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Button } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import MapComponent from '@/components/Mapa';

export default function App() {
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAccident, setIsAccident] = useState(false);

  const BACKEND_URL = "http://172.16.156.109:3000/api/mobile/sensor"; 

  // Acelerómetro
  useEffect(() => {
    const subscription = Accelerometer.addListener((data) => {
      setAccelData(data);

      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

      if (magnitude > 2.5) {
        console.log("🚨 Posible accidente detectado!");
        setIsAccident(true);
        sendData("accidente", data);
      }
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
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado');
          setIsLoading(false);
          return;
        }

        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
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

  // Enviar datos al backend
  const sendData = async (evento: string, accel?: any) => {
    try {
      const payload = {
        x: accel?.x || accelData.x,
        y: accel?.y || accelData.y,
        z: accel?.z || accelData.z,
        deviceId: "react-native-app",
        evento 
      };

      console.log("📤 Enviando datos:", payload);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Respuesta del servidor:", result);

    } catch (err) {
      console.log("❌ Error enviando datos:", err);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Mapa arriba */}
      {location && (
        <View style={styles.mapContainer}>
          <MapComponent location={location} height={300} />
        </View>
      )}

      {/* Contenido en scroll */}
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

          {/* Estado de accidente */}
          <View style={styles.section}>
            <Text style={[styles.title, { color: isAccident ? 'red' : 'green' }]}>
              Estado: {isAccident ? "🚨 Accidente detectado" : "✅ Normal"}
            </Text>
            <Button title="Simular Accidente" onPress={() => sendData("simulado")} />
          </View>

          {/* Ubicación */}
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
                    Precisión: ±{location.coords.accuracy?.toFixed(2)} m
                  </Text>
                </View>
              ) : (
                <Text style={styles.errorText}>
                  {errorMsg || 'No se pudo obtener la ubicación'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    width: '100%',
    height: 300,
  },
  scrollContainer: {
    flex: 1,
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
});
