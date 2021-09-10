import 'styles/FormScreen.scss';
import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import * as Assets from 'assets';
import { ethDetected } from '@tgrospic/rnode-http-js';
import * as u from 'utils';

export function Access() {
  let layout = u.useLayout();
  let history = useHistory();
  let has_metamask = ethDetected;
  let [waiting, set_waiting] = useState(false);

  async function metamask_access() {
    set_waiting(true);

    let wallet = await u.bc.get_account_from_metamask();
    if (!wallet) {
      layout.push_notif({
        group_id: "access-metamask-error",
        content: u.notif.info("Error", "Failed to access MetaMask wallet.")
       });
      set_waiting(false);
      return
    }

    let user = u.g.create_user_metamask(wallet);
    u.g.set_active_user(user);
    set_waiting(false);
    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X Scroll-Hidden">
      <h2 className="Alt">Access Your Wallet</h2>
      <p className="Alt">
        Select a method to access your wallet.
      </p>

      <div className="Column Center-X Scroll-Auto" style={{width: "min-content"}}>
        { has_metamask ?
          <button className="BigFlat"
                  onClick={metamask_access}
                  disabled={waiting}>
            <div className="Row Center-Y">
              <img src={Assets.metamask} alt=""/>
              <div className="Column">
                <h3>MetaMask</h3>
                <p className="Alt">
                  Use the MetaMask extension to access your wallet
                </p>
              </div>
            </div>
          </button>
        : null}

        <button className="BigFlat" onClick={()=>history.push("/access/keystore")}>
          <div className="Row Center-Y">
            <img src={Assets.keystore} alt=""/>
            <div className="Column">
              <h3>Keystore File</h3>
              <p className="Alt">
                Use a keystore file to access your wallet
              </p>
            </div>
          </div>
        </button>

        <button className="BigFlat" onClick={()=>history.push("/access/mnemonic")}>
          <div className="Row Center-Y">
            <img src={Assets.bubble} alt=""/>
            <div className="Column">
              <h3>Mnemonic Phrase</h3>
              <p className="Alt">
                Use a mnemonic phrase to access your wallet
              </p>
            </div>
          </div>
        </button>

        { u.g.user_list.length > 0 ?
          <button className="BigFlat" onClick={()=>history.push("/access/local")}>
            <div className="Row Center-Y">
              <img src={Assets.localpass} alt=""/>
              <div className="Column">
                <h3>Stored wallet</h3>
                <p className="Alt">
                  Access your locally stored wallets
                </p>
              </div>
            </div>
          </button>
        : null}

        <button className="BigFlat" onClick={()=>history.push("/access/private-key")}>
          <div className="Row Center-Y">
            <img src={Assets.key} alt=""/>
            <div className="Column">
              <h3>Private Key</h3>
              <p className="Alt">
                Use a private key to access your wallet
              </p>
            </div>
          </div>
        </button>

      </div>

      <p className="Alt">
        or
        <Link className="Alt" to="/create">create a new wallet</Link>
      </p>

    </div>
  )
}
