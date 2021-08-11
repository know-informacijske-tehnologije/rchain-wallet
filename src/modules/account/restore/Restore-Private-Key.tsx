import 'styles/FormScreen.scss';
import { useState, ChangeEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { is_valid_private_key } from 'utils/blockchain';
import { set_local } from 'utils';

export function RestorePrivateKey() {
  const history = useHistory();
  const [private_key, set_private_key] = useState("");
  const [private_key_valid, set_private_key_valid] = useState(false);

  function handle_change(event: ChangeEvent<HTMLInputElement>) {
    let is_valid = null;

    try {
      is_valid = is_valid_private_key(event.target.value);
    } catch {
      is_valid = null;
    }

    let pkey = is_valid;
    if (!is_valid) {
      pkey = event.target.value;
    }
    set_private_key(pkey || "");
    set_private_key_valid(!!is_valid);
  }

  function finish() {
    if (private_key_valid) {
      set_local("private-key", private_key);
      history.push("/restore/account");
    }
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Restore Your Account</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Use a private key to restore your account.
        </p>

        <p className="Alt Left NoMargin LineNormal">
          &nbsp;Please enter your private key here:
        </p>
        <input value={private_key}
               onChange={handle_change}/>

        <button className="Action"
                disabled={!private_key_valid}
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
