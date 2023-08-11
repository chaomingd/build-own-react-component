import { Model } from './useModel';
import { TEqualityFn } from './type';

interface Models {
  [key: string]: Model<any, any, any>;
}

interface I_Store<M extends Models = Models> {
  models: M;
}
class Store<M extends Models = Models> {
  _store: I_Store<M>;
  registerModels(models: Partial<M>) {
    const store = this._getStore();
    Object.assign(store.models, models);
  }
  registerModel<Name extends keyof M>(name: Name, model: M[Name]) {
    const store = this._getStore();
    Object.assign(store.models, {
      [name]: model,
    });
  }
  getModel<Name extends keyof M>(name: Name): M[Name] {
    const store = this._getStore();
    const model = store.models[name];
    if (!model) {
      throw new Error(`未注册<${name as string}>数据模型，请调用registerModels方法注册数据模型`);
    }
    return model;
  }
  _getStore() {
    let store = this._store;
    if (!store) {
      store = { models: {} } as I_Store<M>;
      this._store = store;
    }
    return store;
  }
  useModel<Name extends keyof M>(name: Name, equalityFn?: TEqualityFn<M[Name]['state']>): [M[Name]['state'], M[Name]] {
    const model = this.getModel(name);
    return [model.useSelector(equalityFn)[0], model];
  }
}

export function createStore<M extends Models>() {
  const store = new Store<M>();
  return store;
}
