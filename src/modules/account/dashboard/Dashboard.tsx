import './Dashboard.scss';
import { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { g, OPERATION, Unbox } from 'utils';
import { profile } from "assets";
import { NodeContext } from "index";
import { ToggleEye } from 'components';

export function Dashboard() {
  const history = useHistory();

  if (!g?.user?.privKey) {
    history.push("/login");
  }

  const node_context = useContext(NodeContext);
  let [username] = useState(g?.user?.username || "My Wallet");
  let [pkey_1, set_pkey_1] = useState(g?.user?.privKey ? g.user.privKey.substr(0, 5) : "Unknown");
  let [pkey_2, set_pkey_2] = useState(g?.user?.privKey ? g.user.privKey.substr(-5) : "");
  let [pkey_hidden, set_pkey_hidden] = useState(g?.user?.privKey ? true : false);
  let [balance_op, set_balance_op] = useState(OPERATION.INITIAL);
  let [balance, set_balance] = useState(0);

  function toggle_private_key(is_hidden: boolean) {
    if (!g?.user?.privKey) {
      set_pkey_hidden(false);
      set_pkey_1("Unknown");
      set_pkey_2("");
      return;
    }

    if (is_hidden) {
      if (g && g.user && g.user.privKey) {
        set_pkey_1(g.user.privKey.substr(0, 5));
        set_pkey_2(g.user.privKey.substr(-5));
      } else {
        set_pkey_1("Unknown");
        set_pkey_2("");
      }
    } else {
      if (g && g.user && g.user.privKey) {
        set_pkey_1(g.user.privKey);
        set_pkey_2("");
      } else {
        set_pkey_1("Unknown");
        set_pkey_2("");
      }
    }

    set_pkey_hidden(is_hidden);
  }

  async function get_balance() {
    set_balance_op(OPERATION.PENDING);
    let res: Unbox<ReturnType<typeof g.check_balance>>;
    try{
      res = await g.check_balance(node_context.node);
    } catch {
      res = null;
    }

    if (!res) {
      // @TODO: Notify error.
      set_balance_op(OPERATION.INITIAL);
      return;
    }

    if (res[1]) {
      // @TODO: Notify error.
      set_balance_op(OPERATION.INITIAL);
      return;
    }

    set_balance(res[0]);
    set_balance_op(OPERATION.DONE);
  }

  function render_balance() {
    switch (balance_op) {

      case OPERATION.INITIAL:
        return (
          <button onClick={get_balance}>
            get balance
          </button>);

      case OPERATION.PENDING:
        return (
          <p>Checking balance...</p>);

      case OPERATION.DONE:
        return (<>
          Balance
          <p>{balance}</p>
        </>);
    }
  }

  return (
    <div className="Card">
      <h3 className="Title">
        Account
      </h3>
      <div className="Body Dashboard Row Wrap Center-Y Separate-X">
        <div className="Account Column Center">
          <img src={profile} alt="Account" />
          <p className="Username">{username}</p>
          <p className="PrivateKey">
            {pkey_1}
            {pkey_hidden ? <ToggleEye hanging={false}
                       val={pkey_hidden}
                       setval={toggle_private_key} /> : <></>}
            {pkey_2}
          </p>

          {(!pkey_hidden) ? <ToggleEye hanging={false}
                                     val={pkey_hidden}
                                     setval={toggle_private_key} /> : <></>}
        </div>
        <div className="Balance Column Center-X Center-Y">
          { render_balance() }
        </div>
      </div>
    </div>
  )
}
