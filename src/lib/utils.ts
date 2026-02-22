export function formatPrice(price: number, currency: string = "₺"): string {
  return `${price.toFixed(2)} ${currency}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateQRUrl(baseUrl: string, tableId: number): string {
  return `${baseUrl}/menu?masa=${tableId}`;
}
