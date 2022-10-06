/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {translate as _t} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import '@material/mwc-tab-bar';
import '@material/mwc-tab';

import './lablup-activity-panel';
import './backend-ai-agent-list';
import './backend-ai-storage-proxy-list';
import './backend-ai-resource-group-list';

import './backend-ai-window';

import {BackendAiStyles} from './backend-ai-general-styles';

type Status = 'active' | 'inactive';
type Tab = 'running-lists' | 'terminated-lists' | 'storage-proxy-lists' | 'scaling-group-lists';

/**
 Backend.AI Agent view page

 Example:

 <backend-ai-agent-view active=true>
 ... content ...
 </backend-ai-agent-view>

@group Backend.AI Web UI
 @element backend-ai-agent-view
 */

@customElement('backend-ai-agent-view')
export default class BackendAIAgentView extends BackendAIPage {
  @state() _status: Status = 'inactive';
  @state() _tab: Tab = 'running-lists';
  @state() enableStorageProxy = false;

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      // language=CSS
      css`
        h3.tab {
          background-color: var(--general-tabbar-background-color);
          /*border-radius: 5px 5px 0 0;*/
          border-radius: 0;
          margin: 0 auto;
        }

        mwc-tab-bar {
          --mdc-theme-primary: var(--general-sidebar-selected-color);
          --mdc-text-transform: none;
          --mdc-tab-color-default: var(--general-tabbar-background-color);
          --mdc-tab-text-label-color-default: var(--general-tabbar-tab-disabled-color);
        }

        @media screen and (max-width: 805px) {
          mwc-tab {
            --mdc-typography-button-font-size: 10px;
          }
        }
      `];
  }

  firstUpdated() {
    super.firstUpdated();
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.enableStorageProxy = globalThis.backendaiclient.supports('storage-proxy');
      }, true);
    } else {
      this.enableStorageProxy = globalThis.backendaiclient.supports('storage-proxy');
    }
  }

  /**
   * Change agent's backend.ai running state.
   *
   * @param {Boolean} active
   */
  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (!active) {
      (this.shadowRoot?.querySelector('#running-agents') as BackendAIPage).active = false;
      (this.shadowRoot?.querySelector('#terminated-agents') as BackendAIPage).active = false;
      (this.shadowRoot?.querySelector('#scaling-groups') as BackendAIPage).active = false;
      this._status = 'inactive';
      return;
    }
    (this.shadowRoot?.querySelector('#running-agents') as BackendAIPage).active = true;
    (this.shadowRoot?.querySelector('#terminated-agents') as BackendAIPage).active = true;
    (this.shadowRoot?.querySelector('#scaling-groups') as BackendAIPage).active = false;
    this._status = 'active';
  }

  /**
   * Display the tab.
   *
   * @param {mwc-tab} tab
   */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll<HTMLElement>('.tab-content') as NodeListOf<HTMLElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (this.shadowRoot?.querySelector('#' + tab.title) as HTMLElement).style.display = 'block';
    this._tab = tab.title;
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-window defaultWidth="80%" active="${this.active}" title="${_t('webui.menu.ComputationResources')}" name="agent"
                             icon="resources/menu_icons/agent.svg">
      <lablup-activity-panel noheader narrow autowidth attachInner>
        <div slot="message">
          <h3 class="tab horizontal center layout">
            <mwc-tab-bar>
              <mwc-tab title="running-lists" label="${_t('agent.Connected')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <mwc-tab title="terminated-lists" label="${_t('agent.Terminated')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
              <!--<mwc-tab title="maintenance-lists" label="${_t('agent.Maintaining')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>-->
              ${this.enableStorageProxy ? html`
              <mwc-tab title="storage-proxy-lists" label="${_t('general.StorageProxies')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>`:html``}
              <mwc-tab title="scaling-group-lists" label="${_t('general.ResourceGroup')}"
                  @click="${(e) => this._showTab(e.target)}"></mwc-tab>
            </mwc-tab-bar>
            <div class="flex"></div>
          </h3>
          <div id="running-lists" class="tab-content">
            <backend-ai-agent-list id="running-agents" condition="running" ?active="${this._status === 'active' && this._tab === 'running-lists'}"></backend-ai-agent-list>
          </div>
          <div id="terminated-lists" class="tab-content" style="display:none;">
            <backend-ai-agent-list id="terminated-agents" condition="terminated" ?active="${this._status === 'active' && this._tab === 'terminated-lists'}"></backend-ai-agent-list>
          </div>
          ${this.enableStorageProxy ? html`
          <div id="storage-proxy-lists" class="tab-content" style="display:none;">
            <backend-ai-storage-proxy-list id="storage-proxies" ?active="${this._status === 'active' && this._tab === 'storage-proxy-lists'}"></backend-ai-storage-proxy-list>
          </div>` : html``}
          <div id="scaling-group-lists" class="tab-content" style="display:none;">
            <backend-ai-resource-group-list id="scaling-groups" ?active="${this._status === 'active' && this._tab === 'scaling-group-lists'}"> </backend-ai-resource-group-list>
          </div>
        </div>
      </lablup-activity-panel>
      </backend-ai-window>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-agent-view': BackendAIAgentView;
  }
}
