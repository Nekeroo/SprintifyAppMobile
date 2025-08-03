import { useState } from 'react';
import { StyleSheet, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../../services/auth';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return false;
    }

    if (!isLogin) {
      if (!credentials.email.trim()) {
        Alert.alert('Erreur', "L'email est requis");
        return false;
      }
      if (credentials.password !== credentials.confirmPassword) {
        Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        Alert.alert('Erreur', "L'email n'est pas valide");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isLogin) {
        await authService.login({
          username: credentials.username,
          password: credentials.password,
        });
      } else {
        await authService.register({
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
        });
      }
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        'Erreur',
        isLogin 
          ? 'Identifiants incorrects ou problème de connexion'
          : "L'inscription a échoué. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Réinitialiser les champs lors du changement de mode
    setCredentials({
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

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              style={styles.input}
              value={credentials.username}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, username: text }))}
              placeholder="Entrez votre nom d'utilisateur"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={credentials.email}
                onChangeText={(text) => setCredentials(prev => ({ ...prev, email: text }))}
                placeholder="Entrez votre email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={credentials.password}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
              placeholder={isLogin ? "Entrez votre mot de passe" : "Choisissez un mot de passe"}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                value={credentials.confirmPassword}
                onChangeText={(text) => setCredentials(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirmez votre mot de passe"
                secureTextEntry
              />
            </View>
          )}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
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
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
