import { useContext } from 'react';
import { LayoutContext } from 'index';
import { ModalBase } from './ModalBase';
import { PassConfirmForm, usePassConfirm } from 'components';

export interface PassConfirmModalProps extends ModalBase<string> {
    title: string;
    text: string;
    button: string;
}

export function PassConfirmModal(props: PassConfirmModalProps) {
    const layout = useContext(LayoutContext);
    const pc = usePassConfirm();

    function finish() {
        props.onFinish(pc.password1.value);
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
            <PassConfirmForm state={pc} />
            <p></p>
            <button className="Action"
                    onClick={() => finish()}
                    disabled={!pc.valid}>
                { props.button }
            </button>
        </div>
    </div>);
}
