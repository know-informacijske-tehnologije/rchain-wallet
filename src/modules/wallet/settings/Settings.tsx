import './Settings.scss';
import { useState, useContext } from 'react';
import { LayoutContext } from 'index';
import { Tabs, TabsProps, WalletLockModal, PassConfirmModal } from 'components';
import * as u from 'utils';
import * as Assets from 'assets';
import { Spinner } from 'components';
import { useHistory } from 'react-router-dom';

export function Settings() {
  const history = useHistory();
  const layout = useContext(LayoutContext);
  const [keystore_op, set_keystore_op] = useState(u.OPERATION.INITIAL);
  const [is_local, set_is_local] = useState(!!u.g.user?.password);

  if (!u.g.user?.privKey) {
    history.push("/access");
    return <></>;
  }

  function get_keystore() {
    if (u.g.user) {
      layout.push_modal({
        component: PassConfirmModal,
        props: {
          title: "Keystore password",
          text: "Set a password for your keystore file",
          button: "Confirm",
          onFinish: (val) => {
            if (!val) { return; }
            if (!u.g.user) { return; }
            generate_keystore(val);
          }
        }
      });
    }
  }

  async function generate_keystore(pass: string) {
    if (u.g.user) {
      set_keystore_op(u.OPERATION.PENDING);
      let ret;

      try {
        ret = await u.bc.generate_keystore(u.g.user.privKey, pass);
      } catch {
        ret = null;
      }

      if (ret) {
        u.download_blob(ret.blobUrl, ret.name);
      }

      set_keystore_op(u.OPERATION.INITIAL);
    }
  }

  async function save_wallet() {
    if (u.g.user) {
      layout.push_modal({
        component: WalletLockModal,
        props: {
          title: "Save your wallet locally",
          text: "Give your wallet a descriptive name and a password",
          button: "Save",
          onFinish: (val) => {
            if (!val) { return; }
            if (!u.g.user) { return; }
            u.g.user.name = val.name;
            u.g.user.password = val.password;
            u.g.add_user(u.g.user);
            set_is_local(true);
          }
        }
      });
    }
  }

  function access_methods() {
    let tabs: TabsProps["tabs"] = [];

    tabs.push({
      icon: Assets.keystore_small,
      text: "Keystore",
      content: <>
        <h3>Keystore</h3>
        <p className="AccessDescription">
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
          />
      </>
    });

    tabs.push({
      icon: Assets.wallet_small,
      text: "Locally stored wallet",
      content: <>
        <h3>Locally stored wallet</h3>
        <p className="AccessDescription">
          Storing your wallet locally, in your browser,
          allows you to quickly access it with a password.
          You will be able to access your locally stored
          wallets as long as you do not clear your browser
          data.
        </p>
        {is_local ?
          <p className="Alt AccessDescription">
            This wallet is already stored locally!
          </p>
        :
          <button onClick={save_wallet}>
            Store my wallet locally
          </button>
        }
      </>
    });

    return <Tabs tabs={tabs} className="Small" />
  }

  function get_tabs() {
    let tabs: TabsProps["tabs"] = [];

    tabs.push({
      icon: Assets.access,
      text: "Access methods",
      content: access_methods()
    });

    return tabs;
  }


  return (
    <div className="Card Content">
      <h3 className="Title">
        Settings
      </h3>
      <div className="Body Settings">
        <Tabs tabs={get_tabs()} className="NoPadding" />
      </div>
    </div>
  );
}
