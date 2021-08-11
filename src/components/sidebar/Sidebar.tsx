import './Sidebar.scss';
import * as Assets from "assets";

export function Sidebar() {
  return (
    <div className="Sidebar">
      <a href="https://github.com/rchain"><img src={Assets.social_github} alt="Github"></img></a>
      <a href="https://twitter.com/rchain_coop"><img src={Assets.social_twitter} alt="Twitter"></img></a>
      <a href="https://t.me/rchaincoop"><img src={Assets.social_telegram} alt="Telegram"></img></a>
      <a href="https://www.youtube.com/channel/UCSS3jCffMiz574_q64Ukj_w"><img src={Assets.social_youtube} alt="YouTube"></img></a>
      <a href="https://discord.gg/NWkQnfH"><img src={Assets.social_discord} alt="Discord"></img></a>
    </div>
  );
}
