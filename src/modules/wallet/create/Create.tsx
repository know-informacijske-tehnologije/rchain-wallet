import 'styles/FormScreen.scss';
import { Link, useHistory } from 'react-router-dom';
import * as Assets from 'assets';

export function Create() {
  let history = useHistory();

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Create a New Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt">
          Select method of access for your new wallet.
        </p>

        <button className="BigFlat" onClick={()=>history.push("/create/keystore")}>
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

        <button className="BigFlat" onClick={()=>history.push("/create/mnemonic")}>
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

        <p className="Alt">
          Alternatively,
          <Link className="Alt" to="/access">access an existing wallet</Link>
        </p>
      </div>
    </div>
  )
}
