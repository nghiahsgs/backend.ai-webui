/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
// PWA components
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installRouter} from 'pwa-helpers/router.js';
import {store} from '../store.js';

import {navigate, updateOffline} from '../backend-ai-app.js';

import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/app-layout/app-layout';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/hardware-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-toast/paper-toast';

import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-scroll-effects/effects/blend-background';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';

import '../backend.ai-client-es6.js';

import {BackendAiStyles} from '../backend-ai-console-styles.js';
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from '../layout/iron-flex-layout-classes';
import '../backend-ai-offline-indicator.js';
import '../backend-ai-login.js';

//import '../backend-ai-summary-view.js';


class BackendAiConsole extends connect(store)(LitElement) {
  static get is() {
    return 'backend-ai-console';
  }

  static get properties() {
    return {
      menuTitle: {
        type: String
      },
      user_id: {
        type: String
      },
      api_endpoint: {
        type: String
      },
      is_connected: {
        type: Boolean
      },
      is_admin: {
        type: Boolean
      },
      _page: {type: String},
      _drawerOpened: {type: Boolean},
      _offlineIndicatorOpened: {type: Boolean},
      _offline: {type: Boolean}
    }
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.menuTitle = 'LOGIN REQUIRED';
    this.user_id = 'DISCONNECTED';
    this.api_endpoint = 'CLICK TO CONNECT';
    this.is_connected = false;
    this.is_admin = false;
    this._page = '';
  }

