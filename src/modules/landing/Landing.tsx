import { createRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './Landing.scss';
import { navigate } from 'utils';
import * as Components from 'components';
import * as Assets from 'assets';

const blink_interval_ms = 200;
const light_duration_ms = 2000;
const min_lights_per_interval = 0;
const max_lights_per_interval = 10;

function random_int(max: number) {
  return Math.ceil(Math.random() * max);
}

function pick_random<T>(array: T[]): T {
  let index = random_int(array.length - 1);
  return array[index];
}

function blink_light(light: SVGPathElement, on: boolean) {
  if (on) {
    light.style.fill = "#6161b5";
    light.style.filter = "drop-shadow(0 0 2px #6161b5)";
  } else {
    light.style.fill = "#332b68";
    light.style.filter = "";
  }
}

function blink_lights(svg: SVGSVGElement & { blinking?: boolean }) {
  if (!svg || svg.blinking) {
    return;
  }
  svg.blinking = true;

  const lights: SVGPathElement[] = Array.from(svg.querySelectorAll("path"));
  for (let light of lights) {
    blink_light(light, false);
  }

  const lights_per_interval_range = max_lights_per_interval - min_lights_per_interval;

  setInterval(() => {
    const lights_to_turn_on = random_int(lights_per_interval_range) + min_lights_per_interval;

    for (let i = 0; i < lights_to_turn_on; i++) {
      let light = pick_random(lights);
      blink_light(light, true);

      setTimeout(() => {
        blink_light(light, false);
      }, light_duration_ms);
    }
  }, blink_interval_ms);
}

export function Landing() {
  let history = useHistory();
  let art_ref = createRef<SVGSVGElement>();

  useEffect(() => {
    if (art_ref.current) {
      blink_lights(art_ref.current);
    }
  }, [art_ref]);

  return (
    <div className="Landing Content">
      <div className="Art">
        <Assets.BgArt ref={art_ref} />
      </div>
      <div className="AboveFold">
        <h1>
          <span>Community driven</span>
          <span className="Highlight">
            RChain wallet
          </span>
        </h1>
        <h3 className="BigScreen">
          <span>Locally stored web interface for interaction with RChain platform</span>
        </h3>
      </div>

      <div className="CardList LargeMargin">
        <div className="Card">
          <img src={Assets.wallet} alt="Wallet"/>
          <h2>Create a new wallet</h2>
          <h4 className="Dynamic">
            Generate a new wallet address and choose your preferred method of access.
          </h4>
          <button onClick={navigate(history, "/create")}>Create</button>
        </div>

        <div className="Card">
          <img src={Assets.globe} alt="Globe"/>
          <h2>Access your wallet</h2>
          <h4 className="Dynamic">
            Connect to the RChain platform to check your balance, transfer REV and deploy Rholang code.
          </h4>
          <button onClick={navigate(history, "/access")}>Access</button>
        </div>
      </div>

      <h2>FAQ</h2>

      <Components.Expander
        title={
          <h3 className="NoMargin Left">
            What is RChainWallet?
          </h3>}
        content={
          <p>
            RChainWallet is a free, open-source web application that provides a simple interface to interact with the RChain platform.
          </p>}/>

      <Components.Expander
        title={
          <h3 className="NoMargin Left">
            How do we handle private keys?
          </h3>}
        content={<>
            <p>
              Your private key is stored locally, and will never leave your computer. All locally stored data, including your private key, will be deleted after you clear your browser cache.
            </p>
            <p>
              Please, take care of your mnemonics and keystore files by storing them somewhere safe.
            </p>
          </>}/>

      <Components.Expander
        title={
          <h3 className="NoMargin Left">
            Do you have a Support forum?
          </h3>}
        content={
          <p>
            If you are a coop member, please use the <b>#wallet</b> channel on
            <a className="Alt" href="https://discord.gg/NWkQnfH">the official Discord server.</a>
            Otherwise, feel free to
            <a className="Alt" href="https://t.me/RChainOfficial">ask a question on Telegram.</a>
          </p>}/>

      <div className="Footer">
        <div className="Logo">
          <img className="BigScreen"
               src={Assets.logo_white}
               alt="MyRChainWallet Logo" />
          <img className="SmallScreen"
               src={Assets.logo_white_oneline}
               alt="MyRChainWallet Logo" />
        </div>

        <div className="LinksList">

          <figure>
            <figcaption>
              <h4>Discover</h4>
            </figcaption>

            <div className="Content">
              <ul>
                <li><a href="https://rchain-community.github.io">Rholang</a></li>
                <li><a href="https://revdefine.io">Revdefine</a></li>
                <li><a href="https://dappy.tech">Dappy</a></li>
                <li><a href="https://github.com/rchain-community">Community Github</a></li>
              </ul>
            </div>
          </figure>

          <figure>
            <figcaption>
              <h4>Donate REV</h4>
            </figcaption>

            <div className="Content">
              <p className="Key">111151LUEfjJhpLjmJNECvo7PWT8fce8Gau481jWLQ1ZDfGYc2K7W</p>
            </div>
          </figure>

          <figure>
            <figcaption>
              <h4>Donate ETH</h4>
            </figcaption>

            <div className="Content">
              <p className="Key">be165c0e00dce91375ebd15ea98f93006bbf4e1f</p>
            </div>
          </figure>

          <figure>
            <div className="Content">
              <a href="https://knowit.hr">
                <img src={ Assets.knowit }
                     alt="KnowIT Logo" />
              </a>
            </div>
          </figure>


        </div>
      </div>

    </div>
  );
}
