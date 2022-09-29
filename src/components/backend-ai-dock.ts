/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {LitElement, CSSResultGroup, html, css} from 'lit';
import {customElement, state, property, query} from 'lit/decorators.js';
import BackendAIWindow from './backend-ai-window';
import {BackendAiStyles} from './backend-ai-general-styles';

/**
 Backend AI Dock

 @group Backend.AI Web UI
 @element backend-ai-dock
 */
@customElement('backend-ai-dock')
export default class BackendAIDock extends LitElement {
  @state() protected windows : Record<string, BackendAIWindow> = {};
  @property({type: Boolean, reflect: true}) active = false;
  @query('#dock') dock!: HTMLDivElement;

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      // language=CSS
      css`
        #dock {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          color: #efefef;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border-radius: 15px;
          box-shadow: rgba(0, 0, 0, 0.25) 0 14px 28px, rgba(0, 0, 0, 0.22) 0 10px 10px;
          position:absolute;
          right: 10px;
          bottom: 10px;
          height: 80px;
          width: 10px;
          overflow: hidden;
          z-index: 9999;
        }

        mwc-icon-button {
          --mdc-icon-size: 48px;
          --mdc-icon-button-size: 64px;
          padding: 8px;
        }

        mwc-icon-button[isTop]:after {
          content: '';
          width: 4px;
          position: absolute;
          top: 70px;
          right: 38px;
          height: 4px;
          border-radius: 2px;
          background-color: var(--general-sidebar-selected-color,#72EB51);
          z-index:10000;
        }
      `]
  };

  firstUpdated() {
    this.active = true;
    // @ts-ignore
    document.addEventListener('backend-ai-window-reorder', () => {
      this.updateDockWidth();
    });
    // @ts-ignore
    document.addEventListener('backend-ai-window-removed', () => {
      this.updateDockWidth();
    });
  }
  updateDockWidth() {
    let count = 0;
    globalThis.backendaiwindowmanager.zOrder.forEach(name => {
      if (globalThis.backendaiwindowmanager.windows[name]?.icon) {
        count = count + 1;
      }
    });
    this.dock.style.width = (count * 80) + 'px';
    this.requestUpdate();
  }

  setToTop(name) {
    globalThis.backendaiwindowmanager.windows[name].setToTop();
    globalThis.backendaiwindowmanager.windows[name].show_window();
  }

  render() {
    // language=HTML
    return html`
      <div id="dock" class="dock">
        ${globalThis.backendaiwindowmanager.zOrder.map(name =>
          globalThis.backendaiwindowmanager.windows[name]?.icon ?
            globalThis.backendaiwindowmanager.windows[name].icon.includes('/') ?
               html`<mwc-icon-button area-label="${globalThis.backendaiwindowmanager.windows[name].title}"
                                     @click="${()=>{this.setToTop(name)}}"
                                     ?isTop=${globalThis.backendaiwindowmanager.windows[name].isTop}><img src="${globalThis.backendaiwindowmanager.windows[name].icon}" />
               </mwc-icon-button>`:
               html`<mwc-icon-button area-label="${globalThis.backendaiwindowmanager.windows[name].title}"
                                     @click="${()=>{this.setToTop(name)}}"
                                     icon="${globalThis.backendaiwindowmanager.windows[name].icon}"></mwc-icon-button>`
            : html ``)};
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-dock': BackendAIDock;
  }
}
