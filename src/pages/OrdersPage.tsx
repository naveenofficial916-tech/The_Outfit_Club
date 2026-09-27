import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import type { OrderPayload } from '../services/orderService';
import { useCustomerSession } from '../hooks/useCustomerSession';
import { OrderCard } from '../components/orders/OrderCard';
import { navigateTo } from '../utils/navigation';
import { BagIcon, ArrowRightIcon, CheckIcon, CloseIcon, UserIcon } from '../components/common/Icons';
import './OrdersPage.css';

export const OrdersPage: React.FC = () => {
  const session = useCustomerSession();
  const [orders, setOrders] = useState<OrderPayload[]>(() => {
    return orderService.getOrdersForCustomer();
  });
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Re-fetch customer-specific orders whenever auth session changes or an order is placed
  useEffect(() => {
    const refreshOrders = () => {
      if (session.isLoggedIn) {
        setOrders(orderService.getOrdersForCustomer(session.customerId, session.email));
      } else {
        setOrders([]);
      }
    };

    refreshOrders();

    const handleOrderEvent = () => refreshOrders();
    window.addEventListener('the_outfit_club_order_placed', handleOrderEvent);
    return () => {
      window.removeEventListener('the_outfit_club_order_placed', handleOrderEvent);
    };
  }, [session.isLoggedIn, session.customerId, session.email]);

  // Status Filter Tabs
  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.status) set.add(o.status);
    });
    return ['All', ...Array.from(set)];
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'All') return orders;
    return orders.filter((o) => o.status === selectedFilter);
  }, [orders, selectedFilter]);

  const handleReorderFeedback = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <main className="orders-page-wrapper" id="orders-page">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="orders-toast" role="status" aria-live="polite">
          <CheckIcon size={16} />
          <span>{toastMessage}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss toast"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="orders-container">
        {/* Breadcrumbs */}
        <nav className="orders-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigateTo('/')} className="breadcrumb-link">
            HOME
          </button>
          <span className="breadcrumb-separator">/</span>
          <button type="button" onClick={() => navigateTo('/account')} className="breadcrumb-link">
            MY ACCOUNT
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">MY ORDERS</span>
        </nav>

        {/* Page Title & Count */}
        <div className="orders-header-row">
          <div>
            <h1 className="orders-title">MY ORDERS</h1>
            <p className="orders-subtitle">
              Review details, track dispatch status, and reorder from your past men's wardrobe selections.
            </p>
          </div>
          {session.isLoggedIn && orders.length > 0 && (
            <span className="orders-count-badge">
              {orders.length} {orders.length === 1 ? 'ORDER' : 'ORDERS'}
            </span>
          )}
        </div>

        {/* 1. Logged-Out State (Task 5.3 Requirement 8) */}
        {!session.isLoggedIn ? (
          <div className="orders-empty-state" id="orders-logged-out-state">
            <div className="empty-orders-icon">
              <UserIcon size={48} />
            </div>
            <h2 className="empty-orders-title">SIGN IN TO VIEW YOUR ORDERS</h2>
            <p className="empty-orders-desc">
              Please sign in to your account to view your past purchases and order status.
            </p>
            <button
              type="button"
              className="btn-shop-collection"
              onClick={() => navigateTo('/account')}
              id="btn-login-to-view-orders"
            >
              LOGIN
              <ArrowRightIcon size={18} />
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* 2. Empty Order State (Task 5.3 Requirement 7) */
          <div className="orders-empty-state" id="orders-empty-state">
            <div className="empty-orders-icon">
              <BagIcon size={48} />
            </div>
            <h2 className="empty-orders-title">NO ORDERS YET</h2>
            <p className="empty-orders-desc">
              Your orders will appear here after you complete a purchase.
            </p>
            <button
              type="button"
              className="btn-shop-collection"
              onClick={() => navigateTo('/catalog')}
              id="btn-start-shopping"
            >
              START SHOPPING
              <ArrowRightIcon size={18} />
            </button>
          </div>
        ) : (
          /* 3. Logged-In Orders List (Task 5.3 Requirement 5) */
          <>
            {/* Filter Tabs */}
            {availableStatuses.length > 2 && (
              <div className="orders-filter-bar" role="tablist" aria-label="Filter orders by status">
                {availableStatuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    role="tab"
                    aria-selected={selectedFilter === st}
                    className={`filter-tab-btn ${selectedFilter === st ? 'is-active' : ''}`}
                    onClick={() => setSelectedFilter(st)}
                  >
                    <span>{st}</span>
                    <span className="filter-count">
                      {st === 'All' ? orders.length : orders.filter((o) => o.status === st).length}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Orders List (Newest first) */}
            <div className="orders-list-grid">
              {filteredOrders.length === 0 ? (
                <div className="no-filtered-orders">
                  <p>No orders found matching status "{selectedFilter}".</p>
                  <button
                    type="button"
                    className="btn-reset-filter"
                    onClick={() => setSelectedFilter('All')}
                  >
                    Show all orders
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.orderId || order.id}
                    order={order}
                    onReorderSuccess={handleReorderFeedback}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};
