// @TODO: Move restore styles so they can be reused.
import 'styles/FormScreen.scss';
import { ToggleButton } from 'components';
import { g, useWritable, useWritableWithToggle } from 'utils';
import { Link, useHistory } from 'react-router-dom';

export function Login() {
  const history = useHistory();
  const username = useWritable("");
  const password = useWritableWithToggle("", false);

  function login() {
    let user = g.user_list.find(u => u.username === username.value);
    if (!user) {
      // @TODO: Show login failure message.
      console.error("Login failed! User not found!");
      return;
    }

    if (user.password !== password.value) {
      console.error("Login failed! Wrong password!");
      return;
    }

    g.set_active_user(user);
    history.push("/wallet/dash");
  }

  return (
    <div className="FormScreen Column Center-X">
      <h2 className="Alt">Sign in</h2>

      <div className="Column Center-X" style={{width: "min-content"}}>
        <p className="Alt" style={{marginBottom: "3em"}}>
          Sign in or
          <Link className="Alt" to="/create">Create a new account</Link>
        </p>

        <label>
          <p>Username</p>
          <input value={username.value}
                 onChange={username.write} />
        </label>

        <label>
          <p>Password</p>
          <input value={password.value}
                 onChange={password.write}
                 type={password.toggle_value ? "text" : "password"}/>
          <ToggleButton hanging={true}
                     val={password.toggle_value}
                     setval={password.set_toggle}
                     alt_text="Toggle show password" />
        </label>

        {/* @TODO: Auto login checkbox */}

        <button className="Action"
                onClick={() => login()}>
          Sign in
        </button>

        <p className="Alt">
          Already have an account?
          <Link className="Alt" to="/restore">Restore account</Link>
          from backup
        </p>

      </div>
    </div>
  )
}
