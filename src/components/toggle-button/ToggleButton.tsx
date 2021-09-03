import * as Assets from 'assets';

interface ToggleButtonProps {
	val: boolean;
	setval: (val: boolean) => void;
	hanging?: boolean;
	alt_text?: string;
	on_img?: string;
	off_img?: string;
	className?: string;
}

export function ToggleButton(props: ToggleButtonProps) {
	let hanging = props.hanging || false;
	let alt_text = props.alt_text || "Toggle";
	let on_img = props.on_img || Assets.eye_crossed;
	let off_img = props.off_img || Assets.eye;
	let classname = "Toggle";
	if (hanging) { classname += " Hanging"; }
	if (props.className) { classname += " " + props.className; }

	function toggle() {
		props.setval(!props.val);
	}

	return (
		<button className={classname} onClick={toggle}>
			<img src={props.val ? on_img : off_img} alt={alt_text} />
		</button>
	);
}
