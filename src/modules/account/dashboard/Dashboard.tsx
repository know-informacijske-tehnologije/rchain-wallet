// @TODO: Move restore styles so they can be reused.
import './Dashboard.scss';
import { useState } from 'react';
import { g, OPERATION } from 'utils';
import { profile } from "assets";

export function Dashboard() {
  let [username] = useState("ERROR");
  let [balance_op, set_balance_op] = useState(OPERATION.INITIAL);
  let [balance, set_balance] = useState(0);

  if (g && g.user) {
    username = g.user.username;
  }

  async function get_balance() {
    set_balance_op(OPERATION.PENDING);
    let res = await g.check_balance();

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
      <div className="Body Dashboard Row Center-Y Separate-X">
        <div className="Account Column Center">
          <img src={profile} alt="Account" />
          <p>{username}</p>
        </div>
        <div className="Balance">
          { render_balance() }
        </div>
      </div>
    </div>
  )
}
