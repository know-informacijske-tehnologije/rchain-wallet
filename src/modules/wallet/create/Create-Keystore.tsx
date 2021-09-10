import 'styles/FormScreen.scss';
import { useState } from 'react';
import * as u from 'utils';
import { useHistory, Link } from 'react-router-dom';
import { PassConfirmModal, Spinner } from 'components';

export function CreateKeystore() {
  const history = useHistory();
  const layout = u.useLayout();
  const [keystore_op, set_keystore_op] = useState(u.OPERATION.INITIAL);
  const [ks_blob, set_ks_blob] = useState<u.Unbox<ReturnType<typeof u.bc.create_keystore>> | null>(null);
  const [wallet, set_wallet] = useState<u.PrivateWallet | null>(null);

  function download_ks() {
    if (ks_blob) {
      u.download_blob(ks_blob.blobUrl, ks_blob.name);
    }
  }

  async function generate_keystore(pass: string) {
      set_keystore_op(u.OPERATION.PENDING);
      let ret;

      let wallet = u.bc.create_account();
      if (!wallet) {
        layout.push_notif({
          group_id: "create-keystore-error",
          content: u.notif.info("Error", "Failed to generate keystore.")
        });
        set_keystore_op(u.OPERATION.INITIAL);
        return
      }
      set_wallet(wallet);

      try {
        ret = await u.bc.generate_keystore(wallet.privKey,  pass);
      } catch(err) {
        ret = null;
      }

      if (ret) {
        set_ks_blob(ret);
        u.download_blob(ret.blobUrl, ret.name);
        set_keystore_op(u.OPERATION.DONE);
      } else {
        layout.push_notif({
          group_id: "create-keystore-error",
          content: u.notif.info("Error", "Failed to generate keystore.")
        });
        set_keystore_op(u.OPERATION.INITIAL);
      }
  }

  function get_keystore() {
    layout.push_modal({
      component: PassConfirmModal,
      props: {
        title: "Keystore password",
        text: "Set a password for your keystore file",
        button: "Confirm",
        onFinish: (val) => {
          if (!val) { return; }
          generate_keystore(val);
        }
      }
    });
  }

  function finish() {
    if (!wallet) { return; }
    let user = u.g.create_user("My Wallet", "", wallet);
    u.g.set_active_user(user);
    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Create a New Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{minWidth: "40ch"}}>
          A keystore file is an encrypted, password protected
          version of your private key. If you have your keystore
          file handy, you can use it to access your wallet from
          anywhere.
        </p>

        <Spinner
          op={keystore_op}
          children_initial={
            <button onClick={get_keystore}>
              Generate keystore file
            </button>}
          children_done={<>
            <button className="Subtle"
                    onClick={download_ks}>
              Redownload keystore
            </button>
            <button className="Action"
                    onClick={finish}>
              Continue to dashboard
            </button></>}
          />

        <p className="Alt">
          or
          <Link className="Alt" to="/access">access a locally stored wallet</Link>
        </p>

      </div>
    </div>
  )
}
