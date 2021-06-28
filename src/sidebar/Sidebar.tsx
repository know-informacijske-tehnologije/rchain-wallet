import './Sidebar.scss';
import social_github from '../assets/social-github.svg';
import social_twitter from '../assets/social-twitter.svg';
import social_telegram from '../assets/social-telegram.svg';
import social_youtube from '../assets/social-youtube.svg';
import social_discord from '../assets/social-discord.svg';

function Sidebar() {
  return (
    <div className="Sidebar">
      <a href="https://github.com/rchain"><img src={social_github} alt="Github"></img></a>
      <a href="https://twitter.com/rchain_coop"><img src={social_twitter} alt="Twitter"></img></a>
      <a href="https://t.me/rchaincoop"><img src={social_telegram} alt="Telegram"></img></a>
      <a href="https://www.youtube.com/channel/UCSS3jCffMiz574_q64Ukj_w"><img src={social_youtube} alt="YouTube"></img></a>
      <a href="https://discord.gg/NWkQnfH"><img src={social_discord} alt="Discord"></img></a>
    </div>
  );
}

export default Sidebar;
