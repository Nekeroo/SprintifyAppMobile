/**
 * Utilitaires pour la manipulation et validation des dates
 */

/**
 * Formate une chaîne pour l'affichage au format JJ/MM/AAAA
 * @param input Chaîne contenant des chiffres à formater
 * @returns Chaîne formatée JJ/MM/AAAA
 */
export const formatDate = (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };
  
  /**
   * Vérifie si une chaîne représente une date valide au format JJ/MM/AAAA
   * @param dateStr Chaîne au format JJ/MM/AAAA à valider
   * @returns boolean indiquant si la date est valide
   */
  export const isValidDate = (dateStr: string): boolean => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
  
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
  
    const date = new Date(year, month, day);
    return date.getDate() === day &&
           date.getMonth() === month &&
           date.getFullYear() === year;
  };
  
  /**
   * Convertit une date au format JJ/MM/AAAA en objet Date
   * @param dateStr Chaîne au format JJ/MM/AAAA
   * @returns Objet Date ou null si la date n'est pas valide
   */
  export const parseDate = (dateStr: string): Date | null => {
    if (!isValidDate(dateStr)) return null;
  
    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
  
    return new Date(year, month, day);
  };
  
  /**
   * Convertit un objet Date en chaîne au format JJ/MM/AAAA
   * @param date Objet Date à convertir
   * @returns Chaîne au format JJ/MM/AAAA
   */
  export const dateToString = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  /**
   * Retourne la date d'aujourd'hui au format JJ/MM/AAAA
   */
  export const getTodayString = (): string => dateToString(new Date());
  
  /**
   * Retourne la date de demain au format JJ/MM/AAAA
   */
  export const getTomorrowString = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateToString(tomorrow);
  };
  
  /**
   * Retourne la date dans une semaine au format JJ/MM/AAAA
   */
  export const getNextWeekString = (): string => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return dateToString(nextWeek);
  };
  
  /**
   * Convertit une date ISO (format API) en format JJ/MM/AAAA pour affichage
   * @param isoDateString Chaîne au format yyyy-MM-dd ou ISO complet
   * @returns Chaîne au format JJ/MM/AAAA ou chaîne vide si invalide
   */
  export const isoToDisplayDate = (isoDateString: string): string => {
    if (!isoDateString) return '';
    try {
      const date = new Date(isoDateString);
      return dateToString(date);
    } catch {
      return '';
    }
  };
  
  /**
   * Convertit une date d'affichage (JJ/MM/AAAA) en format yyyy-MM-dd pour l'API
   * @param displayDate Chaîne au format JJ/MM/AAAA
   * @returns Chaîne au format yyyy-MM-dd ou chaîne vide si date invalide
   */
  export const displayDateToApi = (displayDate: string): string => {
    const date = parseDate(displayDate);
    if (!date) return '';
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Convertit un objet Date en format yyyy-MM-dd pour l'API
   * @param date Objet Date à convertir
   * @returns Chaîne au format yyyy-MM-dd
   */
  export const dateToApiString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  