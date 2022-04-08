import './Dashboard.scss';
import { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { g, OPERATION, Unbox, useToggle, wallet_is_metamask, useAsync, CoinGecko } from 'utils';
import { Spinner, ToggleString, TransactionList } from 'components';
import { NodeContext } from "index";
import * as Assets from "assets";

type Balance = Unbox<ReturnType<typeof g.check_balance>>;

export function Dashboard() {
  const history = useHistory();

  const node_context = useContext(NodeContext);
  let [name] = useState(g?.user?.name || "My Wallet");
  let show_pubkey = useToggle(false);
  let show_rev_addr = useToggle(false);
  let balance = useAsync<Balance>({ balance: 0, error: null });
  let value = useAsync<number>(null);

  if (!g.user) {
    history.push("/access");
    return <></>;
  }

  function get_balance() {
    balance.set(g.check_balance(node_context.read_only));
  }

  function format_balance(val: number, divisor=100000000) {
    val = val / divisor;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  }

  function get_balance_button() {
    if (balance.op === OPERATION.PENDING) { return null; }
    return (
      <button className="Toggle" onClick={get_balance}>
        <img src={Assets.refresh} alt="Get balance button" />
      </button>
    );
  }

  function show_balance() {
    if (balance.op === OPERATION.DONE) {
      return (<span className="BalanceValue">
        {format_balance(balance.value?.balance)}
      </span>);
    }

    return <></>;
  }

  function show_rev_value() {
    if (value.op !== OPERATION.DONE || value.value === null) {
      return null;
    }

    return <div>
      <span style={{marginRight: "1em"}}>
        <span>1</span>
        <span className="Alt">REV</span>
      </span>
      <span>
        <span>{format_balance(value.value, 1)}</span>
        <span className="Alt">$</span>
      </span>
    </div>;
  }

  if (balance.op === OPERATION.INITIAL && balance.error === null) {
    get_balance();
  }

  if (value.op === OPERATION.INITIAL && balance.error === null) {
    value.set(CoinGecko.price());
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
              <Spinner op={balance.op}
                       children_done={ show_balance() }/>
              { show_rev_value() }
            </div>
          </div>
        </div>
      </div>
    </div>

    <TransactionList />
  </div>;
}
