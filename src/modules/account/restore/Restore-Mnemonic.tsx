import 'styles/FormScreen.scss';
import { useState, ChangeEvent } from 'react';
import { is_valid_mnemonic } from 'utils/blockchain';
import { set_local } from 'utils/utils';
import { Link, useHistory } from 'react-router-dom';

// MNEMONIC FOR TESTING:
// wrestle unique upgrade machine flag few code trade habit possible extra ice hole canoe rural

function normalize_mnemonic(mnemonic: string) {
  return mnemonic.trim().replace(/\s+/g, " ");
}

export function RestoreMnemonic() {
  const history = useHistory();
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicValid, setMnemonicValid] = useState(false);

  function handle_change(event: ChangeEvent<HTMLTextAreaElement>) {
    let mnemo = event.target.value;
    setMnemonic(mnemo);
    mnemo = normalize_mnemonic(mnemo);
    let is_valid = is_valid_mnemonic(mnemo);
    setMnemonicValid(is_valid);
  }

  function finish() {
    set_local('mnemonic', normalize_mnemonic(mnemonic));
    history.push("/restore/account");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Restore Your Account</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Use a mnemonic phrase to restore your account.
        </p>

        <textarea className="BigFlat"
                  placeholder="Enter *mnemonic phrase here"
                  value={mnemonic}
                  onChange={handle_change}
                  rows={4} cols={35}>
        </textarea>

        <p className="Alt Smaller">
          *Mnemonic phrase is the seed words which you are keeping as backup, the words should be separated by single space.
        </p>

        <button className="Action"
                disabled={!mnemonicValid}
                onClick={finish}>
          Continue
        </button>

        <p style={{marginTop: 0}}><Link className="Alt" to="/restore">Go back</Link></p>

        <p className="Alt">
          <Link className="Alt" to="/">Sign in</Link>
          or
          <Link className="Alt" to="/">create a new account</Link>
        </p>

      </div>
    </div>
  )
}
