import './ModalHost.scss';
import { useContext } from 'react';
import { LayoutContext } from 'index';

export function ModalHost() {
    let layout = useContext(LayoutContext);
    if (layout.modal_stack.length === 0) { return <></>; }
    let modal = layout.modal_stack[layout.modal_stack.length - 1];

    function handle_click_outside() {
        if (modal.props.noCloseOnClickOutside) { return; }
        modal.props.onFinish(null);
        layout.pop_modal();
    }

    return <div className={"ModalHost " + (modal.props.hostClassName || "")}
                onClick={handle_click_outside}>
        <modal.component {...modal.props} />
    </div>;
}
