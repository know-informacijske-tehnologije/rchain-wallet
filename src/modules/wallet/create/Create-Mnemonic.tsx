import 'styles/FormScreen.scss';
import { useState, useContext } from 'react';
import { bc, g } from 'utils';
import * as u from 'utils';
import { useHistory, Link } from 'react-router-dom';
import { LayoutContext } from 'index';

export function CreateMnemonic() {
  const history = useHistory();
  const layout = useContext(LayoutContext);
  const [ mnemonic ] = useState(bc.generate_mnemonic(256));
  const [ step, set_step ] = useState(0);
  const word1  = u.useWritable("");
  const word8  = u.useWritable("");
  const word16 = u.useWritable("");
  const [ words_correct, set_words_correct ] = useState(false);

  function mnemonic_words() {
    let words = mnemonic.split(" ").map(w => {
      return (<div className="Word" key={w}>{w}</div>)
    });
    return <div className="MnemonicWords">
      { words }
    </div>;
  }

  function register() {
    const account_data = bc.get_account_from_mnemonic(mnemonic);

    if (account_data === null) {
      layout.push_notif({
        group_id: "create-mnemonic-error",
        content: <>
          <h3>Error</h3>
          <p>An error occurred while trying to create a new wallet.</p>
        </>
      });
      return;
    }

    const user = g.create_user("My Wallet", "", account_data);
    g.set_active_user(user);
    history.push("/wallet/dash");
  }

  function copy() {
    navigator.clipboard.writeText(mnemonic);
  }

  async function download() {
    let blobUrl = u.bc.create_blob(mnemonic);
    await u.download_blob(blobUrl, "mnemonic.txt");
    window.URL.revokeObjectURL(blobUrl);
  }

  function set_word_1(ev: any) {
    word1.write(ev);
    check_words(ev.target.value, word8.value, word16.value);
  }

  function set_word_8(ev: any) {
    word8.write(ev);
    check_words(word1.value, ev.target.value, word16.value);
  }

  function set_word_16(ev: any) {
    word16.write(ev);
    check_words(word1.value, word8.value, ev.target.value);
  }

  function check_words(word1: string, word8: string, word16: string) {
    let words = mnemonic.split(" ");
    if (word1 !== words[0]) { set_words_correct(false); return; }
    if (word8 !== words[7]) { set_words_correct(false); return; }
    if (word16 !== words[15]) { set_words_correct(false); return; }
    set_words_correct(true);
  }

  function reset_words() {
    word1.set("");
    word8.set("");
    word16.set("");
  }

  function render_step() {
    if (false) { set_step(0); }
    switch (step) {
      case 0:
        return <>
          <p className="Alt">
            The below words are your mnemonic phrase. Make sure to copy
            them somewhere safe - you will not be able to access your wallet
            without them.
          </p>
          { mnemonic_words() }

          <p></p>

          <button onClick={()=>set_step(1)}>
            NEXT STEP
          </button>
        </>;

      case 1:
        return <>
          <p className="Alt">
            Now that you have written down your mnemonic phrase,
            please copy the 1st, 8th and 16th word into the boxes
            below to make sure that they match.
          </p>
          <div className="Column FullWidth">
            <label>
              <p>1st Word</p>
              <input value={word1.value} onChange={set_word_1} />
            </label>

            <label>
              <p>8th Word</p>
              <input value={word8.value} onChange={set_word_8} />
            </label>

            <label>
              <p>16th Word</p>
              <input value={word16.value} onChange={set_word_16} />
            </label>
          </div>

          <p></p>

          <div className="Row FullWidth Separate-X">
            <button className="Subtle Fit"
                    onClick={()=>{ reset_words(); set_step(0) }}>
              Go back
            </button>
            <button className="Fit"
                    disabled={!words_correct}
                    onClick={() => set_step(2)}>
              CONTINUE
            </button>
          </div>
        </>

      case 2:
        return <>
          <p className="Alt" style={{minWidth: "35ch"}}>
            Success! Before you continue to your new wallet,
            feel free to copy your mnemonic or download it
            as a file, for backup.
          </p>

          <div className="Row Separate-X FullWidth">
            <button className="Subtle Fit" onClick={download}>
              Download
            </button>
            <button className="Subtle Fit" onClick={copy}>
              Copy
            </button>
          </div>

          <button className="Action" onClick={register}>
            Continue to wallet
          </button>
        </>
    }
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Create a New Wallet</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>

        { render_step() }

        <p className="Alt">
          or
          <Link className="Alt" to="/access">access an existing wallet</Link>
        </p>

      </div>
    </div>
  )
}
