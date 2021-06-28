import './Expander.scss';
import { useState, createRef, useEffect } from 'react';
import plus from '../assets/plus.svg';
import minus from '../assets/minus.svg';

type ExpanderProps = {
	title: JSX.Element;
	content: JSX.Element;
	is_expanded?: boolean;
};

function Expander(props: ExpanderProps) {
	let [is_expanded, set_is_expanded] = useState(props.is_expanded || false);
	const content_ref = createRef<HTMLDivElement>();

	let toggle_expanded = () => {
		set_is_expanded(!is_expanded);
	};

	useEffect(() => {
		if (content_ref && content_ref.current) {
			const content = content_ref.current;
			const style = getComputedStyle(content);
			let target_height = "0px";

			if (is_expanded) {
				content.style.height = "auto";
				target_height = style.height;
				content.style.height = "0px";
				content.scrollIntoView({ block: "center", behavior: "smooth" });
			}

			requestAnimationFrame(() => {
				content.style.height = target_height;
			});
		}
	});

	return (
	<div className={is_expanded ? 'Expander Expanded' : 'Expander'}>
		<div className="Title" onClick={toggle_expanded}>
			{props.title}
			<button>
				<img src={is_expanded ? minus : plus}
						alt={is_expanded ? "Contract" : "Expand"}/>
			</button>
		</div>
		<div className="Content"
				ref={content_ref}>
			{props.content}
		</div>
	</div>)
}

export default Expander;
