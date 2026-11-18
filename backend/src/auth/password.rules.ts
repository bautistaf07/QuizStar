/**
 * SWR-AUTH-001 (ajuste de verificación): la contraseña debe tener mínimo 8 caracteres.
 * Devuelve el mensaje de error, o null si la contraseña es válida.
 */
export function validarPassword(password: string): string | null {
  if (typeof password !== 'string' || password.trim().length === 0) {
    return 'La contraseña es obligatoria';
  }
  if (password.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres';
  }
  return null;
}
