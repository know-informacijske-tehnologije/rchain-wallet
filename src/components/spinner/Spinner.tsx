import './Spinner.scss';
import { ReactNode } from 'react';
import { OPERATION } from 'utils';
import * as Assets from 'assets';

interface SpinnerProps {
  op: OPERATION;
  children_initial?: ReactNode;
  children_done?: ReactNode;
}

export function Spinner(props: SpinnerProps) {
  switch (props.op) {
    case OPERATION.INITIAL:
      return (<>
        {props.children_initial}
      </>);
    case OPERATION.PENDING:
      return (<div className="Spinner">
        <img src={Assets.refresh} alt="Loading spinner"/>
      </div>)
    case OPERATION.DONE:
      return (<>
        {props.children_done}
      </>);
  }
}
