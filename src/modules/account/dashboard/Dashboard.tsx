import './Dashboard.scss';
import { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { g, OPERATION, Unbox } from 'utils';
import { profile } from "assets";
import { ToggleButton, Spinner } from 'components';
import { NodeContext } from "index";
import * as Assets from "assets";

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
      res = await g.check_balance(node_context.read_only);
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

  function format_balance(val: number) {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    });
  }

  function get_balance_button(big: boolean) {
    if (big) {
      return (
        <button className="Subtle" onClick={get_balance}>
          Get balance
        </button>
      );
    } else {
      return (
        <button className="Toggle" onClick={get_balance}>
          <img src={Assets.refresh} alt="Get balance button" />
        </button>
      );
    }
  }

  function show_balance() {
    return (<span className="BalanceValue">
      {format_balance(balance)}
    </span>)
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
          <p className={pkey_hidden ? "PrivateKey" : "PrivateKey Expanded"}>
            {pkey_1}
            {pkey_hidden ? <ToggleButton hanging={false}
                       val={pkey_hidden}
                       setval={toggle_private_key}
                       alt_text="Show private key"/> : <></>}
            {pkey_2}
          </p>

          {(!pkey_hidden) ? <ToggleButton hanging={false}
                                     val={pkey_hidden}
                                     setval={toggle_private_key}
                                     alt_text="Hide private key" /> : <></>}
        </div>
        <div className="Balance">
          <Spinner op={balance_op}
                   children_initial={[get_balance_button(true)]}
                   children_done={[show_balance(), get_balance_button(false)]} />
        </div>
      </div>
    </div>
  )
}
