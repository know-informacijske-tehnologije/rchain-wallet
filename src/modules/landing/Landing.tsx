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

const lipsum1 = "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.";
const lipsum2 = "To a degree, some methods for creating work, such as employing intuition, are shared across the disciplines within the applied arts and fine art. Mark Getlein, writer, suggests the principles of design are almost instinctive.";

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
          <h4 className="Dynamic">{lipsum1}</h4>
          <button onClick={navigate(history, "/create")}>Create</button>
        </div>

        <div className="Card">
          <img src={Assets.globe} alt="Globe"/>
          <h2>Access your wallet</h2>
          <h4 className="Dynamic">{lipsum1}</h4>
          <button onClick={navigate(history, "/access")}>Access</button>
        </div>
      </div>

      <h2>FAQ</h2>

      <Components.Expander
        title={<h3 className="NoMargin Left">What is MyRChainWallet?</h3>}
        content={<p>{lipsum2}</p>}/>

      <Components.Expander
        title={<h3 className="NoMargin Left">How do we handle private keys?</h3>}
        content={<p>{lipsum2}</p>}/>

      <Components.Expander
        title={<h3 className="NoMargin Left">How can I send a transaction?</h3>}
        content={<p>{lipsum2}</p>}/>

      <Components.Expander
        title={
          <h3 className="NoMargin Left">
            Do you have a Support forum?
          </h3>}
        content={
          <p>
            {lipsum2}
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
                <li><a href="/">Discover 1</a></li>
                <li><a href="/">Discover 2</a></li>
                <li><a href="/">Discover 3</a></li>
                <li><a href="/">Discover 4</a></li>
              </ul>
            </div>

          </figure>

          <figure>
            <figcaption>
              <h4>Affiliates</h4>
            </figcaption>

            <div className="Content">
              <ul>
                <li><a href="/">Affiliates 1</a></li>
                <li><a href="/">Affiliates 2</a></li>
                <li><a href="/">Affiliates 3</a></li>
                <li><a href="/">Affiliates 4</a></li>
              </ul>
            </div>
          </figure>

          <figure>
            <figcaption>
              <h4>Donate</h4>
            </figcaption>

            <div className="Content">
              <p>{lipsum2}</p>
            </div>
          </figure>
        </div>
      </div>

    </div>
  );
}