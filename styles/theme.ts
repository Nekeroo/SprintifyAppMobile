import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007AFF',
  background: '#fff',
  text: {
    primary: '#000',
    secondary: '#666',
    tertiary: '#888',
  },
  border: '#ddd',
  error: 'red',
  shadow: '#000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
  },
  small: {
    fontSize: 12,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
  textBody: {
    ...typography.body,
    color: colors.text.primary,
  },
  textSecondary: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  textTertiary: {
    ...typography.small,
    color: colors.text.tertiary,
  },
});
