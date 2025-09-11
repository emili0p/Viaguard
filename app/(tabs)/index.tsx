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

  // URL del backend (puede ser localhost o IP de tu laptop en la red local)
  //const BACKEND_URL = "http://10.0.2.2:3000/api/mobile/sensor"; 
  // Nota: en Android Emulator se usa 10.0.2.2 en lugar de localhost
  const BACKEND_URL = "http://172.16.156.109:3000/api/mobile/sensor"; // Cambia por la IP de tu laptop

  // Acelerómetro
  useEffect(() => {
    const subscription = Accelerometer.addListener((data) => {
      setAccelData(data);

      // Calcular magnitud del vector
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

      // Detectar umbral (ejemplo: > 2.5 g)
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

// Función para enviar datos al backend - Versión compatible
const sendData = async (evento: string, accel?: any) => {
  try {
    // Formato compatible con tu endpoint /api/mobile/sensor
    const payload = {
      x: accel?.x || accelData.x,
      y: accel?.y || accelData.y,
      z: accel?.z || accelData.z,
      deviceId: "react-native-app", // Agrega deviceId
      evento // Puedes usar esto como "activity"
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

// O si quieres enviar datos completos al endpoint /api/sensor-data:
const sendCompleteData = async (evento: string, accel?: any) => {
  try {
    const payload = {
      deviceId: "react-native-app",
      acceleration: {
        x: accel?.x || accelData.x,
        y: accel?.y || accelData.y,
        z: accel?.z || accelData.z
      },
      gyroscope: { x: 0, y: 0, z: 0 }, // Valores por defecto
      magnitude: Math.sqrt(
        (accel?.x || accelData.x) ** 2 +
        (accel?.y || accelData.y) ** 2 +
        (accel?.z || accelData.z) ** 2
      ),
      activity: evento, // "accidente", "normal", etc.
      vibrationLevel: "medium",
      location: location?.coords ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      } : { latitude: 0, longitude: 0 },
      batteryLevel: 100 // Puedes obtener la batería real si quieres
    };

    console.log("📤 Enviando datos completos:", payload);

    const response = await fetch("http://192.168.1.X:3000/api/sensor-data", {
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

        {/* Mapa */}
        {location && (
          <View style={styles.section}>
            <Text style={styles.title}>🗺️ Mapa de Ubicación:</Text>
            <MapComponent location={location} height={350} />
          </View>
        )}
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