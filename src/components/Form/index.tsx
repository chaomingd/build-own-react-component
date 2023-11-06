import { FormInstance } from './FormInstance';
import { FormContext } from './FormContext';
import { useCreation } from '@/hooks/useCreation';
import {FormProps} from './type'
import { useContext, useEffect } from 'react';
import FormItem from './FormItem';
import classNames from 'classnames';
import './index.scss';

const Form = ({ form, children, className, onValuesChange, onFieldChange, onFormSubmit, onFormError }: FormProps) => {
  const formInstance = useCreation(() => {
    return form || new FormInstance();
  });
  if (onFieldChange) {
    formInstance.setHooks({
      onFieldChange,
    })
  }
  if (onValuesChange) {
    formInstance.setHooks({
      onValuesChange,
    })
  }
  return (
    <FormContext.Provider value={formInstance}>
      <div className={classNames('sp-form', className)}>
        <form onSubmit={() => {
          const errors = formInstance.validate();
          if (!errors.length) {
            onFormSubmit && onFormSubmit(formInstance.getState().formData, formInstance)
          } else {
            onFormError && onFormError(errors, formInstance);
          }
        }}>
          {children}
        </form>
      </div>
    </FormContext.Provider>
  );
};

Form.useFormContext = () => {
  return useContext(FormContext);
}

Form.useForm = () => {
  return useCreation(() => new FormInstance())
}

Form.Item = FormItem;

export default Form;
