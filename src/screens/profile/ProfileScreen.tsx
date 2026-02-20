import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/navigation/RootNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors, Space } from "@/constants/theme";
import { getUser } from "@/storage/auth";
import { EditIcon } from "@/utils/svgs";
import { Button } from "../../components/ui/Button";

export default function ProfileScreen() {
  const { logout } = useAuthContext();
  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [dni, setDni] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nacimiento, setNacimiento] = useState("");
  const [editableField, setEditableField] = useState<null | "dni" | "direccion">(null);

  const dniRef = useRef<TextInput>(null);
  const direccionRef = useRef<TextInput>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  // 📅 Format date DD/MM/YYYY
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onChangeDate = (_: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
      setNacimiento(formatDate(selectedDate));
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        const userData = JSON.parse(user);
        console.log(userData);
        setUsername(userData.name);
        setDni(userData.dni);
        setDireccion(userData.direccion);
        setNacimiento(userData.nacimiento);
      }
    };
    fetchUser();
  }, []);
  useEffect(() => {
    if (editableField === "dni") {
      requestAnimationFrame(() => dniRef.current?.focus());
    } else if (editableField === "direccion") {
      requestAnimationFrame(() => direccionRef.current?.focus());
    }
  }, [editableField]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "We need access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Avatar */}
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <ThemedText>Upload</ThemedText>
        )}
      </TouchableOpacity>

      <ThemedText type="title" style={{ marginTop: 20 }}>
        {username}
      </ThemedText>

      <View style={styles.inputContainer}>
        {/* DNI */}
        <ThemedText type="subtitle" style={styles.label}>
          DNI
        </ThemedText>
        <View style={styles.fieldRow}>
          <TextInput
            ref={dniRef}
            style={styles.input}
            placeholder="03967380Q"
            placeholderTextColor={Colors.light.black}
            value={dni}
            onChangeText={setDni}
            editable={editableField === "dni"}
            selectTextOnFocus
            onBlur={() => setEditableField(null)}
          />
          <TouchableOpacity
            style={styles.editIconButton}
            activeOpacity={0.7}
            onPress={() => setEditableField((prev) => (prev === "dni" ? null : "dni"))}
          >
            <EditIcon />
          </TouchableOpacity>
        </View>

        {/* Fecha de nacimiento */}
        <ThemedText type="subtitle" style={styles.label}>
          Fecha de Nacimiento
        </ThemedText>

        <View style={styles.fieldRow}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ flex: 1 }}
            activeOpacity={0.7}
          >
            <View pointerEvents="none">
              <TextInput
                style={styles.input}
                placeholder="12/12/1990"
                placeholderTextColor="#000"
                value={nacimiento}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => {
              setEditableField(null);
              setShowDatePicker(true);
            }}
            activeOpacity={0.7}
          >
            <EditIcon />
          </TouchableOpacity>
        </View>
        <View
          style={{ marginTop: 56 }}
        >
          {/* Dirección */}
          <ThemedText type="subtitle" style={styles.label}>
            Dirección
          </ThemedText>
          <View style={styles.fieldRow}>
            <TextInput
              ref={direccionRef}
              style={styles.input}
              placeholder="Calle de las Eras, 92"
              placeholderTextColor="#000"
              value={direccion}
              onChangeText={setDireccion}
              editable={editableField === "direccion"}
              selectTextOnFocus
              onBlur={() => setEditableField(null)}
            />
            <TouchableOpacity
              style={styles.editIconButton}
              activeOpacity={0.7}
              onPress={() => setEditableField((prev) => (prev === "direccion" ? null : "direccion"))}
            >
              <EditIcon />
            </TouchableOpacity>
          </View>
        </View>
        <Button
          title="Salir"
          onPress={logout}

          variant="outline"
          style={styles.logoutButton}
          textStyle={{ color: '#000' }}
        />
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Space.xxl,
    paddingHorizontal: Space.md,
    paddingBottom: Space.md
  },
  avatarContainer: {
    width: 136,
    height: 136,
    borderRadius: 70,
    backgroundColor: Colors.light.grey,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  fieldRow: {
    width: "100%",
    marginVertical: 2,
    position: "relative",
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingRight: 32, // space for edit icon
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.black,
  },
  label: {
    color: "#000",
    fontSize: 16,
    marginBottom: 4,
    marginTop: 10,
    fontFamily: 'Robert-B',
  },
  inputContainer: {
    width: "100%",
  },
  logoutButton: {
    marginTop: 30,
  },
  editIconButton: {
    position: "absolute",
    right: 0,
    top: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
