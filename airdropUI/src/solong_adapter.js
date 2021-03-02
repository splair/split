import EventEmitter from 'eventemitter3';
import { PublicKey } from '@solana/web3.js';

export class SolongAdapter extends EventEmitter {
  _publicKey
  _onProcess
  constructor(providerUrl, network) {
    super()
    this._publicKey = null;
    this._onProcess = false;
    this.connect= this.connect.bind(this);
  }

  get publicKey() {
    return this._publicKey;
  }

  async signTransaction(transaction) {
    return window.solong.signTransaction(transaction);
  }

  connect() {
    if (this._onProcess) {
      return ;
    }

    if (window.solong === undefined){
      return;
    }

    this._onProcess = true;
    console.log('solong helper select account');
    window.solong
      .selectAccount()
      .then((account) => {
        this._publicKey = new PublicKey(account);
        console.log('window solong select:', account, 'this:', this);
        this.emit('connect', this._publicKey);
      })
      .catch(() => {
        this.disconnect()
      })
      .finally(()=>{this._onProcess=false});
  }

  disconnect (){
    if (this._publicKey) {
      this._publicKey = null;
      this.emit('disconnect');
    }
  }
}