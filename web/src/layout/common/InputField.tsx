import classnames from 'classnames';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { API } from '../../api';
import { AvailabilityInfo, RefInputField } from '../../types';
import styles from './InputField.module.css';

export interface Props {
  type: 'text' | 'password' | 'email' | 'url';
  label?: string;
  name: string;
  value?: string;
  validText?: string;
  invalidText?: {
    default: string;
    [key: string]: string;
  };
  placeholder?: string;
  required?: boolean;
  className?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  labelLegend?: JSX.Element;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  validateOnBlur?: boolean;
  checkAvailability?: AvailabilityInfo;
  autoComplete?: string;
  readOnly?: boolean;
  additionalInfo?: string | JSX.Element;
  setValidationStatus?: (status: boolean) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  visiblePassword?: boolean;
  excludedValues?: string[];
}

const InputField = forwardRef((props: Props, ref: React.Ref<RefInputField>) => {
  const input = useRef<HTMLInputElement>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState(props.value || '');
  const [invalidText, setInvalidText] = useState(!isUndefined(props.invalidText) ? props.invalidText.default : '');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [activeType, setActiveType] = useState<string>(props.type);

  useImperativeHandle(ref, () => ({
    checkIsValid(): Promise<boolean> {
      return isValidField();
    },
    reset: () => {
      setInputValue('');
    },
    getValue(): string {
      return inputValue;
    },
    checkValidity(): boolean {
      return input.current!.checkValidity();
    },
    updateValue(newValue: string): void {
      setInputValue(newValue);
    },
  }));

  const checkValidity = (): boolean => {
    const isValid = input.current!.checkValidity();
    if (!isValid && !isUndefined(props.invalidText)) {
      let errorTxt = props.invalidText.default;
      const validityState: ValidityState | undefined = input.current?.validity;
      if (!isUndefined(validityState)) {
        if (validityState.typeMismatch && !isUndefined(props.invalidText.typeMismatch)) {
          errorTxt = props.invalidText.typeMismatch;
        } else if (validityState.tooShort && !isUndefined(props.invalidText.tooShort)) {
          errorTxt = props.invalidText.tooShort;
        } else if (validityState.patternMismatch && !isUndefined(props.invalidText.patternMismatch)) {
          errorTxt = props.invalidText.patternMismatch;
        } else if (validityState.typeMismatch && !isUndefined(props.invalidText.typeMismatch)) {
          errorTxt = props.invalidText.typeMismatch;
        } else if (validityState.customError && !isUndefined(props.invalidText.customError)) {
          if (!isUndefined(props.excludedValues) && props.excludedValues.includes(input.current!.value)) {
            errorTxt = props.invalidText.excluded;
          } else {
            errorTxt = props.invalidText.customError;
          }
        }
      }
      setInvalidText(errorTxt);
    }
    setIsValid(isValid);
    if (!isUndefined(props.setValidationStatus)) {
      props.setValidationStatus(false);
    }
    return isValid;
  };

  const isValidField = async (): Promise<boolean> => {
    const value = input.current!.value;
    if (value !== '') {
      if (!isUndefined(props.excludedValues) && props.excludedValues.includes(value)) {
        input.current!.setCustomValidity('Value is excluded');
      } else if (!isUndefined(props.checkAvailability) && !props.checkAvailability.excluded.includes(value)) {
        setIsCheckingAvailability(true);
        try {
          const isAvailable = await API.checkAvailability({
            resourceKind: props.checkAvailability.resourceKind,
            value: value,
          });
          if (!isNull(input.current)) {
            if (isAvailable) {
              input.current!.setCustomValidity(props.checkAvailability!.isAvailable ? 'Already taken' : '');
            } else {
              input.current!.setCustomValidity(props.checkAvailability!.isAvailable ? '' : 'Resource is not valid');
            }
          }
        } catch {
          if (!isNull(input.current)) {
            input.current!.setCustomValidity(props.checkAvailability!.isAvailable ? 'Already taken' : '');
          }
        }
        setIsCheckingAvailability(false);
      } else {
        if (!isNull(input.current)) {
          input.current!.setCustomValidity('');
        }
      }
    }

    return checkValidity();
  };

  const handleOnBlur = (): void => {
    if (!isUndefined(props.validateOnBlur) && props.validateOnBlur) {
      isValidField();
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
    if (!isUndefined(props.onChange)) {
      props.onChange(e);
    }
  };

  return (
    <div className={`form-group mb-4 position-relative ${props.className}`}>
      {!isUndefined(props.label) && (
        <label htmlFor={props.name} className={`font-weight-bold ${styles.label}`}>
          <span className="font-weight-bold">{props.label}</span>
          {!isUndefined(props.labelLegend) && <>{props.labelLegend}</>}
        </label>
      )}

      <input
        data-testid={`${props.name}Input`}
        ref={input}
        type={activeType}
        name={props.name}
        value={inputValue}
        className={classnames('form-control', { 'is-invalid': !isNull(isValid) && !isValid })}
        placeholder={props.placeholder}
        required={props.required}
        minLength={props.minLength}
        maxLength={props.maxLength}
        pattern={props.pattern}
        autoComplete={props.autoComplete}
        readOnly={props.readOnly || false}
        onChange={handleOnChange}
        onBlur={handleOnBlur}
        onKeyDown={props.onKeyDown}
        autoFocus={props.autoFocus}
        disabled={props.disabled}
        spellCheck="false"
      />

      {props.type === 'password' && props.visiblePassword && (
        <button
          type="button"
          className={classnames('btn btn-link position-absolute', styles.revealBtn, {
            'text-muted': activeType === 'password',
            'text-secondary': activeType !== 'password',
          })}
          onClick={() => setActiveType(activeType === 'password' ? 'text' : 'password')}
        >
          {activeType === 'password' ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}

      {isCheckingAvailability && (
        <div className={`position-absolute ${styles.spinner}`}>
          <span className="spinner-border spinner-border-sm text-primary" />
        </div>
      )}

      {!isUndefined(props.validText) && (
        <div className={`valid-feedback mt-0 ${styles.inputFeedback}`}>{props.validText}</div>
      )}

      {!isUndefined(invalidText) && (
        <div className={`invalid-feedback mt-0 ${styles.inputFeedback}`}>{invalidText}</div>
      )}

      {!isUndefined(props.additionalInfo) && <div className="alert p-0 mt-4">{props.additionalInfo}</div>}
    </div>
  );
});

export default InputField;
