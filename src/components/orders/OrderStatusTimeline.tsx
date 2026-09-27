import React from 'react';
import type { OrderStatus } from '../../services/orderService';
import { CheckIcon } from '../common/Icons';
import './OrderStatusTimeline.css';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

const TIMELINE_STEPS: OrderStatus[] = [
  'Order Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ currentStatus }) => {
  // If order was cancelled, render cancelled notice
  if (currentStatus === 'Cancelled') {
    return (
      <div className="order-cancelled-banner" role="status">
        <span className="cancelled-indicator" />
        <div>
          <strong>Order Cancelled</strong>
          <p>This order has been cancelled and will not be dispatched.</p>
        </div>
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);
  const activeStepIndex = currentIndex !== -1 ? currentIndex : 0;

  return (
    <div className="order-timeline-wrapper" aria-label="Order status progression">
      <ol className="timeline-steps-list">
        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;
          const isUpcoming = idx > activeStepIndex;

          return (
            <li
              key={step}
              className={`timeline-step ${isCompleted ? 'is-completed' : ''} ${
                isCurrent ? 'is-current' : ''
              } ${isUpcoming ? 'is-upcoming' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="step-marker-wrap">
                <div className="step-marker">
                  {isCompleted ? (
                    <CheckIcon size={12} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`step-line ${
                      idx < activeStepIndex ? 'is-line-active' : ''
                    }`}
                  />
                )}
              </div>

              <div className="step-info">
                <span className="step-name">{step}</span>
                <span className="step-state-tag">
                  {isCompleted
                    ? 'Completed'
                    : isCurrent
                    ? 'Current Status'
                    : 'Upcoming'}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
