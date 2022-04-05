import './Navigation.scss';
import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Assets from 'assets';
import { LayoutContext } from 'index';

export function Navigation() {
  const layout = useContext(LayoutContext);
  const location = useLocation();

  let in_wallet = location.pathname.startsWith("/wallet");

  const [show_menu, set_show_menu]   = useState(false);

  function Menu(show_menu:boolean){
    if (show_menu && !in_wallet) {
      return <div className="Menu Column Center-X Center-Y">
        <a href="https://rchain.coop/community.html">Community</a>
        <a href="https://blog.rchain.coop/">Blog</a>
        {/*<a href="https://github.com">Support</a>*/}
      </div>;
    }

    return null;
  };

  function toggle_sidenav() {
    layout.set_sidenav_expanded(!layout.sidenav_expanded);
  }

  function SidenavToggle() {
    if (in_wallet) {
      return (<button className="SidenavToggle Toggle"
                      onClick={toggle_sidenav}>
        <img src={Assets.menu} alt="Toggle sidenav"/>
      </button>);
    }
  }

  function MenuToggle() {
    if (!in_wallet) {
      return (<div className="MenuButton Row"
                   onClick={() => set_show_menu(!show_menu)}>
                <img src={show_menu ? Assets.menu_close : Assets.menu}
                     alt="Menu Button" />
              </div>);
    }
  }

  function Links() {
    if (!in_wallet) {
        return <>
              <a href="https://rchain.coop/community.html">Community</a>
              <a href="https://blog.rchain.coop/">Blog</a>
              {/*<a href="https://github.com">Support</a>*/}
      </>;
    }
  }

  let classname = "Navigation";
  if (show_menu) { classname += " Expanded"; }
  if (in_wallet) { classname += " Wallet"; }

  return (
    <div className={classname}>
      <div className="NavigationBar">

        {SidenavToggle()}

        <Link className="Logo" to="/">
          <img className="Large"
               src={Assets.logo}
               alt="RChainWallet" />
          <img className="Small"
               src={Assets.logo_notext}
               alt="RChainWallet" />
        </Link>

        { MenuToggle() }

        <div className="Links Row">
          { Links() }
        </div>
      </div>

      { Menu(show_menu) }

    </div>
  );
}
