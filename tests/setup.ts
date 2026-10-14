import '@testing-library/jest-dom';

// Polyfill PointerEvent in JSDOM if missing
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    pointerId?: number;
    pointerType?: string;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId;
      this.pointerType = params.pointerType;
    }
  }
  window.PointerEvent = PointerEvent as any;
  global.PointerEvent = PointerEvent as any;
}
