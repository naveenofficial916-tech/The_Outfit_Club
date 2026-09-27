import React from 'react';
import { DELIVERY_METHODS, calculateDeliveryCost } from '../../services/shippingService';
import type { DeliveryMethod } from '../../services/shippingService';
import { TruckIcon, CheckIcon } from '../common/Icons';
import './DeliveryMethodSelector.css';

interface DeliveryMethodSelectorProps {
  selectedMethodId: string;
  subtotal: number;
  onSelectMethod: (methodId: string) => void;
}

export const DeliveryMethodSelector: React.FC<DeliveryMethodSelectorProps> = ({
  selectedMethodId,
  subtotal,
  onSelectMethod,
}) => {
  const formatCost = (method: DeliveryMethod) => {
    const cost = calculateDeliveryCost(method.id, subtotal);
    if (cost === 0) {
      return <span className="cost-free">FREE</span>;
    }
    return <span className="cost-price">${cost.toFixed(2)}</span>;
  };

  return (
    <div className="delivery-methods-group" role="radiogroup" aria-label="Choose delivery speed">
      <div className="delivery-methods-list">
        {DELIVERY_METHODS.map((method) => {
          const isSelected = selectedMethodId === method.id;
          return (
            <label
              key={method.id}
              className={`delivery-method-card ${isSelected ? 'is-selected' : ''}`}
            >
              <div className="method-radio-col">
                <input
                  type="radio"
                  name="delivery_method"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onSelectMethod(method.id)}
                  className="delivery-radio-input"
                />
                <span className="custom-radio-mark">
                  {isSelected && <CheckIcon size={12} />}
                </span>
              </div>

              <div className="method-info-col">
                <div className="method-title-row">
                  <div className="method-title-wrap">
                    <TruckIcon size={16} />
                    <span className="method-name">{method.name}</span>
                  </div>
                  <div className="method-price-wrap">{formatCost(method)}</div>
                </div>

                <div className="method-estimate">{method.estimate}</div>
                <div className="method-description">{method.description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
