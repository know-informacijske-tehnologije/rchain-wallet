#!/bin/bash

BASEDIR="$(dirname "${BASH_SOURCE[0]}")"
BASEDIR=$(realpath $BASEDIR/..)

SSH_NAME="$1"

function gitdo() {
  if [ "$SSH_NAME" == "" ]; then
    git "$@"
  else
	  GIT_SSH_COMMAND="ssh -i ~/.ssh/id_$SSH_NAME" git "$@"
	fi
}

function is_directory() {
	if [ -d "$1" ]; then
		return 0
	fi
	return 1
}

function ask_yn() {
	read -p "$1 [Y/n]" -n 1 -r
	echo
	if [[ $REPLY =~ ^[Yy]$ ]]; then
		return 0
	else
		return 1
	fi
}

function rmrf() {
	echo "About to delete:"

	let count=0
	for p in "$@"; do
		local rp=$(realpath $p)
		echo -e "\t$rp"
		let count=count+$(find $rp | wc -l)
	done

	if ask_yn "Are you sure that you want to delete $count files?"; then
		rm -rf $@
	fi
}


if is_directory "$BASEDIR/dist"; then
  rmrf "$BASEDIR/dist"
fi


remote_name="$(git config --local remote.origin.url)"

gitdo clone "$remote_name" "$BASEDIR/dist"
cd "$BASEDIR/dist"
gitdo checkout preview
gitdo pull

cd "$BASEDIR"
npm run build

rmrf "$BASEDIR/dist/"*
cp -r "$BASEDIR/build/." "$BASEDIR/dist"

cd "$BASEDIR/dist"
gitdo add .
gitdo commit -m 'Update preview'
gitdo push
