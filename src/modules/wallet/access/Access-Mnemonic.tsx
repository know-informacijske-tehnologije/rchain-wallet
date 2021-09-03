import 'styles/FormScreen.scss';
import { useState, ChangeEvent } from 'react';
import * as u from 'utils';
import { Link, useHistory } from 'react-router-dom';

function normalize_mnemonic(mnemonic: string) {
  let words = mnemonic.toLowerCase().match(/\w+/g);
  if (!words) { return ""; }
  return words.join(" ");
}

const get_account_from_mnemonic = u.memoize(u.bc.get_account_from_mnemonic);

export function AccessMnemonic() {
  const history = useHistory();
  const [wallet, set_wallet] = useState<u.PrivateWallet | null>(null);

  function handle_change(event: ChangeEvent<HTMLTextAreaElement>) {
    set_wallet(null);

    let mnemo = normalize_mnemonic(event.target.value);
    let is_valid = u.bc.is_valid_mnemonic(mnemo);
    if (!is_valid) { return; }

    set_wallet(get_account_from_mnemonic(mnemo));
  }

  function finish() {
    if (wallet == null) { return; }

    let w = u.g.create_user("My Wallet", "", wallet);
    u.g.set_active_user(w);

    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Access Your Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Use a mnemonic phrase to access your wallet.
        </p>

        <textarea className="BigFlat"
                  placeholder="Enter mnemonic phrase here"
                  onChange={handle_change}
                  rows={4} cols={35}>
        </textarea>

        <p className="Alt Smaller">
          A mnemonic phrase is a set of seed words that uniquely identify your wallet.
        </p>

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
