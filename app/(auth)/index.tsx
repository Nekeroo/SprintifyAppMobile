import { useState } from 'react';
import { StyleSheet, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, register } from '@/store/authSlice';

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'username':
        if (!value.trim()) {
          return "Le nom d'utilisateur est requis";
        }
        if (value.length > 50) {
          return "Le nom d'utilisateur ne doit pas dépasser 50 caractères";
        }
        return '';
      case 'email':
        if (!value.trim()) {
          return "L'email est requis";
        }
        if (value.length > 50) {
          return "L'email ne doit pas dépasser 50 caractères";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "L'email n'est pas valide";
        }
        return '';
      case 'password':
        if (!value.trim()) {
          return "Le mot de passe est requis";
        }
        return '';
      case 'confirmPassword':
        if (!value.trim()) {
          return "La confirmation du mot de passe est requise";
        }
        if (value !== credentials.password) {
          return "Les mots de passe ne correspondent pas";
        }
        return '';
    }
    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    if (field === 'password') {
      // Revalidate confirmPassword when password changes
      const confirmError = validateField('confirmPassword', credentials.confirmPassword);
      setErrors(prev => ({ ...prev, [field]: error, confirmPassword: confirmError }));
    } else {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: validateField('username', credentials.username),
      email: !isLogin ? validateField('email', credentials.email) : '',
      password: validateField('password', credentials.password),
      confirmPassword: !isLogin ? validateField('confirmPassword', credentials.confirmPassword) : '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        const resultAction = await dispatch(
          login({ username: credentials.username, password: credentials.password })
        );
        if (login.fulfilled.match(resultAction)) {
          router.replace('/(tabs)/projects');
        } else {
          Alert.alert('Erreur', error || 'Identifiants incorrects ou problème de connexion');
        }
      } else {
        const resultAction = await dispatch(
          register({
            username: credentials.username,
            email: credentials.email,
            password: credentials.password,
          })
        );
        if (register.fulfilled.match(resultAction)) {
          router.replace('/(tabs)/projects');
        } else {
          Alert.alert('Erreur', error || "L'inscription a échoué. Veuillez réessayer.");
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    
    if (newIsLogin) {
      setCredentials({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
    
    setErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Sprintify</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Connectez-vous pour continuer' : 'Créez votre compte'}
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>Une erreur à été rencontrée. Veuillez reessayer.</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              style={[styles.input, errors.username ? styles.inputError : null]}
              value={credentials.username}
              onChangeText={(text) => handleFieldChange('username', text)}
              placeholder="Entrez votre nom d'utilisateur"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={50}
            />
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={credentials.email}
                onChangeText={(text) => handleFieldChange('email', text)}
                placeholder="Entrez votre email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={50}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              value={credentials.password}
              onChangeText={(text) => handleFieldChange('password', text)}
              placeholder={isLogin ? "Entrez votre mot de passe" : "Choisissez un mot de passe"}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                value={credentials.confirmPassword}
                onChangeText={(text) => handleFieldChange('confirmPassword', text)}
                placeholder="Confirmez votre mot de passe"
                secureTextEntry
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>
          )}

          <Pressable
            style={[styles.button, status === 'loading' && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Se connecter' : "S'inscrire"}
              </Text>
            )}
          </Pressable>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            </Text>
            <Pressable onPress={toggleMode}>
              <Text style={styles.toggleLink}>
                {isLogin ? "S'inscrire" : 'Se connecter'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, opacity: 0.7 },
  form: { gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 16, fontWeight: '500' },
  input: { 
    backgroundColor: '#f8f9fa', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16 
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 16 },
  toggleText: { fontSize: 14 },
  toggleLink: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AuthScreen;
