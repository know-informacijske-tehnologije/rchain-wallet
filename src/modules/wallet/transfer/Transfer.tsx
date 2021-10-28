import './Transfer.scss';
import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { NodeContext } from "index";
import { Spinner } from "components";
import * as u from 'utils';
import * as Assets from "assets";

export function Transfer() {
  let name = "Sender";
  if (u.g.user && u.g.user.password) {
    name = u.g.user.name;
  }

  const history = useHistory();
  const sender_name = u.useWritable(name);
  const receiver = u.useWritable("");
  const receiver_name = u.useWritable("");
  const amount = u.useWritableNumber(0);
  const node_context = useContext(NodeContext);
  const layout = u.useLayout();

  const [op, set_op] = useState(u.OPERATION.INITIAL);

  function reset() {
    sender_name.set(name);
    receiver.set("");
    receiver_name.set("");
    amount.correct("0");
  }

  function transfer_valid() {
    return sender_name.value.length > 0 &&
      receiver_name.value.length > 0 &&
      receiver.value.length > 0 &&
      amount.value > 0;
  }

  async function make_transfer() {
    if (!u.g.user) { return; }

    let from_wallet: u.UserWallet | u.UserMetaMaskWallet = {
      ...u.g.user,
      name: sender_name.value,
      password: ""
    };

    let receiver_wallet = u.bc.get_account(receiver.value);

    if (receiver_wallet === null) {
      layout.push_notif({
        group_id: "transfer-error",
        content: u.notif.info("Error", "Invalid receiver wallet!")
      });
      set_op(u.OPERATION.INITIAL);
      return;
    }

    let to_wallet: u.NamedWallet = { ...receiver_wallet, name: receiver_name.value };
    try {
      set_op(u.OPERATION.PENDING);
      let res = await u.g.transfer(node_context.node, amount.value * 100000000, from_wallet, to_wallet);

      if (!res) {
        layout.push_notif({
          group_id: "transfer-error",
          content: u.notif.info("Error", `Transfer failed!`)
        });
      } else if (res.error) {
        layout.push_notif({
          group_id: "transfer-error",
          content: u.notif.info("Error", `Transfer failed!\n${res.error}`)
        });
      } else {
        layout.push_notif({
          group_id: "transfer-success",
          content: u.notif.info("Success!", "Your transfer is successful, but not finalized yet. Check your balance again in a few minutes.")
        });
      }

      set_op(u.OPERATION.INITIAL);
    } catch (err) {
      layout.push_notif({
        group_id: "transfer-error",
        content: u.notif.info("Error", `Transfer failed!\n${String(err)}`)
      });
      set_op(u.OPERATION.INITIAL);
    }
  }

  if (!u.g.user) {
    history.push("/access");
    return <></>;
  }

  return (
    <div className="Card Content">
      <h3 className="Title">
        Transfer
      </h3>
      <div className="Body Transfer">

        <div className="Sender Column Center-Y">
          <div className="Row Separate-X Center-Y Wrap">
            <p className="NoMargin NoWrap">Rev Address</p>
            <p className="Alt BreakAll" style={{marginLeft: "1em", textAlign: "right"}}>
              { u.g.user?.revAddr }
            </p>
          </div>

          <label>
            <p>Sender Name</p>
            <input value={sender_name.value}
                   onChange={sender_name.write}/>
          </label>

          <label>
            <p>Amount</p>
            <div className="Field">
              <input value={amount.str}
                     onChange={amount.write}
                     onBlur={amount.correct}/>
              <p className="Alt Flex-Max NoMargin"
                 style={{ padding: "0 1em" }}>
                REV
              </p>
            </div>
          </label>
        </div>

        <div className="Break">
          <img src={Assets.arrow} alt="" />
        </div>

        <div className="Receiver Column Center-Y">
          <label>
            <p>Receiver Name</p>
            <input value={receiver_name.value}
                   onChange={receiver_name.write}/>
          </label>

          <label>
            <p>Receiver Address</p>
            <input value={receiver.value}
                   onChange={receiver.write}/>
          </label>
        </div>

        <div className="Actions Row Separate-X Center-Y">
          <button className="Subtle Fit"
                  onClick={reset}>
            Reset
          </button>

          <Spinner op={op}
                   children_initial={
                     <button className="Fit"
                             onClick={make_transfer}
                             disabled={!transfer_valid()}>
                       Send
                     </button>
                   } />
        </div>

      </div>
    </div>
  )
}
