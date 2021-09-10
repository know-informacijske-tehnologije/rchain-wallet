import './Sidebar.scss';
import * as Assets from "assets";
import { Landing } from "modules";
import { RouteArrayProps } from "components";
import { useLocation, matchPath, RouteProps } from 'react-router-dom';

function matchPaths(path: string, routes: RouteProps[]) {
  let def = null;

  for (let r of routes) {
    if (!r.exact && !r.path) {
      def = r;
    }

    let res = matchPath(path, r);
    if (res) { return r; }
  }

  return def;
}

function useRouteComponent() {
  let location = useLocation();
  return matchPaths(location.pathname, RouteArrayProps)?.component;
}

export function Sidebar() {
  let component = useRouteComponent();
  if (component !== Landing) { return <></>; }

  return (
    <div className="SidebarContainer">
      <div className="Sidebar Column Center-X Center-Y">
        <a href="https://github.com/rchain"><img src={Assets.social_github} alt="Github"></img></a>
        <a href="https://twitter.com/rchain_coop"><img src={Assets.social_twitter} alt="Twitter"></img></a>
        <a href="https://t.me/RChainOfficial"><img src={Assets.social_telegram} alt="Telegram"></img></a>
        <a href="https://www.youtube.com/channel/UCSS3jCffMiz574_q64Ukj_w"><img src={Assets.social_youtube} alt="YouTube"></img></a>
        <a href="https://discord.gg/NWkQnfH"><img src={Assets.social_discord} alt="Discord"></img></a>
      </div>
    </div>
  );
}
