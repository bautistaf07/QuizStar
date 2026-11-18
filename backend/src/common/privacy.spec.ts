import { enmascararCorreo } from './privacy';

describe('Logs seguros (requisito de la guía, relacionado con SWR-SEC-002) · enmascararCorreo', () => {
  it('muestra solo la primera letra del usuario', () => {
    expect(enmascararCorreo('ana@correo.com')).toBe('a***@correo.com');
  });

  it('devuelve *** si el texto no es un correo', () => {
    expect(enmascararCorreo('sin-arroba')).toBe('***');
  });
});
