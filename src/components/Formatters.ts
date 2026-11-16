import { BRAND_INFO } from '../lib/firebase';

export function formatPKR(amount: number): string {
  return `Rs. ${Number(amount || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatPKRDecimal(amount: number): string {
  return `Rs. ${Number(amount || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${BRAND_INFO.whatsappIntl}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
