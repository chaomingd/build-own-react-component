import { listen } from '@/utils/dom';
import EventEmitter from '@/utils/EventEmitter';



const CONTROL_KEYS = ['control', 'meta', 'alt', 'alt', 'shift'];
function isControlKey(key: string) {
  return CONTROL_KEYS.some(k => key.startsWith(k));
}
export class ShortCutKeyManager extends EventEmitter {
  _keydownMap: Record<string, boolean> = {}
  dispose: () => any;

  constructor(target?: HTMLElement) {
    super();
    this._keydownMap = {}
    let triggered: Record<string, boolean> = {}
    function getAlphaFormCode(code: string) {
      if (code.startsWith('Key')) {
        return code.replace('Key', '');
      }
      return code;
    }

    const deleteTriggeredKeydown = (shortCutKey: string) => {
      const keys = shortCutKey.split('+');
      keys.forEach(key => {
        if (!isControlKey(key)) {
          delete this._keydownMap[key]
        }
      })
    }
    const dom = target ? target : document
    // @ts-ignore
    const unKeyDown = listen(dom, 'keydown', (e: KeyboardEvent) => {
      const key = getAlphaFormCode(e.code).toLowerCase();
      // console.log(key)
      this._keydownMap[key] = true;
      Object.keys(this._listeners).forEach(shortCutKey => {
        if (this.isShortCutKeyPress(shortCutKey) && !triggered[shortCutKey]) {
          this.emit(shortCutKey, e, shortCutKey);
          deleteTriggeredKeydown(shortCutKey);
          triggered[shortCutKey] = true;
        }
      })
    }, true)

    // @ts-ignore
    const unKeyUp = listen(document, 'keyup', (e: KeyboardEvent) => {
      const key = getAlphaFormCode(e.code).toLowerCase();
      delete this._keydownMap[key];
      if (isControlKey(key)) {
        this._keydownMap = {}
      }
      triggered = {};
    }, true)
    this.dispose = function() {
      unKeyDown();
      unKeyUp();
      this.offAllListeners();
    }
  }
  isShortCutKeyPress(shortCutKey: string) {
    const shortCutKeys = shortCutKey.split('+');
    return shortCutKeys.every(k => this._keydownMap[k]);
  }
}