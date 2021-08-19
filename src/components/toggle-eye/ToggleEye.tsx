import * as Assets from 'assets';

export function ToggleEye(props: { val: boolean, setval: (val: boolean) => void, hanging: boolean }) {
	function toggle() {
		props.setval(!props.val);
	}

	return (<button className={props.hanging ? "Toggle Hanging" : "Toggle"} onClick={toggle}>
		<img src={props.val ? Assets.eye_crossed : Assets.eye} alt="Show password toggle" />
	</button>)
}
