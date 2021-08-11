import 'styles/FormScreen.scss';
import { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { g } from 'utils';
import * as Assets from 'assets';

export function Restore() {
  let history = useHistory();

  useEffect(() => {
    g.cancel_restore_account(history);
  }, [history]);

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Restore Your Account</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt">
          Use a private key or a mnemonic phrase to restore your account.
        </p>

        <button className="BigFlat" onClick={()=>history.push("/restore/private-key")}>
          <div className="Row Center-Y">
            <img src={Assets.key} alt="key"/>
            <div className="Column">
              <h3>Private Key</h3>
              <p className="Alt">
                Use a private key to restore your account
              </p>
            </div>
          </div>
        </button>

        <button className="BigFlat" onClick={()=>history.push("/restore/mnemonic")}>
          <div className="Row Center-Y">
            <img src={Assets.bubble} alt="key"/>
            <div className="Column">
              <h3>Mnemonic Phrase</h3>
              <p className="Alt">
                Use a mnemonic phrase to restore your account
              </p>
            </div>
          </div>
        </button>

        <p className="Alt">
          <Link className="Alt" to="/login">Log in</Link>
          or
          <Link className="Alt" to="/create">create a new account</Link>
        </p>

      </div>
    </div>
  )
}
