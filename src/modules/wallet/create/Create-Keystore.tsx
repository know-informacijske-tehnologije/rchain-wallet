// @TODO: Move restore styles so they can be reused.
import 'styles/FormScreen.scss';
import { bc, g } from 'utils';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { WalletLockForm, useWalletLock } from 'components';

export function CreateKeystore() {
  const history = useHistory();
  const form_state = useWalletLock();
  const {name, password1, registration_valid} = form_state;

  function register() {
    const mnemonic = bc.generate_mnemonic();
    const account_data = bc.get_account_from_mnemonic(mnemonic);

    if (account_data === null) {
      // @TODO: Show message.
      console.error("Unable to get wallet data from generated mnemonic.");
      return;
    }

    const user = g.create_user(name.value, password1.value, account_data);
    if (!g.add_user(user)) {
      // @TODO: Show message?
      console.error("User with this wallet/name already exists.");
      return;
    }
    g.set_active_user(user);
    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Create a New Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Create a password for your locally stored wallet below or
          <Link className="Alt" to="/access">access your existing wallet</Link>
          from backup
        </p>

        <WalletLockForm state={form_state} />

        {/*<p className="Alt">
          By clicking the "REGISTER" button below, you agree to the
          @TODO: Add link to TOS
          <Link className="Alt" to="/">Terms of Service.</Link>
        </p>*/}

        <button className="Action"
                onClick={() => register()}
                disabled={!registration_valid}>
          Create
        </button>

        <p className="Alt">
          {/* @TODO: Don't show this if there are no saved wallets */}
          or
          <Link className="Alt" to="/login">unlock your locally stored wallet</Link>
        </p>

      </div>
    </div>
  )
}
