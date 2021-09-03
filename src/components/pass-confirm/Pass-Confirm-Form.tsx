// @TODO: Check if this style import is needed.
import 'styles/FormScreen.scss';
import { useState, useEffect } from 'react';
import * as u from 'utils';
import { ToggleButton } from 'components';

export function usePassConfirm() {
  let password1 = u.useWritableWithToggle("", false);
  let password2 = u.useWritableWithToggle("", false);

  const [valid, set_valid] = useState(false);

  function check_validity() {
    if (password1.value.length < 6) {
      set_valid(false);
      return;
    }

    if (password2.value !== password1.value) {
      set_valid(false);
      return;
    }

    set_valid(true);
  }

  useEffect(check_validity, [password1, password2]);

  return {
    password1,
    password2,
    valid
  };
}

interface PassConfirmProps {
  state: ReturnType<typeof usePassConfirm>;
};

export function PassConfirmForm(props: PassConfirmProps) {
  let { password1, password2 } = props.state;

  return (<>
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
