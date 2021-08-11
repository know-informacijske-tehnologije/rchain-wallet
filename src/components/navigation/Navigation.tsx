import './Navigation.scss';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Assets from 'assets';

export function Navigation() {
  const [show_menu, set_show_menu] = useState(false);

  const Menu = (show_menu:boolean) => {
    if (show_menu) {
      return <div className="Menu">
        <a href="https://github.com">Community</a>
        <a href="https://github.com">Blog</a>
        <a href="https://github.com">Support</a>
      </div>;
    }

    return null;
  };

  return (
    <div className={show_menu ? "Navigation Expanded" : "Navigation"}>
      <div className="NavigationBar">
        <Link to="/">
          <img className="Large"
               src={Assets.logo}
               alt="MyRChainWallet" />
          <img className="Small"
               src={Assets.logo_notext}
               alt="MyRChainWallet" />
        </Link>

        <div className="MenuButton" onClick={() => set_show_menu(!show_menu)}>
          <img src={show_menu ? Assets.menu_close : Assets.menu}
               alt="Menu Button" />
        </div>

        <div className="Links">
          <a href="https://github.com">Community</a>
          <a href="https://github.com">Blog</a>
          <a href="https://github.com">Support</a>
        </div>
      </div>

      { Menu(show_menu) }

    </div>
  );
}
