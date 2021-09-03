import './Spinner.scss';
import { ReactNode } from 'react';
import { OPERATION } from 'utils';
import * as Assets from 'assets';

interface SpinnerProps {
  op: OPERATION;
  children_initial?: ReactNode;
  children_done?: ReactNode;
  centered?: boolean;
  style?: Record<string, any>;
  className?: string;
}

export function Spinner(props: SpinnerProps) {
  let cn = "Spinner ";
  if (props.centered) { cn += "Centered "; }
  if (props.className) { cn += props.className; }
  let style = props.style || {};

  switch (props.op) {
    case OPERATION.INITIAL:
      return (<>
        {props.children_initial}
      </>);
    case OPERATION.PENDING:
      return (<div className={cn} style={style}>
        <img src={Assets.refresh} alt="Loading spinner"/>
      </div>)
    case OPERATION.DONE:
      return (<>
        {props.children_done}
      </>);
  }
}
