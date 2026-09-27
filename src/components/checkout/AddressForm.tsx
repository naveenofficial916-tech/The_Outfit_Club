import React from 'react';
import type { Address } from '../../services/orderService';
import './AddressForm.css';

interface AddressFormProps {
  title: string;
  prefix: 'shipping' | 'billing';
  values: Address;
  errors: Record<string, string>;
  onChange: (field: keyof Address, value: string) => void;
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

export const AddressForm: React.FC<AddressFormProps> = ({
  title,
  prefix,
  values,
  errors,
  onChange,
}) => {
  return (
    <fieldset className="address-form-fieldset">
      <legend className="address-form-legend">{title}</legend>

      {/* Address Line 1 */}
      <div className="form-group">
        <label htmlFor={`${prefix}-address1`} className="form-label">
          STREET ADDRESS <span className="required-star">*</span>
        </label>
        <input
          id={`${prefix}-address1`}
          type="text"
          className={`form-input ${errors.addressLine1 ? 'is-invalid' : ''}`}
          placeholder="e.g. 742 Evergreen Terrace"
          value={values.addressLine1}
          onChange={(e) => onChange('addressLine1', e.target.value)}
          aria-required="true"
          aria-invalid={Boolean(errors.addressLine1)}
          aria-describedby={errors.addressLine1 ? `${prefix}-address1-error` : undefined}
          autoComplete={prefix === 'shipping' ? 'shipping address-line1' : 'billing address-line1'}
        />
        {errors.addressLine1 && (
          <span id={`${prefix}-address1-error`} className="form-error" role="alert">
            {errors.addressLine1}
          </span>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="form-group">
        <label htmlFor={`${prefix}-address2`} className="form-label">
          APARTMENT, SUITE, UNIT <span className="optional-tag">(OPTIONAL)</span>
        </label>
        <input
          id={`${prefix}-address2`}
          type="text"
          className="form-input"
          placeholder="e.g. Apt 4B, Studio 12"
          value={values.addressLine2 || ''}
          onChange={(e) => onChange('addressLine2', e.target.value)}
          autoComplete={prefix === 'shipping' ? 'shipping address-line2' : 'billing address-line2'}
        />
      </div>

      {/* City & State Grid */}
      <div className="form-row-2">
        <div className="form-group">
          <label htmlFor={`${prefix}-city`} className="form-label">
            CITY <span className="required-star">*</span>
          </label>
          <input
            id={`${prefix}-city`}
            type="text"
            className={`form-input ${errors.city ? 'is-invalid' : ''}`}
            placeholder="e.g. New York"
            value={values.city}
            onChange={(e) => onChange('city', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? `${prefix}-city-error` : undefined}
            autoComplete={prefix === 'shipping' ? 'shipping address-level2' : 'billing address-level2'}
          />
          {errors.city && (
            <span id={`${prefix}-city-error`} className="form-error" role="alert">
              {errors.city}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={`${prefix}-state`} className="form-label">
            STATE / PROVINCE <span className="required-star">*</span>
          </label>
          <input
            id={`${prefix}-state`}
            type="text"
            className={`form-input ${errors.state ? 'is-invalid' : ''}`}
            placeholder="e.g. NY or California"
            value={values.state}
            onChange={(e) => onChange('state', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.state)}
            aria-describedby={errors.state ? `${prefix}-state-error` : undefined}
            autoComplete={prefix === 'shipping' ? 'shipping address-level1' : 'billing address-level1'}
          />
          {errors.state && (
            <span id={`${prefix}-state-error`} className="form-error" role="alert">
              {errors.state}
            </span>
          )}
        </div>
      </div>

      {/* Postal Code & Country Grid */}
      <div className="form-row-2">
        <div className="form-group">
          <label htmlFor={`${prefix}-postal`} className="form-label">
            POSTAL / ZIP CODE <span className="required-star">*</span>
          </label>
          <input
            id={`${prefix}-postal`}
            type="text"
            className={`form-input ${errors.postalCode ? 'is-invalid' : ''}`}
            placeholder="e.g. 10001"
            value={values.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.postalCode)}
            aria-describedby={errors.postalCode ? `${prefix}-postal-error` : undefined}
            autoComplete={prefix === 'shipping' ? 'shipping postal-code' : 'billing postal-code'}
          />
          {errors.postalCode && (
            <span id={`${prefix}-postal-error`} className="form-error" role="alert">
              {errors.postalCode}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={`${prefix}-country`} className="form-label">
            COUNTRY <span className="required-star">*</span>
          </label>
          <select
            id={`${prefix}-country`}
            className="form-select"
            value={values.country}
            onChange={(e) => onChange('country', e.target.value)}
            aria-required="true"
            autoComplete={prefix === 'shipping' ? 'shipping country-name' : 'billing country-name'}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
};
