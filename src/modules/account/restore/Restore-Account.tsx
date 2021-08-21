import 'styles/FormScreen.scss';
import { bc, g } from 'utils';
import { Link, useHistory } from 'react-router-dom';
import { AccountDetailsForm, useAccountDetails } from 'components';

export function RestoreAccount() {
  const history = useHistory();
  const form_state = useAccountDetails();
  const {username, password1, registration_valid} = form_state;

  function restore() {
    const account_data = bc.get_restore_account();

    if (account_data === null) {
      // @TODO: Show message (unable to restore).
      console.error("Unable to restore account data!");
      return;
    }

    const user = g.create_user(username.value, password1.value, account_data);
    g.add_user(user);
    g.set_active_user(user);
    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Restore Your Account</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>

        <AccountDetailsForm state={form_state} />

        <button className="Action"
                disabled={!registration_valid}
                onClick={restore}>
          Register
        </button>

        <p style={{marginTop: 0}}>
          <Link className="Alt" to="/restore">
            Go back
          </Link>
        </p>

        <p className="Alt">
          <Link className="Alt" to="/">Sign in</Link>
          or
          <Link className="Alt" to="/">create a new account</Link>
        </p>

      </div>
    </div>
  )
}
