import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Linking
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

// Definición de tipos
interface Coordinates {
  latitude: number;
  longitude: number;
}

type ReportType = "SOS" | "POLICIA" | "BOMBEROS" | "AMBULANCIA" | "OTRO";

interface EmergencyReport {
  type: ReportType;
  description: string;
  timestamp: string;
  coords?: [number, number];
}

interface PointOfInterest {
  id: number;
  type: string;
  name: string;
  lat: number;
  lng: number;
}

type ExpoIcon = React.ComponentType<{
  name: any; // Cambiado de string a any para aceptar cualquier nombre
  size?: number;
  color?: string;
}>;

interface QuickCardProps {
  icon: any; // Temporalmente any para evitar errores
  iconName: string;
  label: string;
  color?: string;
  onPress: () => void;
}

// Componente QuickCard corregido
const QuickCard: React.FC<QuickCardProps> = ({ 
  icon: Icon, 
  iconName, 
  label, 
  color = "#dc2626", 
  onPress 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.quickCard}
    >
      <View style={[styles.quickCardIcon, { backgroundColor: "#f3f4f6" }]}>
        <Icon name={iconName} size={20} color={color} />
      </View>
      <View style={styles.quickCardText}>
        <Text style={styles.quickCardLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Componente principal
const EmergencyScreen: React.FC = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [contactNumber, setContactNumber] = useState<string>("+911");
  const [recentReports, setRecentReports] = useState<EmergencyReport[]>([]);
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    requestLocation();
    // Para React Native, usa AsyncStorage en lugar de localStorage
    // const stored = await AsyncStorage.getItem("reports:v1");
  }, []);

  const requestLocation = async (): Promise<void> => {
    setLoadingLocation(true);
    // En React Native usarías Location de expo-location
    setTimeout(() => {
      // Simulación de ubicación para demo
      setCoords([40.4168, -3.7038]);
      setLoadingLocation(false);
    }, 1000);
  };

  const dial = (number: string): void => {
    Linking.openURL(`tel:${number}`);
  };

  const handleSOS = async (): Promise<void> => {
    Alert.alert(
      "Confirmar SOS",
      "¿Enviar SOS y llamar al número de emergencias? Se enviará tu ubicación si está disponible.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Enviar", 
          onPress: () => {
            if (coords) {
              sendReport({ 
                type: "SOS", 
                coords, 
                description: "SOS automático" 
              });
            }
            dial("911");
          }
        }
      ]
    );
  };

  const sendReport = async ({ 
    type, 
    coords: rcoords, 
    description 
  }: { 
    type: ReportType; 
    coords?: [number, number]; 
    description: string; 
  }): Promise<void> => {
    setSending(true);
    try {
      const payload: EmergencyReport = {
        type,
        description,
        timestamp: new Date().toISOString(),
        coords: rcoords || coords || undefined,
      };

      const updated: EmergencyReport[] = [payload, ...recentReports].slice(0, 10);
      setRecentReports(updated);
      
      Alert.alert("Éxito", "Reporte enviado (demo). Revisa el historial.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Error enviando reporte");
    } finally {
      setSending(false);
    }
  };

  const handleOtherReport = (): void => {
    Alert.prompt(
      "Reporte de emergencia",
      "Describe la emergencia:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Enviar", 
          onPress: (desc: string | undefined) => {
            if (desc) {
              sendReport({ 
                type: "OTRO", 
                description: desc 
              });
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EMERGENCIAS</Text>
      </View>

      {/* Main content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.mainContent}>
          <TouchableOpacity
            onPress={handleSOS}
            style={styles.sosButton}
            activeOpacity={0.8}
          >
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dial(contactNumber)}
            style={styles.emergencyButton}
          >
            <Ionicons name="call" size={18} color="white" />
            <Text style={styles.emergencyButtonText}>CONTACTO DE EMERGENCIA</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REPORTES RÁPIDOS</Text>

            <View style={styles.quickCardsGrid}>
              <QuickCard
                icon={Ionicons}
                iconName="shield-checkmark"
                label="Policía"
                color="#374151"
                onPress={() => sendReport({ 
                  type: "POLICIA", 
                  description: "Solicitud de policía" 
                })}
              />

              <QuickCard
                icon={MaterialIcons}
                iconName="local-fire-department"
                label="Bomberos"
                color="#ef4444"
                onPress={() => sendReport({ 
                  type: "BOMBEROS", 
                  description: "Incendio reportado" 
                })}
              />

              <QuickCard
                icon={FontAwesome}
                iconName="ambulance"
                label="Ambulancia"
                color="#dc2626"
                onPress={() => sendReport({ 
                  type: "AMBULANCIA", 
                  description: "Emergencia médica" 
                })}
              />

              <QuickCard
                icon={Ionicons}
                iconName="warning"
                label="Otro"
                color="#eab308"
                onPress={handleOtherReport}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TU UBICACIÓN</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={18} color="#6b7280" />
                <View style={styles.locationText}>
                  <Text style={styles.coordsText}>
                    {coords ? `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}` : "Ubicación no disponible"}
                  </Text>
                  <Text style={styles.locationSubtext}>
                    {loadingLocation ? "Obteniendo ubicación…" : "Última ubicación conocida"}
                  </Text>
                </View>
                <TouchableOpacity onPress={requestLocation}>
                  <Text style={styles.updateButton}>Actualizar</Text>
                </TouchableOpacity>
              </View>

              {/* Mapa placeholder */}
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={40} color="#007AFF" />
                <Text style={styles.mapPlaceholderText}>
                  Mapa interactivo aquí
                </Text>
                <Text style={styles.mapSubtext}>
                  (Usar react-native-maps para implementar)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HISTORIAL DE REPORTES</Text>
            <View style={styles.reportsList}>
              {recentReports.length === 0 && (
                <Text style={styles.emptyText}>No hay reportes recientes</Text>
              )}
              {recentReports.map((r, i) => (
                <View key={i} style={styles.reportCard}>
                  <Text style={styles.reportTime}>
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </Text>
                  <View style={styles.reportContent}>
                    <Text style={styles.reportType}>{r.type}</Text>
                    <Text style={styles.reportDescription}>{r.description}</Text>
                    {r.coords && (
                      <Text style={styles.reportCoords}>
                        {r.coords[0].toFixed(5)}, {r.coords[1].toFixed(5)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Estilos (mantenemos los mismos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#dc2626",
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  mainContent: {
    padding: 16,
    alignItems: "center",
  },
  sosButton: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    marginBottom: 24,
  },
  sosText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  emergencyButton: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#f97316",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 3,
    marginBottom: 24,
  },
  emergencyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    width: "100%",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#374151",
  },
  quickCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    flexBasis: "48%",
    elevation: 2,
    marginBottom: 8,
  },
  quickCardIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  quickCardText: {
    flex: 1,
  },
  quickCardLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
  coordsText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  locationSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  updateButton: {
    fontSize: 14,
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
  mapPlaceholder: {
    height: 192,
    backgroundColor: "#e8f4f8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  mapSubtext: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  reportsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    flexDirection: "row",
  },
  reportTime: {
    fontSize: 12,
    color: "#6b7280",
    width: 96,
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportType: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  reportCoords: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginVertical: 16,
  },
  footer: {
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
  },
  footerButton: {
    alignItems: "center",
    padding: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
});

export default EmergencyScreen;