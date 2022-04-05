import './Dashboard.scss';
import { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { g, OPERATION, Unbox, useToggle, wallet_is_metamask, useMounted } from 'utils';
import { Spinner, ToggleString, TransactionList } from 'components';
import { NodeContext } from "index";
import * as Assets from "assets";

export function Dashboard() {
  const history = useHistory();

  const node_context = useContext(NodeContext);
  let [name] = useState(g?.user?.name || "My Wallet");
  let show_pubkey = useToggle(false);
  let show_rev_addr = useToggle(false);
  let [balance_op, set_balance_op] = useState(OPERATION.INITIAL);
  let [balance, set_balance] = useState(0);
  let [error, set_error] = useState<string | null>(null);
  const mounted = useMounted();

  if (!g.user) {
    history.push("/access");
    return <></>;
  }

  async function get_balance() {
    set_balance_op(OPERATION.PENDING);
    let res: Unbox<ReturnType<typeof g.check_balance>>;
    try{
      res = await g.check_balance(node_context.read_only);
    } catch {
      res = null;
    }

    if (!mounted.current) { return; }

    if (!res) {
      set_balance_op(OPERATION.INITIAL);
      set_error("Error while trying to fetch balance.");
      return;
    }

    if (res.error) {
      set_balance_op(OPERATION.INITIAL);
      set_error(res.error);
      return;
    }

    set_balance(res.balance);
    set_balance_op(OPERATION.DONE);
  }

  function format_balance(val: number) {
    val = val / 100000000;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  }

  function get_balance_button() {
    if (balance_op === OPERATION.PENDING) { return null; }
    return (
      <button className="Toggle" onClick={get_balance}>
        <img src={Assets.refresh} alt="Get balance button" />
      </button>
    );
  }

  function show_balance() {
    return (<span className="BalanceValue">
      {format_balance(balance)}
    </span>)
  }

  if (balance_op === OPERATION.INITIAL && error === null) {
    get_balance();
  }

  function show_addr() {
    if (!g.user) { return <></>; }
    if (wallet_is_metamask(g.user)) {
      return (<div className="Column" style={{width: "100%"}}>
        <span style={{textAlign: "left"}}>Eth address</span>
        <ToggleString className="Left Below SmallMargin SmallExpanded"
                      str={g.user.ethAddr}
                      toggle={show_pubkey}
                      desc={"public key"} />
      </div>);
    } else {
      return (<div className="Column" style={{width: "100%"}}>
        <span style={{textAlign: "left"}}>Public key</span>
        <ToggleString className="Left Below SmallMargin SmallExpanded"
                      str={g.user.pubKey}
                      toggle={show_pubkey}
                      desc={"public key"} />
      </div>);
    }
  }

  return <div className="Content">
    <div className="Card">
      <h3 className="Title">
        <span>Wallet</span>
        <div>
          { get_balance_button() }
        </div>
      </h3>
      <div className="Body">
        <div className="Dashboard Row Wrap Stretch-Y Separate-X">
          <div className="Wallet Column Center-X Stretch-Y">
            <div>
              <img src={Assets.profile} alt="Wallet" />
              <p className="Name">{name}</p>
            </div>
            { show_addr() }
          </div>

          <div className="Balance Column Separate-Y">

            <div className="Column">
              <span style={{textAlign: "right"}}>Rev Address</span>
              <ToggleString className="Right Below SmallMargin SmallExpanded"
                            str={g.user.revAddr}
                            toggle={show_rev_addr}
                            desc={"rev address"} />
            </div>

            <div className="Column Center-X Center-Y Flex-Dynamic">
              <Spinner op={balance_op}
                       children_done={ show_balance() }/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TransactionList />
  </div>;
}
