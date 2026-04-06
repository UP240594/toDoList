import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
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

  //leer una tarea
  const obtenerUnaTarea = async (id: string) => {
    try {
      const respuesta = await fetch(`${API_URL}/${id}`);
      const datos = await respuesta.json();

      // Si la API responde con un array, tomamos el primer elemento [0]
      // Si responde con un objeto directo, usamos ese objeto
      const tarea = Array.isArray(datos) ? datos[0] : datos.data || datos;

      console.log("Datos recibidos de una tarea:", tarea);

      if (!tarea || !tarea.id) {
        throw new Error("Formato de datos incorrecto");
      }

      const mensaje = `DETALLE:\n\nID: ${tarea.id}\nNombre: ${tarea.title}\nEstado: ${tarea.completed ? "✅ Completada" : "⏳ Pendiente"}`;

      if (Platform.OS === "web") {
        window.alert(mensaje);
      } else {
        Alert.alert("Información Individual", mensaje);
      }
    } catch (error) {
      console.log("Error al leer:", error);
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
        obtenerTareas();
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
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.titulo}>
          Mi To-Do List
        </ThemedText>

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
            <ThemedText style={{ color: "white", fontWeight: "bold" }}>
              {editandoId ? "OK" : "+"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tareas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tareaCard}>
              <TouchableOpacity
                onPress={() => cambiarEstado(item)}
                style={[
                  styles.circulo,
                  {
                    backgroundColor: item.completed ? "#007AFF" : "transparent",
                  },
                ]}
              >
                {item.completed && (
                  <ThemedText style={{ color: "white", fontSize: 10 }}>
                    uwu
                  </ThemedText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => obtenerUnaTarea(item.id)}
              >
                <ThemedText
                  style={[styles.texto, item.completed && styles.tachado]}
                >
                  {item.title}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.acciones}>
                <TouchableOpacity
                  onPress={() => {
                    setInput(item.title);
                    setEditandoId(item.id);
                  }}
                >
                  <ThemedText style={styles.btnEditar}>editar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => eliminarTarea(item.id)}>
                  <ThemedText style={styles.btnBorrar}>borrar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", backgroundColor: "#000" },
  content: { width: "100%", maxWidth: 500, padding: 20, paddingTop: 50 },
  titulo: { marginBottom: 20, textAlign: "center", color: "#fff" },
  inputContainer: { flexDirection: "row", marginBottom: 20, gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#111",
    color: "white",
  },
  botonPrincipal: {
    backgroundColor: "#007AFF",
    width: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tareaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    marginBottom: 10,
  },
  circulo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  texto: { flex: 1, fontSize: 16, color: "#fff" },
  tachado: { textDecorationLine: "line-through", color: "#666" },
  acciones: { flexDirection: "row", gap: 12 },
  btnEditar: { color: "#007AFF", fontWeight: "600" },
  btnBorrar: { color: "#FF3B30", fontWeight: "600" },
});
