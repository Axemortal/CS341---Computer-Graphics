

export function create_choice_menu(elem, choices, callback) {
	const buttons = []
	let selected_value = choices[0]

	function update() {
		Object.values(buttons).forEach((item) => {
			item.classList.remove('selected')
		})
		buttons[selected_value].classList.add('selected')
	}

	function set_choice(choice) {
		callback(choice)
		selected_value = choice
		update()
	}

	choices.forEach((strat) => {
		const item = document.createElement('li')
		item.textContent = strat
		item.addEventListener('click', () => set_choice(strat))
		elem.appendChild(item)
		buttons[strat] = item
	})
	
	elem.classList.add('selector')

	update()
}