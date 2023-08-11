import { HTMLAttributes, ReactElement } from 'react';
import { Rule, ErrorItem, TSchema } from '@/utils/Validtor';
import { FormInstance } from './FormInstance';

export interface FormProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactElement | ReactElement[];
  rules?: TSchema;
  form?: FormInstance;
  onFormSubmit?: (formData: FormInstance['state']['formData'], formInstance: FormInstance) => any;
  onFormError?: (errors: ErrorItem[], formInstance: FormInstance) => any;
  onFieldChange?: (field: Field, value: any, formValues: FormInstance['state']['formData']) => any;
  onValuesChange?: (formValues: FormInstance['state']['formData']) => any;
}

export interface FormState {
  formData: any;
  errorsMap: Record<string, ErrorItem>;
  errors: ErrorItem[];
}

export type Field = string | number | Array<string | number> | undefined;

export interface FormItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  field?: Field;
  label?: string;
  children?: ReactElement | ReactElement[] | ((val: any, formInstance: FormInstance) => ReactElement | ReactElement[])
  getInputValue?: (...args: any[]) => any;
  onChangeName?: string;
  labelStyles?: React.CSSProperties;
  wrapperStyles?: React.CSSProperties;
  rules?: Rule[]
}
