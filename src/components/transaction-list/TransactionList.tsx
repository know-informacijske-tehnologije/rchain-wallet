import { useState, useContext, ReactNode } from 'react';
import { g, OPERATION, useLayout, useMounted } from "utils";
import { useHistory } from "react-router-dom";
import { NodeContext } from "index";
import { Spinner } from "components";
import * as Assets from "assets";

import "./TransactionList.scss";

const revdefine_api_url = "https://revdefine.io/define/api"

export interface PageInfo {
  totalPage: number;
  currentPage: number;
}

export interface Transaction {
  transactionType: string;
  fromAddr: string;
  toAddr: string;
  amount: number;
  blockHash: string;
  blockNumber: number;
  deployId: string;
  timestamp: number;
  isFinalized: boolean;
  isSucceeded: boolean;
  reason: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pageInfo: PageInfo;
}

async function rev_transactions(rev_addr: string, page=1, rows=20) {
  let res = await fetch(`${revdefine_api_url}/transactions/${rev_addr}/transfer?rowsPerPage=${rows}&page=${page}`);
  let data: TransactionsResponse = await res.json();
  return data.transactions;
}

export function TransactionList() {
  const history = useHistory();
  const node_context = useContext(NodeContext);
  const netname = node_context.network.name || "";
  const layout = useLayout();

  const [list, set_list] = useState<Transaction[]>([]);
  const [list_op, set_list_op] = useState(OPERATION.INITIAL);
  const [error, set_error] = useState(null as string|null);

  const mounted = useMounted();

  if (!g.user) {
    history.push("/access");
    return <></>;
  }

  function Wrapper(props: { children: ReactNode, hideRefresh?: boolean }) {
    let refresh_button = list_op === OPERATION.PENDING ?
      null :
      <button className="Toggle" onClick={get_transactions}>
        <img src={Assets.refresh} alt="Get transactions button" />
      </button>;

    if (props.hideRefresh) {
      refresh_button = null;
    }

    return <div className="Card">
        <h3 className="Title">
          <span>Transfers</span>
          { refresh_button }
        </h3>
        <div className="Body">
          { props.children }
        </div>
    </div>;
  }

  if (netname !== "mainnet") {
    return <Wrapper hideRefresh={true}>
      <p>Only mainnet transactions are supported currently.</p>
    </Wrapper>;
  }

  async function get_transactions() {
    if (!g.user) { return; }
    set_list_op(OPERATION.PENDING);

    let transactions: Transaction[] | null;
    try {
      let rev_addr = g?.user.revAddr;
      // rev_addr = "1111fTFCBE727Ex5AHDhAD38HyNca66U5vKVCoQDLwauVCY9DDbBX";
      transactions = await rev_transactions(rev_addr);
    } catch {
      transactions = null;
    }

    if (!mounted.current) { return; }

    if (!transactions) {
      set_list_op(OPERATION.INITIAL);
      set_error("Error while trying to fetch transaction list.");
      return;
    }

    set_list(transactions);
    set_list_op(OPERATION.DONE);
  }

  function format_balance(val: number) {
    val = val / 100000000;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  }

  function copy_action(addr: string) {
    return () => {
      navigator.clipboard.writeText(addr);
      layout.push_notif({
        group_id: "clipboard",
        content: <p className="Alt" style={{ marginRight: "4em" }}>
          <span>Copied</span>
          <pre style={{ color: "white" }}>
            {addr}
          </pre>
          <span>to clipboard!</span>
        </p>
      });
    };
  }

  function Address(props: { addr: string }) {
    let href = `https://revdefine.io/#/revaccounts/${props.addr}`;
    return <div className="Row Center-X Center-Y">
      <button onClick={copy_action(props.addr)}>
        <img src={Assets.copy} alt="Copy" />
      </button>
      <a href={href}>{props.addr}</a>
    </div>;
  }

  function render_transactions() {
    let output = [];
    for (let trans of list) {
      output.push(<tr className="Transaction">
        <td className="AddrType" data-title="From">
          <Address addr={trans.fromAddr}/>
        </td>
        <td className="AddrType" data-title="To">
          <Address addr={trans.toAddr}/>
        </td>
        <td className="AmountType" data-title="Amount">
          <div>{format_balance(trans.amount)}</div>
        </td>
      </tr>);
    }

    return <tbody className="TransactionList">
      {output}
    </tbody>;
  }

  if (list_op === OPERATION.INITIAL && error === null) {
    get_transactions();
  }

  if (list_op === OPERATION.PENDING) {
    return <Wrapper>
      <div className="Row Center-X Center-Y TransactionSpinner">
        <Spinner op={list_op} />
      </div>
    </Wrapper>
  }

  if (list_op === OPERATION.DONE && list.length === 0) {
    return <Wrapper>
      <p>There are no recent transactions.</p>
    </Wrapper>;
  }

  return <Wrapper>
    <div className="TransactionTable">
      <table>
        <thead><tr>
          <th><div>From</div></th>
          <th><div>To</div></th>
          <th><div>Amount</div></th>
        </tr></thead>
        {render_transactions()}
      </table>
    </div>
  </Wrapper>;
}
