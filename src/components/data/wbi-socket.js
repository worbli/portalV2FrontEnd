import {createMixin} from 'polymer-redux';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import store from '../../global/store.js';
import '@polymer/app-route/app-location.js';

const ReduxMixin = createMixin(store);
class WbiSocket extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
      <app-location route="{{route}}" url-space-regex="^[[rootPath]]"></app-location>
    `;
  }

  static get properties() {
    return {
      env: {
        type: Object,
        readOnly: true,
      },
    };
  }

  static mapStateToProps(state, element) {
    return {
      language: state.language,
      mode: state.mode,
      color: state.color,
      env: state.env,
    };
  }
  ready() {
    super.ready();
    this._connect();
  }

  _connect() {
    const key = window.location.hostname.split('.')[0];
    let socketUrl = 'http://portal-api.localhost:9000/';
    if (window.location.hostname == 'portal.stage.worbli.io') {
      socketUrl = 'https://portal-api.stage.worbli.io/';
    } else if (window.location.hostname == 'portal.dev.worbli.io') {
      socketUrl = 'https://portal-api.dev.worbli.io/';
    } else if (key === 'dev' || key === '127') {
      socketUrl = 'https://dev-api.worbli.io/';
    } else if (key === 'uat') {
      socketUrl = 'https://uat-api.worbli.io/';
    } else if (key === 'portal') {
      socketUrl = 'https://portal-api.worbli.io/';
    } else if (key === 'portal-stage') {
      socketUrl = 'https://portal-api-stage.worbli.io/';
    };
    this.jwt = localStorage.getItem('jwt');
    this.socket = io(socketUrl, {
      query: `jwt=${this.jwt}`,
      transports: ['websocket', 'xhr-polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.socket.on('status', (response) => {
        this.dispatchAction({
          type: 'CHANGE_STATUS',
          status: response.status.status,
        });
        localStorage.setItem('status', response.status.status);
        localStorage.setItem('accountName', JSON.stringify(response.status.worbliAccountNames));
        if (response.status.worbliAccountNames.indexOf(null) != -1) {
          this.dispatchAction({
            type: 'CHANGE_NETWORK',
            network: 'available',
          });
          localStorage.setItem('network', 'available');
        } else {
          this.dispatchAction({
            type: 'CHANGE_NETWORK',
            network: 'claimed',
          });
          localStorage.setItem('network', 'claimed');
        }
      });
      this.socket.on('imageStatus', (response) => {
        this.dispatchAction({
          type: 'CHANGE_IMAGESTATUS',
          imagestatus: response,
        });
      });
      this.socket.on('disconnect', () => {
        console.log('DISCONNECTED');
      });
      this.socket.on('ON_CONNECT', (response) => {
        if (response.data === false && response.error === 'invalid token') {
          this.set('route.path', '/signin/jwtexpired');
        }
      });
    });
  }
} window.customElements.define('wbi-socket', WbiSocket);
