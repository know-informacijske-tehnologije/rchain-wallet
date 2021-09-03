import './Sidebar.scss';
import * as Assets from "assets";
import { useLocation } from 'react-router-dom';

export function Sidebar() {
  let location = useLocation();

  if (location.pathname !== "/") { return (<></>); }

  return (
    <div className="SidebarContainer">
      <div className="Sidebar Column Center-X Center-Y">
        <a href="https://github.com/rchain"><img src={Assets.social_github} alt="Github"></img></a>
        <a href="https://twitter.com/rchain_coop"><img src={Assets.social_twitter} alt="Twitter"></img></a>
        <a href="https://t.me/rchaincoop"><img src={Assets.social_telegram} alt="Telegram"></img></a>
        <a href="https://www.youtube.com/channel/UCSS3jCffMiz574_q64Ukj_w"><img src={Assets.social_youtube} alt="YouTube"></img></a>
        <a href="https://discord.gg/NWkQnfH"><img src={Assets.social_discord} alt="Discord"></img></a>
      </div>
    </div>
  );
}
