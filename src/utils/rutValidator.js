export function isValidRut(rut) {
  if (!rut) return false;
  const normalized = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (normalized.length < 2) return false;
  const body = normalized.slice(0, -1);
  const dv = normalized[normalized.length - 1];
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return dv === expected;
}
