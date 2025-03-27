

export function create_choice_menu(elem, choices, callback, use_url) {
	const buttons = []
	let selected_value = choices[0]

	function update() {
		Object.values(buttons).forEach((item) => {
			item.classList.remove('selected')
		})
		buttons[selected_value].classList.add('selected')

		if (use_url) {
			document.location.hash = '#' + selected_value
		}
	}

	function set_choice(choice) {
		callback(choice)
		selected_value = choice
		update()
	}


	function set_choice_from_url() {
		const url_hash = document.location.hash
		
		if(url_hash !== "") {
			const sc_from_url = url_hash.substr(1)
			if( buttons.hasOwnProperty(sc_from_url)) {
				set_choice(sc_from_url)
				return sc_from_url
			}	
		}
		return false
	}

	choices.forEach((strat) => {
		const item = document.createElement('li')
		item.textContent = strat
		item.addEventListener('click', () => set_choice(strat))
		elem.appendChild(item)
		buttons[strat] = item
	})
	
	elem.classList.add('selector')

	if(use_url) {
		window.addEventListener('popstate', set_choice_from_url)
		set_choice_from_url()
	}

	update()
}