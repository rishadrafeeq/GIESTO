import { siteConfig } from '../config/siteConfig';
import { getDisplayPrice } from './productHelpers';

/** Build WhatsApp order link with product details */
export function buildWhatsAppUrl(product, selectedSize) {
  const phone = siteConfig.whatsappNumber.replace(/\D/g, '');
  const text = encodeURIComponent(
    `Hi ${siteConfig.shopName}! I want to order:\n\n` +
      `Product: ${product.name}\n` +
      `Size: ${selectedSize}\n` +
      `Price: ${getDisplayPrice(product)}\n` +
      `Category: ${product.categoryLabel}\n\n` +
      `Please confirm availability.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function whatsAppContactUrl() {
  return `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`;
}
