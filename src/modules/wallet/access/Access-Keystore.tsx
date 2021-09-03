import 'styles/FormScreen.scss';
import { useState, ChangeEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { ToggleButton, Spinner } from 'components';
import * as u from 'utils';

export function AccessKeystore() {
  const history = useHistory();
  const pass = u.useWritableWithToggle("", false);
  const [keystore_file, set_keystore_file] = useState<File|null>(null);
  const [unlocking, set_unlocking] = useState<u.OPERATION>(u.OPERATION.INITIAL);

  function set_file(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      set_keystore_file(null);
      return;
    }

    let file = event.target.files.item(0);
    set_keystore_file(file);
  }

  async function unlock() {
    if (!keystore_file) { return; }

    set_unlocking(u.OPERATION.PENDING);

    let ks: Record<string, any>;
    try {
      ks = await u.read_json_file(keystore_file) as Record<string, any>;
    } catch {
      set_unlocking(u.OPERATION.INITIAL);
      return;
    }

    if (!ks) {
      set_unlocking(u.OPERATION.INITIAL);
      return;
    }

    let priv_wallet = await u.bc.get_account_from_keystore(ks, pass.value);
    if (priv_wallet == null) {
      set_unlocking(u.OPERATION.INITIAL);
      return;
    }

    set_unlocking(u.OPERATION.DONE);
    let w = u.g.create_user("My Wallet", "", priv_wallet);
    u.g.set_active_user(w);
    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Access Your Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Use a keystore file to access your wallet.
        </p>

        <label className="DropArea">
          <p>Drop your keystore file below or click to browse...</p>
          <input type="file" onChange={set_file}/>
        </label>

        <label>
          <p>Keystore Password</p>
          <input value={pass.value}
              type={pass.toggle_value ? "text" : "password"}
              onChange={pass.write}/>
          <ToggleButton hanging={true}
                     val={pass.toggle_value}
                     setval={pass.set_toggle}
                     alt_text="Toggle show password" />
        </label>

        <p></p>

        <Spinner op={unlocking}
                 children_initial={
                   <button className="Action"
                           disabled={!keystore_file || pass.value.length === 0}
                           onClick={unlock}>
                     Unlock
                   </button>}
                  />

        <p className="Alt">
          <Link className="Alt" to="/access">Go back</Link>
          or
          <Link className="Alt" to="/create">create a new wallet</Link>
        </p>

      </div>
    </div>
  )
}
