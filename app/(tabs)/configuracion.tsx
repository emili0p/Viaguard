import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      {/* Foto de perfil */}
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Aquí pondrías la URL o imagen local
        style={styles.profileImage}
      />

      {/* Nombre y edad */}
      <Text style={styles.name}>JUANITO MARTINEZ</Text>
      <Text style={styles.age}>34</Text>

      {/* Sección de estadísticas */}
      <Text style={styles.statsTitle}>ESTADÍSTICAS</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statText}>KM RECORRIDOS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statText}>REPORTES/ALERTAS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statText}>VELOCIDAD PROMEDIO</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  age: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#333',
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
