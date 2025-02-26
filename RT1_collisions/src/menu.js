
import {h} from "../lib/preact_10.13.0/preact.module.js"
import {signal} from "../lib/preact_10.13.0/signals.module.js"


// function Menu(props) {

// 	const {choices} = props

// 	return h('ul', {}, choices.map(ch => {
// 		h('li', {}, ch)
// 	}))
// }




function scene_choser(elem, rt, initial_scene) {

	const buttons = {}

	function update() {
		Object.values(buttons).forEach((item) => {
			item.classList.remove('selected')
		})
		if (rt.scene_name) {
			buttons[rt.scene_name].classList.add('selected')

			document.location.hash = rt.scene_name
		}
	}

	function set_scene(sc_name) {
		if(sc_name != rt.scene_name) {
			rt.draw_scene({scene_name: sc_name})
			update()
		}
	}

	function set_scene_from_url() {
		const url_hash = document.location.hash
		
		if(url_hash !== "") {
			const sc_from_url = url_hash.substr(1)
			if( buttons.hasOwnProperty(sc_from_url)) {
				set_scene(sc_from_url)
				return sc_from_url
			}	
		}
		return false
	}

	window.addEventListener('popstate', set_scene_from_url)

	rt.get_scene_names().forEach((scn) => {
		const item = document.createElement('li')
		item.textContent = scn
		item.addEventListener('click', () => set_scene(scn))
		elem.appendChild(item)
		buttons[scn] = item
	})

	if((! set_scene_from_url()) && initial_scene !== undefined) {
		set_scene(initial_scene)
	}
}

function reflection_choser(elem, rt) {

	const buttons = []

	function update() {
		Object.values(buttons).forEach((item) => {
			item.classList.remove('selected')
		})
		buttons[rt.num_reflections].classList.add('selected')
	}

	function set_num_reflections(num_reflections) {
		if(num_reflections >= 0 && num_reflections != rt.num_reflections) {
			rt.draw_scene({
				scene_name: rt.scene_name,
				num_reflections: num_reflections,
			})
			update()
		}
	}

	const available_num_reflections = [0, 1, 2, 3, 4]

	available_num_reflections.forEach((nr) => {
		const item = document.createElement('li')
		item.textContent = nr.toFixed(0)
		item.addEventListener('click', () => set_num_reflections(nr))
		elem.appendChild(item)
		buttons[nr] = item
	})

	update()
}

function shading_mode_menu(elem, rt) {
	const buttons = []

	function update() {
		Object.values(buttons).forEach((item) => {
			item.classList.remove('selected')
		})
		buttons[rt.shading_mode].classList.add('selected')
	}

	function set_shading_mode(shading_mode) {
		rt.draw_scene({
			scene_name: rt.scene_name,
			shading_mode: shading_mode,
		})
		update()
	}

	const available_strategies = ["Normals", "Blinn Phong", "Phong"]

	available_strategies.forEach((strat) => {
		const item = document.createElement('li')
		item.textContent = strat
		item.addEventListener('click', () => set_shading_mode(strat))
		elem.appendChild(item)
		buttons[strat] = item
	})
	
	update()
}

export function init_menu(rt, initial_scene) {
	const elem_scenes = document.querySelector('#menu-scenes')
	scene_choser(elem_scenes, rt, initial_scene)

	const elem_reflections = document.querySelector('#menu-reflections')
	reflection_choser(elem_reflections, rt)

	shading_mode_menu(document.getElementById('menu-shading'), rt)
}
