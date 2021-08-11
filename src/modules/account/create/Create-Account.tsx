// @TODO: Move restore styles so they can be reused.
import 'styles/FormScreen.scss';
import { bc, g } from 'utils';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AccountDetailsForm, useAccountDetails } from 'components';

export function CreateAccount() {
  const history = useHistory();
  const form_state = useAccountDetails();
  const {username, password1, registration_valid} = form_state;

  function register() {
    const mnemonic = bc.generate_mnemonic();
    const account_data = bc.get_account_from_mnemonic(mnemonic);

    if (account_data === null) {
      // @TODO: Show message.
      console.error("Unable to get account data from generated mnemonic.");
      return;
    }

    const user = g.create_user(username.value, password1.value, account_data);
    g.add_user(user);
    g.set_active_user(user);
    history.push("/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Create New Account</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Sign up for a free account below or
          <Link className="Alt" to="/restore">restore your account</Link>
          from backup
        </p>

        <AccountDetailsForm state={form_state} />

        <p className="Alt">
          By clicking the "REGISTER" button below, you agree to the
          {/* @TODO: Add link to TOS */}
          <Link className="Alt" to="/">Terms of Service</Link>.
        </p>

        <button className="Action"
                onClick={() => register()}
                disabled={!registration_valid}>
          Register
        </button>

        <p className="Alt">
          {/* @TODO: Don't show this if there are no saved accounts */}
          Or
          <Link className="Alt" to="/login">log in</Link>
          with a saved account
        </p>

      </div>
    </div>
  )
}
