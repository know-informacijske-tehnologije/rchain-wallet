// @TODO: Move restore styles so they can be reused.
import 'styles/FormScreen.scss';
import { ToggleButton } from 'components';
import { g, useWritable, useWritableWithToggle } from 'utils';
import { Link, useHistory } from 'react-router-dom';

export function AccessLocal() {
  const history = useHistory();
  const name = useWritable("");
  const password = useWritableWithToggle("", false);

  function access() {
    let user_index = g.wallet_index(g.user_list, name.value);
    if (user_index === -1) {
      // @TODO: Show unlock failure message.
      console.error("Unlock failed! Wallet not found!");
      return;
    }

    let user = g.user_list[user_index];

    if (user.password !== password.value) {
      console.error("Unlock failed! Wrong password!");
      return;
    }

    g.set_active_user(user);
    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Access Locally Stored Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Unlock a wallet that you have previously locally stored in your browser
        </p>

        <label>
          <p>Wallet Name</p>
          <input value={name.value}
                 onChange={name.write} />
        </label>

        <label>
          <p>Password</p>
          <input value={password.value}
                 onChange={password.write}
                 type={password.toggle_value ? "text" : "password"}/>
          <ToggleButton hanging={true}
                     val={password.toggle_value}
                     setval={password.set_toggle}
                     alt_text="Toggle show password" />
        </label>

        <button className="Action"
                onClick={() => access()}>
          Unlock
        </button>

        <p className="Alt">
          Alternatively,
          <Link className="Alt" to="/access">
            access an existing wallet
          </Link>
          <br />
          or
          <Link className="Alt" to="/create">
            create a new wallet
          </Link>
        </p>

      </div>
    </div>
  )
}
