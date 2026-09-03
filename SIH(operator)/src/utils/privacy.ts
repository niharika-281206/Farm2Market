export function maskName(name: string, isPrivacyActive: boolean): string {
  if (!isPrivacyActive || !name) return name;
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0][0] + '***' + (parts[0].length > 3 ? parts[0].substring(parts[0].length - 1) : '');
  }
  return parts.map(p => p[0] + '***').join(' ');
}

export function maskAadhaar(aadhaarLast4: string, isPrivacyActive: boolean): string {
  if (!isPrivacyActive || !aadhaarLast4) return `XXXX-XXXX-${aadhaarLast4 || 'XXXX'}`;
  return `XXXX-XXXX-${aadhaarLast4}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
