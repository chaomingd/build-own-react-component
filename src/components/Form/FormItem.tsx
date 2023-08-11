import classNames from 'classnames';
import {
  Children,
  cloneElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { FormContext } from './FormContext';
import { FormItemProps } from './type';
import { fieldToString } from './utils';
import Transition, { useTransitionModel } from '../Transition';
import { ETransitionStatus } from '../Transition/type';

const FormItem = ({
  field,
  children,
  getInputValue,
  label,
  className,
  onChangeName,
  labelStyles,
  wrapperStyles,
  rules,
}: FormItemProps) => {
  const formInstance = useContext(FormContext);
  console.log('form item render', field)
  const fieldString = useMemo(() => {
    return fieldToString(field);
  }, [field]);
  const [fieldValue, { errorsMap }] = formInstance.useFormItemState(
    field,
    rules
  );
  const error = errorsMap[fieldString];
  const onValueChangeName = onChangeName || 'onInput';
  const renderChild =
    typeof children === 'function'
      ? children(fieldValue, formInstance)
      : Children.map(children, (child, index) => {
          if (index > 0) return child;
          if (!child) return child;
          if (typeof child !== 'object') return child;
          return cloneElement(child, {
            value: fieldValue,
            [onValueChangeName]: (e) => {
              let val: any;
              if (getInputValue) {
                val = getInputValue(e);
              } else {
                val = e?.target?.value;
              }
              child.props[onValueChangeName] &&
                child.props[onValueChangeName](e);
              if (field) {
                formInstance.onFieldChange(field, val);
              }
            },
          });
        });

  const transtionModel = useTransitionModel();
  const { status: transitionStatus } = transtionModel.useGetState();
  const errorMessageRef = useRef<string>();
  useEffect(() => {
    if (error) {
      errorMessageRef.current = error.message;
    }
  }, [error]);

  const hasForItemErrorClassName =
    transitionStatus !== ETransitionStatus.exited;
  return (
    <div
      className={classNames(
        'ks-form-item',
        hasForItemErrorClassName && 'ks-form-item-error',
        className
      )}
    >
      {label != undefined && (
        <label style={labelStyles} className="ks-form-item-label">
          {label}
        </label>
      )}
      <div style={wrapperStyles} className="ks-form-item-content">
        {renderChild}
        <Transition
          model={transtionModel}
          transitionName="fade-in"
          visible={!!error}
        >
          {(_, transitionClassName) => {
            return (
              <div
                className={classNames(
                  'ks-form-error-message',
                  transitionClassName
                )}
              >
                {errorMessageRef.current}
              </div>
            );
          }}
        </Transition>
      </div>
    </div>
  );
};

export default FormItem;
