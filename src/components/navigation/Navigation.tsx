import './Navigation.scss';
import { g, rc } from 'utils';
import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Assets from 'assets';
import { ToggleButton } from 'components';
import { NodeContext } from 'index';

export function Navigation() {
  const location = useLocation();
  const node_context = useContext(NodeContext);
  const [show_menu, set_show_menu]   = useState(false);
  const [show_nodes, set_show_nodes] = useState(false);

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
        options.push(
          <option key={urls.httpUrl}
                  value={`${i},${j}`}
                  selected={node_context.node === host}>
            {urls.httpUrl}
          </option>
        );
      }

      optgroups.push(
        <optgroup key={network.title || network.name}
                  label={network.title || network.name}>
          {options}
        </optgroup>
      );
    }

    return optgroups;
  };

  const ReadOnlys = () => {
    let options = [];

    let network = node_context.network;
    for (let i=0; i<network.readOnlys.length; i++) {
      let read_only = network.readOnlys[i];
      let urls = rc.get_node_urls(read_only);
      options.push(
        <option key={urls.httpUrl}
                value={i}
                selected={node_context.read_only === read_only}>
          {urls.httpUrl}
        </option>
      );
    }

    return options;
  };

  const set_node = (ev: any) => {
    let [nw_i, host_i] = ev.target.value.split(",");
    node_context.set_node(nw_i, host_i);
  };

  const set_readonly = (ev: any) => {
    node_context.set_read_only(ev.target.value);
  };

  const NodeSelects = () => {
    if (show_nodes) {
      return (<div className="Column Center-X Center-Y">
        <label>
          <p>Validator node</p>
          <select onChange={set_node}>
            { Nodes() }
          </select>
        </label>
        <label>
          <p>Read-only node</p>
          <select onChange={set_readonly}>
            { ReadOnlys() }
          </select>
          <p>&nbsp;</p>
        </label>
      </div>);
    }
  };

  const NodeToggle = () => {
    if (location.pathname.startsWith("/wallet")) {
      return <div className={ show_nodes ? "NodeSelect Expanded" : "NodeSelect" }>
        { NodeSelects() }
        <ToggleButton val={show_nodes}
                      setval={set_show_nodes}
                      on_img={Assets.cancel}
                      off_img={Assets.network}/>
      </div>
    }
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

        { NodeToggle() }

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
