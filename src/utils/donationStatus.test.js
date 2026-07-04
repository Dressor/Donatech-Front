import { describe, it, expect } from 'vitest';
import { donationDisplayStatus } from './donationStatus';

describe('donationDisplayStatus', () => {
  it('devuelve el estado de pago cuando no está APROBADA', () => {
    expect(donationDisplayStatus({ estadoPago: 'INGRESADA' })).toBe('INGRESADA');
    expect(donationDisplayStatus({ estadoPago: 'EN_VALIDACION_TRANSFERENCIA' }))
      .toBe('EN_VALIDACION_TRANSFERENCIA');
    expect(donationDisplayStatus({ estadoPago: 'RECHAZADA' })).toBe('RECHAZADA');
  });

  it('cae a estado si no hay estadoPago', () => {
    expect(donationDisplayStatus({ estado: 'INGRESADA' })).toBe('INGRESADA');
  });

  it('APROBADA con todas las órdenes ENTREGADA => ENTREGADA', () => {
    const d = { estadoPago: 'APROBADA', orders: [{ estado: 'ENTREGADA' }, { estado: 'ENTREGADA' }] };
    expect(donationDisplayStatus(d)).toBe('ENTREGADA');
  });

  it('APROBADA con órdenes mixtas => la menos avanzada activa', () => {
    const d = { estadoPago: 'APROBADA', orders: [{ estado: 'ENTREGADA' }, { estado: 'EN_PREPARACION' }] };
    expect(donationDisplayStatus(d)).toBe('EN_PREPARACION');
  });

  it('APROBADA con EN_CAMINO y PENDIENTE_CONFIRMACION => EN_CAMINO', () => {
    const d = { estadoPago: 'APROBADA', orders: [{ estado: 'PENDIENTE_CONFIRMACION' }, { estado: 'EN_CAMINO' }] };
    expect(donationDisplayStatus(d)).toBe('EN_CAMINO');
  });

  it('APROBADA sin órdenes => APROBADA', () => {
    expect(donationDisplayStatus({ estadoPago: 'APROBADA', orders: [] })).toBe('APROBADA');
  });

  it('ignora órdenes canceladas al calcular el estado activo', () => {
    const d = { estadoPago: 'APROBADA', orders: [{ estado: 'CANCELADA' }, { estado: 'EN_CAMINO' }] };
    expect(donationDisplayStatus(d)).toBe('EN_CAMINO');
  });
});
