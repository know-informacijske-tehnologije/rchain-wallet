// @TODO: Check if this style import is needed.
import 'styles/FormScreen.scss';
import { useState, useEffect } from 'react';
import * as u from 'utils';
import { ToggleButton } from 'components';

export function useWalletLock() {
  let name = u.useWritable("");
  let password1 = u.useWritableWithToggle("", false);
  let password2 = u.useWritableWithToggle("", false);

  const [registration_valid, set_registration_valid] = useState(false);

  function check_validity() {
    if (name.value.length < 3) {
      set_registration_valid(false);
      return;
    }

    if (u.g.wallet_exists(u.g.user_list, name.value)) {
      set_registration_valid(false);
      return;
    }

    if (password1.value.length < 6) {
      set_registration_valid(false);
      return;
    }

    if (password2.value !== password1.value) {
      set_registration_valid(false);
      return;
    }

    set_registration_valid(true);
  }

  useEffect(check_validity, [name, password1, password2]);

  return {
    name,
    password1,
    password2,
    registration_valid
  };
}

interface WalletLockProps {
  state: ReturnType<typeof useWalletLock>;
};

export function WalletLockForm(props: WalletLockProps) {
  let { name, password1, password2 } = props.state;

  return (<>
    <label>
      <p>Wallet name (3+ characters)</p>
      <input value={name.value}
         onChange={name.write}/>
    </label>

    <label>
      <p>Password (6+ characters)</p>
      <input value={password1.value}
          type={password1.toggle_value ? "text" : "password"}
          onChange={password1.write}/>
      <ToggleButton hanging={true}
                 val={password1.toggle_value}
                 setval={password1.set_toggle}
                 alt_text="Toggle show password" />
    </label>

    <label>
      <p>Confirm your password</p>
      <input value={password2.value}
             type={password2.toggle_value ? "text" : "password"}
             onChange={password2.write}/>
      <ToggleButton hanging={true}
                 val={password2.toggle_value}
                 setval={password2.set_toggle}
                 alt_text="Toggle show password" />
    </label>
  </>)
}
