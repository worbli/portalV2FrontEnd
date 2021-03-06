import {createMixin} from 'polymer-redux';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import store from '../global/store.js';
import '../css/shared-styles.js';
import '../components/data/wbi-api.js';
import '../components/identity/wbi-camsnap.js';
import '../components/identity/wbi-mobile.js';

const ReduxMixin = createMixin(store);
class WbiModal extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          --opacity: 0;
          --display-none-block: none;
          position: fixed; 
          display: var(--display-none-block);
          width: 100%; 
          height: 100%; 
          top: 0; 
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999; 
        }
        .overlay{
          opacity: var(--opacity);
          background-color: rgba(0, 0, 0, 0.5); 
          transition: opacity 0.2s ease-in-out;
          position: fixed; 
          display: block;
          width: 100%; 
          height: 100%; 
          top: 0; 
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 300; 
          cursor: pointer; 
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          min-width: 300px;
          padding: 40px;
          cursor: default;
          margin: 24px;
          padding: 40px;
          color: #50595E;
          border-radius: 3px;
          background-color: white;
          box-shadow: 0 12px 12px 0 rgba(0, 0, 0, 0.14), 
          0 1px 5px 0 rgba(0, 0, 0, 0.12), 
          0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
      </style>
      <div class="overlay" on-click="_hide">
        
      <template is="dom-if" if="{{mobile}}">
          <div class="modal" on-click="_clickModal">
            <wbi-mobile closenow="{{closenow}}"></wbi-mobile>   
          </div>
        </template>

        <template is="dom-if" if="{{document}}">
          <div class="modal" on-click="_clickModal">
            <wbi-camsnap file-name="[[fileName]]" stop-cam="[[stopCam]]" closenow="{{closenow}}"></wbi-camsnap>   
          </div>
        </template>

        <template is="dom-if" if="{{selfie}}">
          <div class="modal" on-click="_clickModal">
            <wbi-camsnap selfie file-name="[[fileName]]" stop-cam="[[stopCam]]" closenow="{{closenow}}"></wbi-camsnap>   
          </div>
        </template>

      </div>
    `;
  }

  static get properties() {
    return {
      language: {
        type: String,
        readOnly: true,
      },
      color: {
        type: Object,
        readOnly: true,
      },
      join: {
        type: Boolean,
        value: false,
      },
      login: {
        type: Boolean,
        value: false,
      },
      feedback: {
        type: Boolean,
        value: false,
      },
      turnoff: {
        type: Boolean,
        value: false,
      },
      closenow: {
        type: Boolean,
        value: false,
        observer: '_closenow',
      },
    };
  }

  static mapStateToProps(state, element) {
    return {
      language: state.language,
    };
  }

  ready() {
    super.ready();
    document.onkeydown = (evt) => {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        this._hide();
      }
    };
    window.addEventListener('modal', (e) => {
      this.language = e.detail.language;
      this.fileName = e.detail.fileName;
      this._show(e.detail.action);
    });
    window.addEventListener('hideModal', () => {
      this._hide();
    });
  }

  _show(e) {
    this.stopCam = false;
    this.updateStyles({'--display-none-block': 'block'});
    setTimeout(()=>{
      this.updateStyles({'--opacity': 1});
    }, 1);
    if (e === 'selfie') {
      this.document = false;
      this.mobile = false;
      this.selfie = true;
    } else if (e === 'mobile') {
      this.document = false;
      this.selfie = false;
      this.mobile = true;
    } else {
      this.document = true;
      this.selfie = false;
      this.mobile = false;
    }
  }

  _closenow() {
    if (this.closenow) {
      this._hide();
    }
  }

  _hide() {
    this.stopCam = true;
    setTimeout(() => {
      this.updateStyles({'--opacity': 0});
      this.updateStyles({'--display-none-block': 'none'});
      this.closenow = false;
    }, 1);
  }

  _clickModal(event) {
    event.stopPropagation();
  }
} window.customElements.define('wbi-modal', WbiModal);
