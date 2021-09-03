import "./ToggleString.scss";
import { useToggle } from 'utils';
import { ToggleButton } from 'components';

export interface ToggleStringProps {
    str: string|null;
    toggle: ReturnType<typeof useToggle>;
    desc: string;
    className?: string;
};

export function ToggleString({ str, toggle, desc, className }: ToggleStringProps) {
    let classname = "ToggleString ";
    if (className) { classname += className; }

    if (!str) {
      return <div className={classname}>
        <p>Unknown</p>
      </div>;
    }


    if (toggle.value) {
      classname += " Expanded";
      return <div className={classname}>
        <p>{str}</p>
        <ToggleButton hanging={false}
                      val={toggle.value}
                      setval={toggle.set}
                      alt_text={"Expand " + desc}/>
      </div>;
    }

    let str1 = str.substr(0, 5);
    let str2 = str.substr(-5);

    return <div className={classname}>
      <p>
        {str1}
        <ToggleButton hanging={false}
                      val={toggle.value}
                      setval={toggle.set}
                      alt_text={"Collapse " + desc}/>
        {str2}
      </p>
    </div>;
  }
