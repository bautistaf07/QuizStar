/** Oculta el correo para los logs: "ana@correo.com" -> "a***@correo.com". */
export function enmascararCorreo(correo: string): string {
  if (typeof correo !== 'string') return '***';
  // Corrección D-003: se corta en la PRIMERA arroba para no perder parte del dominio.
  const i = correo.indexOf('@');
  if (i === -1 || i === correo.length - 1) return '***';
  return `${correo.charAt(0)}***@${correo.slice(i + 1)}`;
}
