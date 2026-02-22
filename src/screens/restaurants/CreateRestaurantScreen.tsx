import { uploadRestaurantImage, useCreateRestaurantMutation } from '@/api/restaurants';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TextField } from '@/components/ui/TextField';
import { Colors, CornorRadius, Space } from '@/constants/theme';
import { StarIcon } from '@/utils/svgs';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LogBox,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CreateViewState = 'form' | 'success' | 'error';

const MIN_DESCRIPTION_LENGTH = 10;
const URL_REGEX = /^https?:\/\/.+\..+/i;

function isValidUrl(str: string): boolean {
  return URL_REGEX.test(str.trim());
}

function getBackendErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string; error?: string; msg?: string } | string }; message?: string };
  if (!err) return 'Error desconocido';
  const data = err.response?.data;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const msg = data.message ?? data.error ?? data.msg;
    if (msg) return String(msg);
  }
  return err.message ?? 'No se pudo crear el restaurante';
}

type FieldErrors = {
  name?: string;
  address?: string;
  description?: string;
  image?: string;
  location?: string;
};

export default function CreateRestaurantScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [viewState, setViewState] = useState<CreateViewState>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const ref = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const createMutation = useCreateRestaurantMutation();

  // Disable VirtualizedList nesting warning (GooglePlacesAutocomplete uses FlatList inside our ScrollView)
  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'VirtualizedLists should never be nested inside plain ScrollViews',
    ]);
  }, []);

  // Handle keyboard appearance to scroll focused inputs into view
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Small delay to ensure input is focused
      setTimeout(() => {
        // Scroll to bottom when keyboard appears
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para subir la imagen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      setImageUrl('');
      clearFieldError('image');
      setUploadingImage(true);
      try {
        const url = await uploadRestaurantImage(uri);
        setImageUrl(url);
        setImage(null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error al subir la imagen';
        Alert.alert('Error de subida', msg);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const removeImage = () => {
    if (uploadingImage) return;
    setImage(null);
    setImageUrl('');
    clearFieldError('image');
  };

  const getImageValue = (): string => {
    if (imageUrl.trim()) return imageUrl.trim();
    if (image) return image;
    return '';
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`;
    }

    const imgVal = getImageValue();
    if (!imgVal) {
      newErrors.image = 'Debes subir una imagen';
    } else if (imgVal.startsWith('http') && !isValidUrl(imgVal)) {
      newErrors.image = 'Introduce una URL de imagen válida (ej: https://...)';
    }

    if (!lat.trim() || !lng.trim()) {
      newErrors.location = 'Selecciona un lugar desde el buscador de arriba';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const imgVal = getImageValue();
    createMutation.mutate({
      name: name.trim(),
      address: address.trim(),
      description: description.trim(),
      image: imgVal,
      latlng: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    }, {
      onSuccess: () => {
        setViewState('success');
        setName('');
        setAddress('');
        setDescription('');
        setImage(null);
        setImageUrl('');
        setLat('');
        setLng('');
        setErrors({});
        ref.current?.setAddressText('');
      },
      onError: (error) => {
        setErrorMessage(getBackendErrorMessage(error));
        setViewState('error');
        console.error(error);
      },
    });
  };

  const goToRestaurantList = () => {
    setViewState('form');
    (navigation as any).navigate('MainTabs', { screen: 'Restaurants' });
  };

  const goBackToForm = () => {
    setErrorMessage('');
    setViewState('form');
  };

  useEffect(() => {
    const testGoogleApi = async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Madrid&key=${process.env.EXPO_PUBLIC_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('--- Google API Diagnostic ---');
        console.log('Status:', data.status);
        if (data.error_message) console.log('Error Message:', data.error_message);
        if (data.status === 'REQUEST_DENIED') {
          console.warn('Google API Key Denied:', data.error_message);
        }
      } catch (err) {
        console.error('Google API Diagnostic Network Error:', err);
      }
    };
    testGoogleApi();
  }, []);

  if (viewState === 'success') {
    return (
      <ThemedView style={styles.safeArea}>

        <View style={styles.resultContainer}>
          <View style={styles.logoContainer}>
            <StarIcon size={26} />
          </View>
          <ThemedText type="title" style={styles.resultTitle}>Restaurante guardado</ThemedText>
          <Button
            title="Ver restaurante"
            variant="secondary"
            onPress={goToRestaurantList}
            style={styles.submitButton}
            textStyle={{ color: Colors.light.black }}
          />
          <View style={styles.logoContainer}>
            <StarIcon size={26} />
          </View>
        </View>

      </ThemedView>
    );
  }

  if (viewState === 'error') {
    return (
      <ThemedView style={styles.safeArea}>


        <View style={styles.resultContainer}>
          <View style={styles.logoContainer}>
            <StarIcon size={26} />
          </View>
          <ThemedText type="title" style={styles.resultTitle}>Ups, algo salió mal</ThemedText>
          {errorMessage ? <Text style={styles.resultSubtitle}>{errorMessage}</Text> : null}
          <Button
            title="Volver"
            variant="outline"
            onPress={goBackToForm}
            style={styles.resultButton}
            textStyle={{ color: Colors.light.black }}

          />
          <View style={styles.logoContainer}>
            <StarIcon size={26} />
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>
            {
              viewState === 'form' && (
                <View style={styles.topLogoContainer}>
                  <StarIcon size={26} />
                </View>
              )

            }

            {/* 1. Image on top */}
            <View style={styles.imageContainerWrapper}>
              <View style={[styles.imageContainer, errors.image && styles.inputError]}>
                <TouchableOpacity
                  style={styles.imagePickButton}
                  onPress={pickImage}
                  disabled={uploadingImage}
                  activeOpacity={0.85}
                >
                  {uploadingImage ? (
                    <View style={styles.imagePlaceholder}>
                      <ActivityIndicator color="#264BEB" size="large" />
                      <ThemedText style={styles.imagePlaceholderText}>Subiendo...</ThemedText>
                    </View>
                  ) : (image || imageUrl) ? (
                    <Image
                      source={{ uri: image || imageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <IconSymbol name="plus" size={36} color="#000" />

                      <ThemedText type='title' style={styles.imagePlaceholderText}>Añadir imágen</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>

                {!uploadingImage && (image || imageUrl) ? (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.removeImageText}>Eliminar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>


            <TextField
              title="Nombre del restaurante:"
              placeholder="Nombre del restaurante"
              value={name}
              onChangeText={(t: string) => { setName(t); clearFieldError('name'); }}
              inputStyle={{
                backgroundColor: 'transparent',
                borderColor: Colors.light.black,
                color: Colors.light.black,
              }}
              placeholderTextColor={'#000'}
            />


            {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

            {/* 3. Google Places (match TextField design) */}
            <View style={styles.placesFieldContainer}>
              <ThemedText type='title' style={styles.placesFieldTitle}>Dirección del restaurante</ThemedText>
              <View style={[styles.autocompleteWrapper, errors.location && styles.autocompleteError]}>
                <GooglePlacesAutocomplete
                  ref={ref}
                  placeholder="Dirección"
                  fetchDetails={true}
                  keyboardShouldPersistTaps="handled"
                  textInputProps={{ placeholderTextColor: '#000' }}
                  onPress={(data, details = null) => {
                    if (details) {
                      setAddress(details.formatted_address || data.description);
                      setLat(details.geometry.location.lat.toString());
                      setLng(details.geometry.location.lng.toString());
                      clearFieldError('location');
                    }
                  }}
                  onFail={(error) => console.error('Autocomplete Error:', error)}
                  query={{
                    key: process.env.EXPO_PUBLIC_API_KEY,
                    language: 'es',
                  }}
                  debounce={400}
                  minLength={2}
                  enablePoweredByContainer={false}
                  styles={{
                    container: { flex: 0 },
                    textInputContainer: { paddingHorizontal: 0, paddingVertical: 0 },
                    textInput: [
                      styles.placesFieldInput,
                      errors.location && styles.inputError,
                    ],

                    listView: {
                      backgroundColor: '#FFF',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#eee',
                      marginTop: 8,
                      elevation: 5,
                      zIndex: 1000,
                      maxHeight: 200,
                    },
                    row: {
                      padding: 13,
                      height: 44,
                      flexDirection: 'row',
                    },
                    separator: {
                      height: 0.5,
                      backgroundColor: '#eee',
                    },
                  }}
                />
              </View>
            </View>
            {errors.location ? <Text style={styles.fieldError}>{errors.location}</Text> : null}

            {/* 4. Description + submit - extra top margin so section is visible and scrollable */}
            <View style={styles.formSection}>

              <TextField
                title="Descripción del restaurante"
                placeholder="Escribe información acerca del restaurante"
                value={description}
                onChangeText={(t) => { setDescription(t); clearFieldError('description'); }}
                inputStyle={{
                  backgroundColor: 'transparent',
                  borderColor: Colors.light.black,
                  color: Colors.light.black,
                  textAlignVertical: 'top',
                  minHeight: 140,
                }}
                multiline
                numberOfLines={4}
                placeholderTextColor={Colors.light.black}
              />
              {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}

              {errors.image ? <Text style={styles.fieldError}>{errors.image}</Text> : null}

              <Button
                title={createMutation.isPending ? 'Guardando...' : 'Guardar'}
                variant="secondary"
                onPress={handleSubmit}
                loading={createMutation.isPending}
                disabled={createMutation.isPending}
                style={styles.submitButton}
                textStyle={{ color: Colors.light.black }}
              />
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  fontStyle: {
    marginTop: 10,
    fontSize: 24
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? Space.md : Space.s,
  },
  container: {
    padding: Space.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  formSection: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: CornorRadius.CornorRadius,
    padding: Space.lg,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#000',
    color: '#000',
    marginVertical: 10,

  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  fieldError: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#687076',
    marginTop: 6,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  autocompleteWrapper: {
    zIndex: 1000,
    elevation: 5,
    marginBottom: 10,
  },
  autocompleteError: {
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    borderRadius: CornorRadius.CornorRadius,
  },
  // Google Places field styled to match `TextField`
  placesFieldContainer: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  placesFieldTitle: {
    fontSize: 24,
    marginTop: 10,

  },
  placesFieldInput: {
    fontSize: 24,
    paddingHorizontal: Space.md,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'transparent',
    color: '#000',
    fontFamily: 'Robert-R',
    height: '86%',
  },
  imageContainerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  removeImageButton: {
    position: 'absolute',
    left: 10,
    right: 0,
    bottom: 70,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderColor: '#fff',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  removeImageText: {
    fontFamily: 'Robert-B',
    fontSize: 24,
    color: '#fff',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: Space.lg,
    borderWidth: 1,
    borderColor: Colors.light.black,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Space.lg,
  },
  resultTitle: {
    color: Colors.light.tailorBlue,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: Space.md,
  },
  resultButton: {
    marginTop: 24,
    width: '100%',
  },
  topLogoContainer: {
    padding: Space.md,
    paddingTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    padding: Space.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 204,
    height: 204,
    borderRadius: CornorRadius.CornorRadius,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  imagePickButton: { width: '100%', height: '100%' },
});
