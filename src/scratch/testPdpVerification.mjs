/**
 * testPdpVerification.mjs
 * Validates ProductDetailPage.tsx syntax, structure, components, and props.
 */
import fs from 'fs';
import ts from 'typescript';

console.log('\n🧪 VERIFYING ProductDetailPage.tsx\n');

const code = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');

// 1. TypeScript Parse Diagnostics
const sourceFile = ts.createSourceFile('ProductDetailPage.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const diagnostics = sourceFile.parseDiagnostics;

if (diagnostics.length === 0) {
  console.log('✅ TSX Parse: 0 errors. File is syntactically pristine.');
} else {
  console.error('❌ Parse errors found:', diagnostics);
  process.exit(1);
}

// 2. Check for required elements and handlers
const checks = [
  { name: 'Product gallery & thumbnails', pattern: /pdp-main-image[\s\S]*pdp-thumbnails-strip/ },
  { name: 'Color selection swatches', pattern: /pdp-color-swatch[\s\S]*handleColorSelect/ },
  { name: 'Size selection buttons', pattern: /pdp-size-btn[\s\S]*handleSizeSelect/ },
  { name: 'Size guide modal trigger', pattern: /pdp-size-guide-btn[\s\S]*setShowSizeGuide/ },
  { name: 'Quantity stepper', pattern: /pdp-qty-stepper[\s\S]*handleQtyChange/ },
  { name: 'Add to Cart button', pattern: /pdp-add-to-bag-btn[\s\S]*handleAddToCart/ },
  { name: 'Buy Now button', pattern: /pdp-buy-now-btn[\s\S]*handleBuyNow[\s\S]*BUY NOW[\s\S]*<\/button>/ },
  { name: 'Wishlist toggle button', pattern: /pdp-wishlist-toggle-btn[\s\S]*handleWishlistToggleAction[\s\S]*HeartIcon/ },
  { name: 'Stock status display', pattern: /pdp-stock-status[\s\S]*isOutOfStock/ },
  { name: 'Accordions (Description, Fit, Material, Shipping)', pattern: /pdp-accordions-group[\s\S]*toggleAccordion/ },
  { name: 'Complete The Look discovery rail', pattern: /COMPLETE THE LOOK/ },
  { name: 'Featured in Complete Looks outfit cards', pattern: /FEATURED IN COMPLETE LOOKS/ },
  { name: 'Related products ("YOU MAY ALSO LIKE")', pattern: /YOU MAY ALSO LIKE/ },
  { name: 'Recently Viewed rail', pattern: /RECENTLY VIEWED/ },
  { name: 'Mobile sticky purchase bar', pattern: /pdp-mobile-sticky-bar[\s\S]*sticky-bar-cta/ },
];

let allPassed = true;
checks.forEach(({ name, pattern }) => {
  if (pattern.test(code)) {
    console.log(`✅ ${name}: Verified present`);
  } else {
    console.error(`❌ ${name}: NOT FOUND`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n🎉 ALL ProductDetailPage features and JSX elements verified successfully!\n');
} else {
  process.exit(1);
}
