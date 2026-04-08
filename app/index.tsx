import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Tarea {
  id: string;
  title: string;
  completed: boolean;
}

export default function ModalScreen() {
  const [fontsLoaded] = useFonts({
    MiFuentePersonalizada: require("../assets/fonts/Damion/Damion-Regular.ttf"),
  });

  const [input, setInput] = useState("");
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const API_URL = "http://192.168.1.76:3000/todos";

  const obtenerTareas = async () => {
    try {
      const respuesta = await fetch(API_URL);
      const datos = await respuesta.json();
      setTareas(Array.isArray(datos) ? datos : datos.data || []);
    } catch (error) {
      console.error("Error al obtener lista:", error);
    }
  };

  const obtenerUnaTarea = async (id: string) => {
    try {
      const respuesta = await fetch(`${API_URL}/${id}`);
      const datos = await respuesta.json();
      const tarea = Array.isArray(datos) ? datos[0] : datos.data || datos;
      const mensaje = `DETALLE:\n\nID: ${tarea.id}\nNombre: ${tarea.title}\nEstado: ${tarea.completed ? " Completada" : " Pendiente"}`;

      if (Platform.OS === "web") {
        window.alert(mensaje);
      } else {
        Alert.alert("Información Individual", mensaje);
      }
    } catch (error) {
      Alert.alert("Error", "No se encontró el detalle de la tarea.");
    }
  };

  const cambiarEstado = async (tarea: Tarea) => {
    try {
      const respuesta = await fetch(`${API_URL}/${tarea.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tarea.title,
          completed: !tarea.completed,
        }),
      });
      if (respuesta.ok) await obtenerTareas();
    } catch (error) {
      console.error(error);
    }
  };

  const guardarTarea = async () => {
    if (input.trim() === "") return;
    try {
      const metodo = editandoId ? "PUT" : "POST";
      const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input, completed: false }),
      });
      if (respuesta.ok) {
        setInput("");
        setEditandoId(null);
        await obtenerTareas();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarTarea = async (id: string) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      obtenerTareas();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    obtenerTareas();
    const intervalo = setInterval(() => {
      obtenerTareas();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (tareas.length > 0) {
      console.log("Lista actualizada. Tareas totales:", tareas.length);
      console.table(tareas);
    }
  }, [tareas]);

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={{
        uri: "https://i.pinimg.com/originals/03/5a/6a/035a6a2b61d49f920c3aef034cc4c23b.gif",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <FlatList
          data={tareas}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.titulo}>
                .𖥔 ݁ ˖๋ ࣭ ⭑(˶˃ ᵕ ˂˶) .ᐟ.ᐟ {"\n"}¡Agrega tu Tarea! {"\n"}
                ⊹₊˚‧︵‿₊୨ᰔ୧₊‿︵‧˚₊⊹
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nueva tarea..."
                  value={input}
                  onChangeText={setInput}
                  placeholderTextColor="#888"
                />
                <TouchableOpacity
                  style={styles.botonPrincipal}
                  onPress={guardarTarea}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {editandoId ? "OK" : "+"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.tareaCard}>
              <TouchableOpacity
                onPress={() => cambiarEstado(item)}
                style={[
                  styles.circulo,
                  {
                    backgroundColor: item.completed ? "#6306af" : "transparent",
                  },
                ]}
              >
                {item.completed && (
                  <Text style={{ color: "white", fontSize: 20 }}>✿</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => obtenerUnaTarea(item.id)}
              >
                <Text style={[styles.texto, item.completed && styles.tachado]}>
                  {item.title}
                </Text>
              </TouchableOpacity>

              <View style={styles.acciones}>
                <TouchableOpacity
                  onPress={() => {
                    setInput(item.title);
                    setEditandoId(item.id);
                  }}
                >
                  <Text style={styles.btnEditar}>editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => eliminarTarea(item.id)}>
                  <Text style={styles.btnBorrar}>borrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(43, 43, 43, 0.28)",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 35,
    marginBottom: 20,
    textAlign: "center",
    color: "#fffefe",
    fontFamily: "MiFuentePersonalizada",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
    width: "100%",
    maxWidth: 500,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(17, 17, 17, 0.8)",
    color: "white",
  },
  botonPrincipal: {
    backgroundColor: "#8801b9c5",
    width: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tareaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(43, 0, 81, 0.9)",
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  circulo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#fcfcfc",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  texto: {
    flex: 1,
    fontSize: 25,
    color: "#fff",
    fontFamily: "MiFuentePersonalizada",
  },
  tachado: { textDecorationLine: "line-through", color: "#666" },
  acciones: { flexDirection: "row", gap: 12 },
  btnEditar: {
    color: "#c4dcf5",
    paddingHorizontal: 10,
    backgroundColor: "#044a53",
    borderRadius: 10,
  },
  btnBorrar: {
    color: "#ff0d00",
    paddingHorizontal: 10,
    backgroundColor: "#760202",
    borderRadius: 10,
  },
});
