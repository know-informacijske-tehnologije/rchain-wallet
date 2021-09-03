import "./Tabs.scss";
import { ReactNode, useState } from 'react';

interface TabDef {
    icon: string;
    text: string;
    content: ReactNode;
};

export interface TabsProps {
    tabs: TabDef[];
    className?: string;
};

export function Tabs(props: TabsProps) {
    const [current_tab, set_current_tab] = useState(0);
    const tabs = props.tabs;

    function SelectTab(index: number) {
        return () => {
            if (current_tab !== index) {
                set_current_tab(index);
            }
        }
    }

    function TabList() {
        let tab_els = [];
        for (let i=0; i<tabs.length; i++) {
            let tab = tabs[i];
            let is_current = current_tab === i;
            let tab_class = is_current ? "Tab Current" : "Tab";

            tab_els.push(
                <button className={tab_class}
                        onClick={SelectTab(i)}
                        title={tab.text}
                        key={tab.text + tab_class}>
                    <img src={tab.icon} alt="" />
                    <span>{tab.text}</span>
                    <img className="Spacer"
                         src={tab.icon}
                         alt="" />
                </button>
            );
        }

        return tab_els;
    }

    function CurrentTab() {
        return tabs[current_tab]?.content || null;
    }

    let cn = "TabsContainer ";
    if (props.className) { cn += props.className; }


    return <div className={cn}>
        <div className="Tabs">
            {TabList()}
        </div>
        <div className="TabContent">
            {CurrentTab()}
        </div>
    </div>
}
