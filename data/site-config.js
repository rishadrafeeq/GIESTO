/**
 * SETUP (once, by you or developer):
 * 1. Create a Google Sheet from data/products-template.csv
 * 2. Share edit access with your client
 * 3. File → Share → Publish to web → CSV → copy the link
 * 4. Paste the link below in googleSheetCsvUrl and set productsSource to 'sheets'
 */
window.GIESTO_CONFIG = {
    productsSource: 'json',
    productsJsonUrl: '../data/products.json',
    googleSheetCsvUrl: ''
};
