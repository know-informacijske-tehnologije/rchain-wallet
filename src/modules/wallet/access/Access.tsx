import 'styles/FormScreen.scss';
import { Link, useHistory } from 'react-router-dom';
import * as Assets from 'assets';

export function Access() {
  let history = useHistory();

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Access Your Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt">
          Select a method to access your wallet.
        </p>

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

        <p className="Alt">
          Alternatively,
          <Link className="Alt" to="/access/local">access a locally stored wallet</Link>
          <br/>
          or
          <Link className="Alt" to="/create">create a new wallet</Link>
        </p>

      </div>
    </div>
  )
}
