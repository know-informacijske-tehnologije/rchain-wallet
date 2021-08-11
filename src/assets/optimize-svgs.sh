#!/bin/bash

BASEDIR="$(dirname "${BASH_SOURCE[0]}")"

overwrite=false
if [ "$1" == "overwrite" ]; then
	overwrite=true
fi

for img in $(find $BASEDIR -name "*.svg"); do
	cat $img | svgcleaner -c - > "$img.opti"
	if [ ! -s "$img.opti" ]; then
		echo
		echo "UNABLE TO CREATE IMAGE $img"
		echo
		rm "$img.opti"
	else
		rm $img
		mv "$img.opti" "$img"
	fi
done
