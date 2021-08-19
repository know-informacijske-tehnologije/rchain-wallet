import './Navigation.scss';
import { g, rc } from 'utils';
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import * as Assets from 'assets';
import { NodeContext } from 'index';

export function Navigation() {
  const node_context = useContext(NodeContext);
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

  const Nodes = () => {
    let optgroups = [];
    for (let i=0; i<g.networks.length; i++) {
      let network = g.networks[i];
      let options = [];

      for (let j=0; j<network.hosts.length; j++) {
        let host = network.hosts[j];
        let urls = rc.get_node_urls(host);
        let key = `${i},${j}`;
        options.push(<option key={key} value={key}>{urls.httpUrl}</option>)
      }

      optgroups.push(<optgroup key={i} label={network.title || network.name}>{options}</optgroup>)
    }

    return optgroups;
  };

  const set_node = (ev: any) => {
    let [network_index, host_index] = ev.target.value.split(",");
    node_context.set_node(g.networks[network_index].hosts[host_index]);
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

        <select onChange={set_node}>
          { Nodes() }
        </select>

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
