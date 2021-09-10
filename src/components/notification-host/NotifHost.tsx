import './NotifHost.scss';
import * as Assets from 'assets';
import { useContext } from 'react';
import { LayoutContext } from 'index';

export function NotifHost() {
    let layout = useContext(LayoutContext);

    let notifs = [];
    for (let notif of layout.notif_stack) {
        notifs.push(
            <div className="Notif" key={notif.__id}>
                <button className="Toggle NotifClose"
                        onClick={()=>layout.remove_notif(notif)}>
                    <img src={ Assets.cancel } alt="Close notification" />
                </button>
                { notif.content }
            </div>
        );
    }

    return <div className="NotifHost">
        { notifs }
    </div>;
}