  firstUpdated() {
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      this.shadowRoot.querySelector('#login-panel').login();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('backend-ai-connected', this.refreshPage.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', this.refreshPage.bind(this));
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  refreshPage() {
    this.shadowRoot.getElementById('sign-button').icon = 'icons:exit-to-app';
    this.is_connected = true;
    if (window.backendaiclient != undefined && window.backendaiclient != null && window.backendaiclient.is_admin != undefined && window.backendaiclient.is_admin == true) {
      this.is_admin = true;
    } else {
      this.is_admin = false;
    }
    this._refreshUserInfoPanel();
    //this._loadPageElement();
  }

  _refreshUserInfoPanel() {
    this.user_id = window.backendaiclient.email;
    this.api_endpoint = window.backendaiclient._config.endpoint;
  }

  _loadPageElement() {
    if (this._page === 'index.html' || this._page === '') {
      this._page = 'summary';
      navigate(decodeURIComponent('/'));
    }
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      let view = this._page;
      // load data for view
      if (['summary', 'job', 'agent', 'credential', 'data'].includes(view) != true) { // Fallback for Windows OS
        view = view.split(/[\/]+/).pop();
        this._page = view;
      }
      switch (view) {
        case 'summary':
          this.menuTitle = 'Summary';
          this.shadowRoot.getElementById('sidebar-menu').selected = 0;
          break;
        case 'job':
          this.menuTitle = 'Sessions';
          this.shadowRoot.getElementById('sidebar-menu').selected = 1;
          break;
        case 'data':
          this.menuTitle = 'Data';
          this.shadowRoot.getElementById('sidebar-menu').selected = 3;
          break;
        case 'agent':
          this.menuTitle = 'Computation Resources';
          this.shadowRoot.getElementById('sidebar-menu').selected = 6;
          break;
        case 'credential':
          this.menuTitle = 'Credentials & Policies';
          this.shadowRoot.getElementById('sidebar-menu').selected = 7;
          break;
        case 'environment':
          this.menuTitle = 'Environments';
          this.shadowRoot.getElementById('sidebar-menu').selected = 8;
          break;
        default:
          this.menuTitle = 'LOGIN REQUIRED';
          this.shadowRoot.getElementById('sidebar-menu').selected = 0;
      }
    }
  }

  logout() {
    window.backendaiclient = null;
    const keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (/^(backendaiconsole\.)/.test(key)) localStorage.removeItem(key);
    }
    location.reload();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }
        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <app-drawer-layout id="app-body" responsive-width="900px" drawer-width="200px">
        <app-drawer swipe-open slot="drawer" class="drawer-menu">
          <app-header-layout has-scrolling-region class="vertical layout">
            <app-header id="portrait-bar" slot="header" effects="waterfall" fixed>
              <div class="horizontal center layout flex bar"
                   onclick="location.reload();" style="cursor:pointer;">
                <div class="portrait-canvas">
                  <iron-image width=43 height=43 style="width:43px; height:43px;" src="manifest/backend.ai-brand.svg"
                              sizing="contain"></iron-image>
                </div>
                <div class="vertical start-justified layout">
                  <span class="site-name"><span class="bold">backend</span>.AI</span>
                  <span class="site-name" style="font-size:13px;">console</span>
                </div>
                <span class="flex"></span>
              </div>
            </app-header>
            <paper-listbox id="sidebar-menu" class="sidebar list" selected="0">
              <a ?selected="${this._page === 'summary'}" href="/summary" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon id="activities-icon" class="fg orange" icon="icons:view-quilt"></iron-icon>
                  Summary
                </paper-item>
              </a>
              <a ?selected="${this._page === 'job'}" href="/job" tabindex="-1" role="menuitem">
                <paper-item link>
                  <iron-icon class="fg red" icon="icons:subject"></iron-icon>
                  Sessions
                </paper-item>
              </a>
                <paper-item disabled>
                  <iron-icon icon="icons:pageview"></iron-icon>
                  Experiments
                </paper-item>
                <a ?selected="${this._page === 'data'}" href="/data" tabindex="-1" role="menuitem">
                  <paper-item link>
                    <iron-icon class="fg lime" icon="vaadin:folder-open-o"></iron-icon>
                    Data
                  </paper-item>
                </a>
                <paper-item disabled>
                  <iron-icon icon="icons:assessment"></iron-icon>
                  Statistics
                </paper-item>
              ${this.is_admin ?
      html`
              <h4 style="font-size:10px;font-weight:100;border-top:1px solid #444;padding-top: 10px;padding-left:20px;">Administration</h4>

              <a ?selected="${this._page === 'agent'}" href="/agent" tabindex="-1" role="menuitem">
                <paper-item link ?disabled="${!this.is_admin}">
                  <iron-icon class="fg blue" icon="hardware:device-hub"></iron-icon>
                  Resources
                </paper-item>
              </a>` :
      html``}
              ${this.is_admin ?
      html`
  
                <a ?selected="${this._page === 'credential'}" href="/credential" tabindex="-1" role="menuitem">
                  <paper-item link ?disabled="${!this.is_admin}">
                    <iron-icon class="fg lime" icon="icons:fingerprint"></iron-icon>
                    Credentials
                  </paper-item>
                </a>` :
      html``}
              ${this.is_admin ?
      html`
                <a ?selected="${this._page === 'environment'}" href="/environment" tabindex="-1" role="menuitem">
                  <paper-item link>
                    <iron-icon class="fg orange" icon="icons:extension"></iron-icon>
                    Environments
                  </paper-item>
                </a>
                <a ?selected="${this._page === 'settings'}" tabindex="-1" role="menuitem">
                  <paper-item disabled>
                    <iron-icon icon="icons:settings"></iron-icon>
                    Settings
                    <span class="flex"></span>
                  </paper-item>
                </a>
                <a ?selected="${this._page === 'maintenance'}" tabindex="-1" role="menuitem"> 
                  <paper-item disabled>
                    <iron-icon icon="icons:build"></iron-icon>
                    Maintenance
                    <span class="flex"></span>
                  </paper-item>
                 </a>
` : html``}
                </paper-listbox>
                <footer>
                  <div class="terms-of-use" style="margin-bottom:50px;">
                    <small style="font-size:11px;">
                      <a href="https://cloud.backend.ai/@lablupinc/terms-of-service-payment">Terms of Service</a>
                      ·
                      <a href="https://cloud.backend.ai/@lablupinc/privacy-policy">Privacy Policy</a>
                    </small>
                  </div>
                </footer>
                <div id="sidebar-navbar-footer" class="vertical center center-justified layout">
                  <address>
                    <small class="sidebar-footer">GUI Console (Alpha)</small>
                    <small class="sidebar-footer" style="font-size:9px;">0.9.20190218</small>
                  </address>
                </div>
              </app-header-layout>
            </app-drawer>
            <app-header-layout main id="main-panel">
              <app-header slot="header" id="main-toolbar" condenses reveals
                          effects="waterfall blend-background"
                          effects-config='{"resize-snapped-title": {"startsAt": 0.8, "duration": "100ms"}, "parallax-background": {"scalar": 0.5}}'>
                <app-toolbar primary style="height:48px;" class="bar">
                  <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                  <span title id="main-panel-toolbar-title">${this.menuTitle}</span>
              <span class="flex"></span>
              <div style="vertical end-justified flex layout">
                <div style="font-size: 10px;text-align:right">${this.user_id}</div>
                <div style="font-size: 8px;text-align:right">${this.api_endpoint}</div>
              </div>
              <paper-icon-button id="sign-button" icon="icons:launch" @click="${this.logout}"></paper-icon-button>
            </app-toolbar>
          </app-header>
          <div class="content">
            <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
            <section role="main" id="content" class="container layout vertical center">
              <div id="app-page">
                <backend-ai-summary-view class="page" name="summary" ?active="${this._page === 'summary'}"></backend-ai-summary-view>
                <backend-ai-job-view class="page" name="job" ?active="${this._page === 'job'}"></backend-ai-job-view>
                <backend-ai-credential-view class="page" name="credential" ?active="${this._page === 'credential'}"></backend-ai-credential-view>
                <backend-ai-agent-view class="page" name="agent" ?active="${this._page === 'agent'}"></backend-ai-agent-view>
                <backend-ai-data-view class="page" name="data" ?active="${this._page === 'data'}"></backend-ai-data-view>
              </div>
            </section>
            <app-toolbar id="app-navbar-footer" style="height:45px;" class="bar layout flex horizontal">
              <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
              <paper-icon-button id="back-button" icon="icons:arrow-back"></paper-icon-button>
              <div id="lablup-notification-navbar" style="color: #999999; font-size:10px;"></div>
            </app-toolbar>
          </div>
        </app-header-layout>
      </app-drawer-layout>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        You are now ${this._offline ? 'offline' : 'online'}.
      </backend-ai-offline-indicator>
      <backend-ai-login id="login-panel"></backend-ai-login>
    `;
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._offlineIndicatorOpened = state.app.offlineIndicatorOpened;
    this._drawerOpened = state.app.drawerOpened;
  }
}

customElements.define(BackendAiConsole.is, BackendAiConsole);
