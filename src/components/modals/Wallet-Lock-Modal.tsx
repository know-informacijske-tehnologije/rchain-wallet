import { useContext } from 'react';
import { LayoutContext } from 'index';
import { ModalBase } from './ModalBase';
import { WalletLockForm, useWalletLock } from 'components';

interface WalletLockResult {
    name: string;
    password: string;
};

export interface WalletLockModalProps extends ModalBase<WalletLockResult> {
    title: string;
    text: string;
    button: string;
}

export function WalletLockModal(props: WalletLockModalProps) {
    const layout = useContext(LayoutContext);
    const lock = useWalletLock();

    function finish() {
        props.onFinish({
            name: lock.name.value,
            password: lock.password1.value
        });
        layout.pop_modal();
    }

    return (<div className="Card Centered" onClick={(ev)=>ev.stopPropagation()}>
        <h3 className="Title">
            { props.title }
        </h3>
        <div className="Body Column Center-X Center-Y">
            <p className="Alt NoMargin">
                { props.text }
            </p>
            <WalletLockForm state={lock} />
            <p></p>
            <button className="Action"
                    onClick={() => finish()}
                    disabled={!lock.registration_valid}>
                { props.button }
            </button>
        </div>
    </div>);
}
