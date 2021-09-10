import 'styles/FormScreen.scss';
import { useState, ChangeEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import * as u from 'utils';

export function AccessPrivateKey() {
  const history = useHistory();
  const layout = u.useLayout();
  const [wallet, set_wallet] = useState<u.PrivateWallet | null>(null);

  function handle_change(event: ChangeEvent<HTMLInputElement>) {
    set_wallet(null);

    let pkey = u.bc.is_valid_private_key(event.target.value);
    if (!pkey) { return; }

    set_wallet(u.bc.get_account_from_private_key(pkey));
  }

  function finish() {
    if (!wallet) {
      layout.push_notif({
        group_id: "access-pkey-error",
        content: u.notif.info("Error", "Failed to access wallet. Private key might be invalid.")
      });

      return;
    }

    let w = u.g.create_user("My Wallet", "", wallet);
    u.g.set_active_user(w);

    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Access Your Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Use a private key to access your wallet.
        </p>

        <p className="Alt Left NoMargin LineNormal">
          &nbsp;Please enter your private key here:
        </p>
        <input onChange={handle_change}/>

        <button className="Action"
                disabled={!wallet}
                onClick={finish}>
          Continue
        </button>

        <p className="Alt">
          <Link className="Alt" to="/access">Go back</Link>
          or
          <Link className="Alt" to="/">create a new wallet</Link>
        </p>

      </div>
    </div>
  )
}
