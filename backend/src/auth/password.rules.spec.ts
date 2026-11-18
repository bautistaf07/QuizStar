import { validarPassword } from './password.rules';

describe('SWR-AUTH-001 · validarPassword', () => {
  it('rechaza una contraseña de 7 caracteres (límite)', () => {
    expect(validarPassword('1234567')).toBe('La contraseña debe tener mínimo 8 caracteres');
  });

  it('acepta una contraseña de exactamente 8 caracteres (límite)', () => {
    expect(validarPassword('12345678')).toBeNull();
  });

  it('rechaza una contraseña vacía o de solo espacios', () => {
    expect(validarPassword('')).toBe('La contraseña es obligatoria');
    expect(validarPassword('        ')).toBe('La contraseña es obligatoria');
  });
});
