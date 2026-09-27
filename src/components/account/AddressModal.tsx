import React, { useState, useEffect } from 'react';
import type { SavedAddress } from '../../services/customerStore';
import { CloseIcon } from '../common/Icons';
import './AddressModal.css';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Omit<SavedAddress, 'id'>) => void;
  initialAddress?: SavedAddress | null;
}

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Italy',
];

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAddress,
}) => {
  const [formData, setFormData] = useState<Omit<SavedAddress, 'id'>>(() => ({
    fullName: initialAddress?.fullName || '',
    addressLine1: initialAddress?.addressLine1 || '',
    addressLine2: initialAddress?.addressLine2 || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    postalCode: initialAddress?.postalCode || '',
    country: initialAddress?.country || 'United States',
    phone: initialAddress?.phone || '',
    isDefault: initialAddress?.isDefault || false,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Omit<SavedAddress, 'id'>, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!formData.addressLine1.trim()) errs.addressLine1 = 'Street address is required.';
    if (!formData.city.trim()) errs.city = 'City is required.';
    if (!formData.state.trim()) errs.state = 'State / province is required.';
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal code is required.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="address-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="address-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="address-modal-header">
          <h3 className="modal-title">
            {initialAddress ? 'EDIT SHIPPING ADDRESS' : 'ADD NEW ADDRESS'}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close address modal"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="address-modal-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="modal-fullname" className="form-label">
              FULL NAME <span className="req">*</span>
            </label>
            <input
              id="modal-fullname"
              type="text"
              className={`form-input ${errors.fullName ? 'is-invalid' : ''}`}
              placeholder="e.g. Marcus Vance"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          {/* Street Address */}
          <div className="form-group">
            <label htmlFor="modal-address1" className="form-label">
              STREET ADDRESS <span className="req">*</span>
            </label>
            <input
              id="modal-address1"
              type="text"
              className={`form-input ${errors.addressLine1 ? 'is-invalid' : ''}`}
              placeholder="e.g. 450 Mercer Street"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
            />
            {errors.addressLine1 && <span className="form-error">{errors.addressLine1}</span>}
          </div>

          {/* Apartment */}
          <div className="form-group">
            <label htmlFor="modal-address2" className="form-label">
              APARTMENT / SUITE <span className="opt">(OPTIONAL)</span>
            </label>
            <input
              id="modal-address2"
              type="text"
              className="form-input"
              placeholder="e.g. Apt 4B"
              value={formData.addressLine2 || ''}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
            />
          </div>

          {/* City & State */}
          <div className="modal-grid-2">
            <div className="form-group">
              <label htmlFor="modal-city" className="form-label">
                CITY <span className="req">*</span>
              </label>
              <input
                id="modal-city"
                type="text"
                className={`form-input ${errors.city ? 'is-invalid' : ''}`}
                placeholder="e.g. New York"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="modal-state" className="form-label">
                STATE / PROVINCE <span className="req">*</span>
              </label>
              <input
                id="modal-state"
                type="text"
                className={`form-input ${errors.state ? 'is-invalid' : ''}`}
                placeholder="e.g. NY"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
              {errors.state && <span className="form-error">{errors.state}</span>}
            </div>
          </div>

          {/* Postal & Country */}
          <div className="modal-grid-2">
            <div className="form-group">
              <label htmlFor="modal-postal" className="form-label">
                POSTAL CODE <span className="req">*</span>
              </label>
              <input
                id="modal-postal"
                type="text"
                className={`form-input ${errors.postalCode ? 'is-invalid' : ''}`}
                placeholder="e.g. 10013"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
              {errors.postalCode && <span className="form-error">{errors.postalCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="modal-country" className="form-label">
                COUNTRY <span className="req">*</span>
              </label>
              <select
                id="modal-country"
                className="form-select"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="modal-phone" className="form-label">
              PHONE NUMBER <span className="req">*</span>
            </label>
            <input
              id="modal-phone"
              type="tel"
              className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="e.g. +1 (555) 019-2834"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* Default Checkbox */}
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              className="custom-chk"
            />
            <span className="chk-label">Set as default delivery address</span>
          </label>

          {/* Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn-modal-submit">
              {initialAddress ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
