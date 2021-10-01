import 'styles/FormScreen.scss';
import { ToggleButton } from 'components';
import * as u from 'utils';
import { Link, useHistory } from 'react-router-dom';

const g = u.g;

export function AccessLocal() {
  const history = useHistory();
  const layout = u.useLayout();
  const name = u.useWritable("");
  const password = u.useWritableWithToggle("", false);

  function access() {
    if (!name.value) { return; }

    let user_index = g.wallet_index(g.user_list, name.value);
    if (user_index === -1) {
      layout.push_notif({
        group_id: "access-local-error",
        content: u.notif.info("Error", `No wallet named "${name.value}" exists!`)
      });
      return;
    }

    let user = g.user_list[user_index];

    if (user.password !== password.value) {
      layout.push_notif({
        group_id: "access-local-error",
        content: u.notif.info("Error", "Incorrect password!")
      });
      return;
    }

    g.set_active_user(user);
    history.push("/wallet/dash");
  }

  function handle_keypress(ev: any) {
    if (ev.nativeEvent.keyCode === 13) {
      access();
    }
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Access Locally Stored Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}} onKeyPress={handle_keypress}>
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
                disabled={!name.value}
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
