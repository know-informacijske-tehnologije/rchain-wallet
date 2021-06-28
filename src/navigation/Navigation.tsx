import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.scss';
import logo_large from '../assets/logo.png';
import logo_small from '../assets/logo-notext.png';
import menu_icon from '../assets/menu.svg';
import close_icon from '../assets/menu-close.svg';

function Navigation() {
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
          <img className="Large" src={logo_large} alt="MyRChainWallet" />
          <img className="Small" src={logo_small} alt="MyRChainWallet" />
        </Link>

        <div className="MenuButton" onClick={() => set_show_menu(!show_menu)}>
          <img src={show_menu ? close_icon : menu_icon} alt="Menu Button" />
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

export default Navigation;
