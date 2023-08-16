import { Model } from '@/hooks/react-store/useModel';
import { arrayToMap } from '@/utils/array';
import { getFieldsValue, objectToArray, setFiledsValue } from '@/utils/object';
import { Rule, Validator } from '@/utils/Validtor';
import { useEffect, useMemo } from 'react';
import { FormState, Field } from './type';
import { fieldToString, makeObject } from './utils';
import { plainClone } from '@/utils/plainClone';

interface IHooks {
  onFieldChange?: (field: Field, value: any, formValues: FormInstance['state']['formData']) => any;
  onValuesChange?: (formValues: FormInstance['state']['formData']) => any;
}

export class FormInstance extends Model<FormState> {
  validtor: Validator;
  hooks: IHooks = {};
  formItemRules: Record<string, Rule[]> = {};
  constructor() {
    super({
      state: {
        formData: null,
        errors: [],
        errorsMap: {},
      },
      computed: [
        {
          keys: ['errorsMap'],
          hander: ({ errorsMap }) => {
            return {
              errors: objectToArray(errorsMap, (item) => item.field),
            };
          },
        },
      ],
    });
    this.validtor = new Validator({});
  }
  setHooks(hooks: IHooks) {
    Object.assign(this.hooks, hooks);
  }
  clearFields(fields?: Field[]) {
    if (!fields) {
      this.setState({
        formData: {},
        errorsMap: {},
      });
    } else {
      let newFormData = plainClone(this.state.formData);
      const errorsMap = { ...this.state.errorsMap };
      fields.forEach((field) => {
        newFormData = makeObject(newFormData, field as any);
        setFiledsValue(newFormData, field, '');
        const fieldString = fieldToString(field);
        if (errorsMap[fieldString]) {
          delete errorsMap[fieldString];
        }
      });
      this.setState({
        formData: newFormData,
        errorsMap,
      });
    }
  }
  updateSchema(schema) {
    this.validtor.updateSchema(schema);
  }
  useFormItemState = (field: Field, rules?: Rule[]) => {
    const fieldString = useMemo(
      () => fieldToString(field) || undefined,
      [field]
    );
    useEffect(() => {
      if (fieldString !== undefined && rules) {
        this.formItemRules[fieldString] = rules;
      }
      return () => {
        if (fieldString) {
          delete this.formItemRules[fieldString]
        }
      }
    }, [fieldString, rules]);
    const state = this.useSelector((oldValues, nextValues) => {
      return getFieldsValue(oldValues.formData, field) !== getFieldsValue(nextValues.formData, field)
    }, fieldString);
    
    return [getFieldsValue(state.formData, field), state] as [any, FormState];
  };
  getFieldValue = (field: Field) => {
    return getFieldsValue(this.state.formData, field);
  };
  getFieldsValue = () => {
    return { ...this.state.formData };
  };
  setFieldsValue = (formData: Record<string, any>) => {
    const newFormData = plainClone(this.state.formData);
    Object.keys(formData).forEach((key) => {
      setFiledsValue(newFormData, key, formData[key]);
    })
    this.setState({
      formData: newFormData,
    });
    this.hooks.onValuesChange?.(this.state.formData);
  };
  setFieldValue = (field: Field, value: any) => {
    const newFormData = makeObject(plainClone(this.state.formData), field as any);
    setFiledsValue(newFormData, field, value);
    this.setState(
      {
        formData: newFormData,
      },
      {
        include: [fieldToString(field)],
      }
    );
    this.hooks.onValuesChange?.(newFormData);
  };
  validate = (fields?: Field[]) => {
    this.validtor.setSchema(this.formItemRules);
    const validateFields: string[] = [];
    if (fields) {
      fields.forEach((field) => {
        if (!field) return;
        validateFields.push(fieldToString(field));
      });
    }
    const errors = this.validtor.validate(this.state.formData, validateFields);
    const options: Record<string, any> = {};
    if (validateFields.length) {
      options.include = validateFields;
    }
    const newErrorMap = { ...this.state.errorsMap };
    if (validateFields.length) {
      const currentErrorMap = arrayToMap(errors, (item) => item.field);
      Object.assign(newErrorMap, currentErrorMap);
      for (let i = 0; i < validateFields.length; i++) {
        if (!currentErrorMap[validateFields[i]]) {
          if (newErrorMap[validateFields[i]]) {
            delete newErrorMap[validateFields[i]];
          }
        }
      }
    }
    this.setState(
      {
        errorsMap: newErrorMap,
      },
      options
    );
    return errors;
  };
  onFieldChange = (field: Field, value) => {
    const newFormData = makeObject(plainClone(this.state.formData), field as any);
    setFiledsValue(newFormData, field, value);
    this.setState(
      {
        formData: newFormData,
      },
      {
        include: [fieldToString(field)],
        silent: true,
      }
    );
    this.validate([field]);
    this.hooks.onFieldChange?.(field, value, newFormData);
    this.hooks.onValuesChange?.(newFormData);
  };
}
