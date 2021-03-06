import {createMixin} from 'polymer-redux';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {translations} from '../translations/languages.js';
import '@polymer/app-route/app-location.js';
import '../css/shared-styles.js';
import '../components/layouts/wbi-center.js';
import '../components/data/wbi-api.js';
import store from '../global/store.js';
const ReduxMixin = createMixin(store);

class WbiJoin extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
        }
        img {
          display: block;
          width: 150px;
          margin: 0 auto;
          padding-bottom: 24px;
        }
        h2 {
          display: block;
          text-align: center;
          color: #2B2C54;
          font-weight: 400;
          font-size: 24px;
        }
        .already {
          font-size: 14px;
          display: block;
          text-align: center;
          height: 48px;
          line-height: 48px;
          margin-top: 12px;
        }
        .already a {
          color: #356327;
        }
        .bottom{
          display: flex;
          position: relative;
          bottom: -90px;
        }
        ul {
          flex: 1;
          margin: 0px;
          padding: 0px;
        }
        .bottom a{
          color: #356327;
          text-decoration: none;
          font-size: 14px;
          margin-top: 12px;
        }
        .bottom li {
          list-style: none;
          text-transform: capitalize;
        }
        .green-bg{
          background-color: var(--active-color, #50595E);
        }
        .language-icon{
          position: absolute;
          width: 20px;
          left: -27px;
          top: -2px;
        }
        .error {
          padding: 12px 12px;
        }
        a {
          color: #31652A;
        }
        @media only screen and (max-width: 600px) {
          .card {
            border-radius: 0px;
          }
        }

      </style>
      <app-location route="{{route}}" url-space-regex="^[[rootPath]]"></app-location>
      <wbi-api id='api'></wbi-api>
      <wbi-center>
        <div class="card">
        <img src="./images/worbli.png" alt="[[txt.worbli]]">
          <hr>
          <h2>[[txt.join]]</h2>
          <label for="email">[[txt.emailAddress]]</label>
          <input type="text" name="email" id="email" value="{{email::input}}" on-keyup="_email">
          <label for="password">[[txt.password]]</label>
          <input type="password" name="password" id="password" value="{{password::input}}" on-keyup="_password">
          <label for="repeat_password">[[txt.repeatPassword]]</label>
          <input type="password" name="repeat_password" id="repeat_password" value="{{repeat_password::input}}" on-keyup="_repeatPassword">
          <label for="agree">
          <input type="checkbox" name="terms" id="terms" value="{{terms::input}}" on-change="_termsCheckbox">[[txt.iAgreeToThe]] <a href="/terms/" target="_blank">[[txt.termsAndPrivacyPolicy]]</a></label>
          <label for="optIn">
          <input type="checkbox" name="optIn" id="optIn" value="{{optIn::input}}" on-change="_optInCheckbox">[[txt.optInMarketing]]</label>
          <button type="button" class="green-bg" on-click="_join">[[txt.join]]</button>
          <p class="already">[[txt.alreadyOnWorbli]] <a on-click="_signIn"> [[txt.signIn]]</a></p>
          <template is="dom-if" if="{{error}}">
            <p class="error">[[error]]</p>
          </template>

          <template is="dom-if" if="[[resend]]">
            <br/><br/>
            <button type="button" class="green-bg" on-click="_resend">[[txt.resendVerificationEmail]]</button>
          </template>

          <div class="bottom">
            <ul><li><img src="./images/language-icon.svg" class="language-icon" alt="[[Change Language]]">[[txt.language]]</li></ul>
            <span><a href="http://www.worbli.io">[[txt.backToWorbli]]</a></span>
          </div>
        </div>
      </wbi-center>
    `;
  }

  static get properties() {
    return {
      env: {
        type: Object,
        readOnly: true,
      },
      language: {
        type: String,
        readOnly: true,
        observer: '_language',
      },
      mode: {
        type: String,
        readOnly: true,
      },
      color: {
        type: Object,
        readOnly: true,
      },
      focus: {
        type: Boolean,
        value: true,
        observer: '_focusEmail',
      },
      resend: {
        type: Boolean,
        value: false,
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
  _validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  _validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*\d|.*[!@#\$%\^&\*])(?=.*[A-Z])(?:.{8,})$/;
    return re.test(password);
  }
  _focusEmail() {
    setTimeout(() => {
      this.shadowRoot.querySelector('#email').focus();
    }, 0);
  }
  _email(e) {
    this._isComplete();
    if (e.keyCode === 13) {
      this.shadowRoot.querySelector('#password').focus();
    }
  }
  _password(e) {
    this._isComplete();
    if (e.keyCode === 13) {
      this.shadowRoot.querySelector('#repeat_password').focus();
    }
  }
  _repeatPassword(e) {
    this._isComplete();
    if (e.keyCode === 13) {
      this.shadowRoot.querySelector('#agree').focus();
    }
  }
  _termsCheckbox() {
    if (this.termsValue == undefined) {
      this.termsValue = true;
    } else {
      this.termsValue = !this.termsValue;
    };
    this._isComplete();
  }
  _optInCheckbox() {
    if (this.optInValue == undefined) {
      this.optInValue = true;
    } else {
      this.optInValue = !this.optInValue;
    }
  }
  _language(e) {
    this.txt = translations[this.language];
  }
  _isComplete() {
    if (this._validateEmail(this.email) && this._validatePassword(this.password) && this._validatePassword(this.repeat_password) && this.termsValue && this.password === this.repeat_password) {
      this.updateStyles({'--active-color': '#356327'});
      return true;
    } else {
      this.updateStyles({'--active-color': '#50595E'});
      return false;
    }
  }
  _signIn() {
    this.set('route.path', '/signin');
  }
  _join() {
    if (this._isComplete()) {
      this.error = '';
      this.resend = false;
      this.$.api.join(this.email, this.password, this.termsValue, this.optInValue)
          .then((response) => {
            if (response && response.data === false && response.error) {
              this.error = response.error;
              if (response.resend) {
                this.resend = true;
              }
            } else {
              localStorage.setItem('email', this.email);
              this.dispatchAction({
                type: 'CHANGE_EMAIL',
                email: this.email,
              });
              this.set('route.path', '/sent');
            }
          });
    } else {
      this.error = '';
      if (!this._validateEmail(this.email)) {
        this.error = this.txt.invalidEmailAddress;
      }
      if (!this._validatePassword(this.password)) {
        this.error = this.txt.passwordIsNotStrongEnough;
      }
      if (this.password !== this.repeat_password) {
        this.error = this.txt.passwordsDoNotMatch;
      }
      if (!this.termsValue) {
        this.error = this.txt.mustAgreeToTerms;
      }
    }
  }
  _resend() {
    this.error = '';
    this.$.api.resend(this.email)
        .then((response) => {
          if (response && response.data === false && response.error) {
            this.error = response.error.replace(/['"]+/g, '');
          };
        });
  }
} window.customElements.define('wbi-join', WbiJoin);
