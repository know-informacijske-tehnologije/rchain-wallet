// shortname: notif

export function info(title: string, text: string) {
	return <>
		<h3>{title}</h3>
		<p>{text}</p>
	</>;
}
