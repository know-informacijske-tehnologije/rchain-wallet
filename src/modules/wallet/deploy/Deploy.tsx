import './Deploy.scss';
import { useContext, useState, createRef } from 'react';
import { useHistory } from 'react-router-dom';
import { NodeContext } from "index";
import { Spinner } from "components";
import * as u from 'utils';
import * as Assets from 'assets';

export function Deploy() {
  const history = useHistory();
  const node_context = useContext(NodeContext);
  const code = u.useWritable("");
  const code_ref = createRef<HTMLTextAreaElement>();
  const phlo_limit = u.useWritableNumber(500000);
  const [err,  set_err] = useState<string|null>();
  const [msg,  set_msg] = useState<string|null>();
  const [cost, set_cost] = useState<number|null>();
  const [op, set_op] = useState(u.OPERATION.INITIAL);

  if (!u.g.user) {
    history.push("/access");
    return <></>;
  }

  async function clear() {
    if (code_ref.current) {
      code_ref.current.value = "";
      code.set("");
    }
  }

  async function deploy() {
    if (!u.g.user) { return null; }
    set_op(u.OPERATION.PENDING);

    set_err(null);
    set_msg(null);
    set_cost(null);

    let res = await u.g.deploy_code(
      node_context.node,
      code.value,
      phlo_limit.value
    );

    if (!res) {
      set_err("Unknown error!");
      set_msg(null);
      set_cost(null);
      set_op(u.OPERATION.INITIAL);
      return;
    }

    set_err(res?.error);
    set_msg(res?.message);
    set_cost(res?.cost);
    set_op(u.OPERATION.INITIAL);
  }

  function show_error() {
    if (!err) { return <></>; }

    return (<label>
      <p>Error</p>
      <pre className="Error">{err}</pre>
    </label>);
  }

  function show_message() {
    if (!msg && err) { return <></>; }
    if (!msg && !cost) { return <></>; }

    return (<label>
      <p>Output</p>
      <pre>{msg}</pre>
    </label>);
  }

  function show_cost() {
    if (!cost) { return <></>; }

    return (<div className="Row Separate-X Center-Y">
      <p className="Alt">Deployment cost:</p>
      <span>{cost} ×10<sup>-8</sup> REV</span>
    </div>)
  }

  return (
    <div className="Card Content">
      <h3 className="Title">
        Deploy Rholang Code
      </h3>
      <div className="Body Deploy">
        <p className="Alt Left NoMargin">Code</p>
        <label className="Row">
          <textarea className="FullWidth"
                    ref={code_ref}
                    onChange={code.write}>
          </textarea>
        </label>

        <label>
          <p>Phlo Limit</p>
          <div className="Field">
            <input className="Flex-Spacer"
                   style={{ textAlign: "right" }}
                   value={phlo_limit.str}
                   onChange={phlo_limit.write}
                   onBlur={phlo_limit.correct}/>
            <p className="Alt Flex-Max NoMargin"
               style={{ padding: "0 1em" }}>
              ×10<sup>-8</sup> REV
            </p>
          </div>
        </label>

        <p></p>

        <div className="Row Separate-X Center-Y">
          <button className="Subtle Fit"
                  onClick={clear}>
            Clear
          </button>

          <Spinner op={op}
                   children_initial={
                     <button className="Fit Row Center-X Center-Y"
                             disabled={!code.value || phlo_limit.value <= 0}
                             onClick={deploy}>
                       <img src={Assets.run} alt="Deploy" />
                     </button>
                   } />
        </div>

        { show_cost() }
        { show_error() }
        { show_message() }
      </div>
    </div>
  )
}
