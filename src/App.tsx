import { TopAnnouncementBar } from './components/layout/TopAnnouncementBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { AccountPage } from './pages/AccountPage';
import { CollectionPage } from './pages/CollectionPage';
import { OutfitDetailPage } from './pages/OutfitDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/products/QuickViewModal';
import { useQuickView } from './services/quickViewStore';
import { BrandIntro } from './components/brand/BrandIntro';
import { useCurrentRoute, navigateTo } from './utils/navigation';
import './App.css';

export function App() {
  const { pathname } = useCurrentRoute();
  const {
    isOpen: isQuickViewOpen,
    product: quickViewProduct,
    triggerElement: quickViewTrigger,
    close: closeQuickView,
  } = useQuickView();

  const isOrderSuccess = pathname === '/order-success' || pathname.startsWith('/order-success/');
  const isOrderDetail =
    (pathname.startsWith('/orders/') && pathname.length > 8) ||
    (pathname.startsWith('/account/orders/') && pathname.length > 16);
  const isOrders =
    pathname === '/orders' ||
    pathname === '/orders/' ||
    pathname === '/account/orders' ||
    pathname === '/account/orders/';
  const isAccount =
    !isOrders && !isOrderDetail && (pathname === '/account' || pathname.startsWith('/account/'));
  const isCheckout = pathname === '/checkout' || pathname.startsWith('/checkout/');
  const isCart = pathname === '/cart' || pathname.startsWith('/cart/');
  const isWishlist = pathname === '/wishlist' || pathname.startsWith('/wishlist/');
  const isLooks = pathname === '/looks' || pathname.startsWith('/looks/');
  const isCollections = pathname === '/collections' || pathname.startsWith('/collections/');
  const isCatalog = pathname === '/catalog' || pathname.startsWith('/catalog/');
  const isProductDetail = pathname === '/product' || pathname.startsWith('/product/');

  const lookSlug = isLooks
    ? decodeURIComponent(pathname.replace(/^\/looks\/?/, '').split('/')[0])
    : '';

  const collectionSlug = isCollections
    ? decodeURIComponent(pathname.replace(/^\/collections\/?/, '').split('/')[0]) || 'oversized-edit'
    : '';

  const orderDetailId = isOrderDetail
    ? decodeURIComponent(pathname.replace(/^\/(account\/)?orders\//, '').replace(/\/$/, ''))
    : '';

  return (
    <div className="app-shell">
      <BrandIntro />
      <TopAnnouncementBar />
      <Header />
      {isOrderSuccess ? (
        <OrderSuccessPage />
      ) : isOrderDetail ? (
        <OrderDetailPage orderId={orderDetailId} />
      ) : isOrders ? (
        <OrdersPage />
      ) : isAccount ? (
        <AccountPage />
      ) : isCheckout ? (
        <CheckoutPage />
      ) : isCart ? (
        <CartPage />
      ) : isWishlist ? (
        <WishlistPage />
      ) : isProductDetail ? (
        <ProductDetailPage />
      ) : isLooks ? (
        <OutfitDetailPage
          lookSlug={lookSlug}
          onNavigateHome={() => navigateTo('/')}
        />
      ) : isCollections ? (
        <CollectionPage
          collectionSlug={collectionSlug}
          onNavigateHome={() => navigateTo('/')}
        />
      ) : isCatalog ? (
        <CatalogPage onNavigateHome={() => navigateTo('/')} />
      ) : (
        <HomePage />
      )}
      <CartDrawer />
      <QuickViewModal
        isOpen={isQuickViewOpen}
        product={quickViewProduct}
        onClose={closeQuickView}
        triggerElement={quickViewTrigger}
      />
      <Footer />
    </div>
  );
}

export default App;
