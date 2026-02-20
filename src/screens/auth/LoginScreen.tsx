import { useLoginMutation, useSignupMutation } from '@/api/auth';
import { TextField } from '@/components/ui/TextField';
import { Colors, CornorRadius, Space } from '@/constants/theme';
import { saveAccess, saveToken, saveUser } from '@/storage/auth';
import { BackArrow, BlueLogo } from '@/utils/svgs';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useAuthContext } from '../../navigation/RootNavigator';


type AuthMode = 'login' | 'register-info' | 'register-password';
export default function LoginScreen() {
    const navigation = useNavigation();
    const authContext = useAuthContext();
    const { checkAuth } = authContext;
    const insets = useSafeAreaInsets();
    console.log('[LoginScreen] AuthContext available:', !!authContext);
    console.log('[LoginScreen] checkAuth available:', !!checkAuth);

    // ===== STATES =====

    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const validEmail = useMemo(() => /.+@.+\..+/, []);
    // ===== Animations =====
    const slideAnim = useRef(new Animated.Value(120)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const logoFade = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(logoFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();



        Animated.parallel([

            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),

        ]).start();

    }, []);

    // ===== HANDLERS =====
    const loginMutation = useLoginMutation();
    const signupMutation = useSignupMutation();
    const handleLogin = async () => {
        try {
            setError('');
            if (!validEmail.test(email)) {
                setError('Introduce un email válido.');
                return;
            }
            if (password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            const response = await loginMutation.mutateAsync({ email, password });
            if (response && response.user) {
                // Store authentication data
                await saveAccess("1")
                await saveUser(response.user)
                if (response.token) {
                    await saveToken(response.token);
                }

                // Trigger RootNavigator to re-check auth state
                await checkAuth();
            } else {
                throw new Error(response.token || 'Auto-login failed');
            }
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || 'No se pudo iniciar sesión.');
        }
    };

    const handleRegisterInfo = () => {
        setError('');
        if (!validEmail.test(email)) {
            setError('Introduce un email válido.');
            return;
        }
        if (!username.trim()) {
            setError('Introduce un nombre de usuario.');
            return;
        }
        setMode('register-password');
    };

    const handleSignup = async () => {
        try {
            setError('');
            if (password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            const response = await signupMutation.mutateAsync({
                email,
                password,
                name: username
            });
            console.log('Signup Response:', response);
            setSuccess('Cuenta creada correctamente. Ya puedes iniciar sesión.');
            setError('');
            setMode('login');
            setEmail('');
            setUsername('');
            setPassword('');




            // if (response && response.user) {

            //     // Store authentication data

            //     await AsyncStorage.setItem(ACCESS_FLAG, "1");
            //     await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
            //     if (response.token) {
            //         await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
            //     }
            //     // Force navigation to the authenticated stack/screen
            //     navigation.reset({
            //         index: 0,
            //         routes: [{ name: 'splash' as never }],
            //     });
            // }
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || 'No se pudo crear la cuenta.');
        }
    };

    const handleBack = () => {
        setError('');

        if (mode === 'register-password') {

            setMode('register-info');
        } else if (mode === 'register-info') {
            setError('');
            setEmail('');
            setUsername('');
            setPassword('');
            setMode('login');
        }
    };



    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {/* ===== LOGO ===== */}
                    <Animated.View style={[styles.logoWrapper, { opacity: logoFade }]}>
                        <BlueLogo />
                    </Animated.View>
                    {/* ===== FORM ===== */}
                    <Animated.View
                        style={[
                            styles.bottomContainer,
                            mode !== 'login' && { paddingTop: 20 },
                            {
                                transform: [{ translateY: slideAnim }],
                                opacity: fadeAnim,
                            },
                        ]}
                    >
                        {mode === 'login' ? (
                            // === LOGIN MODE: keep current layout ===
                            <View style={styles.form}>
                                {success ? <Text style={styles.success}>{success}</Text> : null}
                                <TextField
                                    title="Email"
                                    placeholder="Escribe tu email"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); if (success) setSuccess(''); }}
                                    titleStyle={{ fontSize: 24, color: '#fff' }}
                                    inputStyle={{
                                        backgroundColor: 'transparent',
                                        borderColor: Colors.light.inputBorder,
                                        color: '#fff',
                                    }}
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                />
                                <TextField
                                    title="Contraseña"
                                    placeholder="Esccribe tu nombre"
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); if (success) setSuccess(''); }}
                                    titleStyle={{ fontSize: 24, color: '#fff' }}
                                    inputStyle={{
                                        backgroundColor: 'transparent',
                                        borderColor: Colors.light.inputBorder,
                                        color: '#fff',
                                    }}
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    secureTextEntry
                                />
                                {error ? <Text style={styles.error}>{error}</Text> : null}
                                <Button
                                    title={loginMutation.isPending ? 'Entrando...' : 'Entrar'}
                                    variant="secondary"
                                    textStyle={{
                                        color: '#000'
                                    }}
                                    style={styles.authButton}
                                    onPress={handleLogin}
                                    loading={loginMutation.isPending}
                                />

                                <TouchableOpacity
                                    onPress={() => {
                                        setMode('register-info');
                                        setError('');
                                        setSuccess('');
                                        setEmail('');
                                        setUsername('');
                                        setPassword('');
                                    }}
                                >
                                    <Text style={styles.linkText}>
                                        ¿No tienes cuenta?{' '}
                                        <Text style={styles.linkHighlight}>Regístrate</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // === REGISTER MODES: back button on top, fields at bottom, minHeight 414 ===
                            <View style={styles.registerContainer}>
                                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                    <BackArrow width={28} height={28} />
                                </TouchableOpacity>

                                <View style={styles.form}>
                                    {mode === 'register-info' && (
                                        <>
                                            <TextField
                                                title="Email"
                                                placeholder="Añade tu email"
                                                value={email}
                                                onChangeText={setEmail}
                                                titleStyle={{ fontSize: 24, color: Colors.light.white }}
                                                inputStyle={{
                                                    backgroundColor: 'transparent',
                                                    borderColor: Colors.light.inputBorder,
                                                    color: Colors.light.white,
                                                }}
                                                placeholderTextColor="rgba(255,255,255,0.6)"
                                            />

                                            <TextField
                                                title="Nombre de usuario"
                                                placeholder="Añade tu nombre"
                                                value={username}
                                                onChangeText={setUsername}
                                                titleStyle={{ fontSize: 24, color: '#fff' }}
                                                inputStyle={{
                                                    backgroundColor: 'transparent',
                                                    borderColor: Colors.light.inputBorder,
                                                    color: Colors.light.white,
                                                }}
                                                placeholderTextColor="rgba(255,255,255,0.6)"
                                            />
                                            {error ? <Text style={styles.error}>{error}</Text> : null}

                                            <Button
                                                title="Continuar"
                                                variant="secondary"
                                                textStyle={{
                                                    color: Colors.light.black
                                                }}
                                                style={styles.authButton}
                                                onPress={handleRegisterInfo}
                                            />
                                        </>
                                    )}

                                    {mode === 'register-password' && (
                                        <>
                                            <TextField
                                                title="Crea una nueva contraseña"
                                                placeholder="Nueva contraseña"
                                                value={password}
                                                onChangeText={setPassword}
                                                titleStyle={{ fontSize: 24, color: Colors.light.white }}
                                                inputStyle={{
                                                    backgroundColor: 'transparent',
                                                    borderColor: Colors.light.inputBorder,
                                                    color: Colors.light.white,
                                                }}
                                                placeholderTextColor="rgba(255,255,255,0.6)"
                                            />
                                            {error ? <Text style={styles.error}>{error}</Text> : null}
                                            <Button
                                                title={signupMutation.isPending ? 'Creando...' : 'Crear cuenta'}
                                                disabled={signupMutation.isPending}
                                                variant="secondary"
                                                textStyle={{
                                                    color: Colors.light.black
                                                }}
                                                style={styles.authButton}
                                                onPress={handleSignup}
                                                loading={signupMutation.isPending}
                                            />
                                        </>
                                    )}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        minHeight: 400,
        backgroundColor: Colors.light.white,
        padding: Space.md,
    },
    logoWrapper: {
        flex: 1,
        padding: Space.lg,
        alignItems: 'center',
    },
    logo: {
        width: 240,
        height: 120,
        resizeMode: 'contain',
    },
    backButton: {
        paddingHorizontal: Space.lg,
        paddingVertical: Space.md,
        borderColor: Colors.light.white,
        borderWidth: 1,
        borderRadius: CornorRadius.CornorRadius,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        marginBottom: 24,
        height: 44,
        gap: 8
    },
    bottomContainer: {
        backgroundColor: Colors.light.tailorBlue,
        borderRadius: Space.lg,
        paddingHorizontal: Space.lg,
        paddingVertical: Platform.OS === 'ios' ? Space.xl : Space.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    // Shared form styles
    form: {

        gap: 15,
    },
    // Container for registration & password modes:
    // back button on top, fields at bottom, minHeight 414
    registerContainer: {
        minHeight: 414,
        justifyContent: 'space-between',
    },

    input: {
        backgroundColor: 'rgba(0,0,0,0)',
        height: 44,
        borderWidth: 1,
        borderColor: Colors.light.inputBorder,
        borderRadius: Space.lg,
        fontSize: 16,
    },
    inputTextColor: {
        color: Colors.light.white
    },
    label: {
        color: Colors.light.white,
        fontSize: 24,
        marginBottom: -5,
        fontWeight: '600',
    },

    error: {
        color: Colors.light.error,
        marginTop: 6,
        textAlign: 'center',
    },
    success: {
        color: Colors.light.success,
        marginTop: 6,
        marginBottom: 4,
        textAlign: 'center',
        fontSize: 15,
    },

    authButton: {

        backgroundColor: Colors.light.white,
        fontSize: 16,
        borderRadius: 17,
        fontWeight: '600',
        paddingVertical: 12,

        paddingHorizontal: Space.lg,

        alignItems: 'center',

        justifyContent: 'center',

        height: 44,

    },

    linkText: {
        color: Colors.light.white,
        fontSize: 16,
        marginTop: 10,

    },

    linkHighlight: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
