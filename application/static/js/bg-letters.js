// drop letters animation function
const fallingLettersAnim = (option) => {
	// default option
	let default_option = {
		target_element: 'body', // target HTML element
		where_to_insert: 'img', // Insert after the specified element in target_element. If unspecified, insert at the end of the target_element. ('img' 'p' '#id' etc)
		letters_amount: 2, // Amount of letters (min 1 max 10)
		letters_speed: 2, // Speed of letters (min 1 max 10)
		letters_size: 1.0, // Size of letters (min 0.1)
		letters_type: 'aA', // Select letters (aA)
		letters_angle: true, // Random default angle / affect rotation mode
		letters_rotate_mode: 1, //Rotation mode (0=false 1=X 2=Y 3=XY)
		letters_rotate_deg: 180, // (0 = false 360 = 360deg)
		letters_rotate_reverse: true, // reverse rotation
		letters_color: 'random', // Color of letters (hex, rgba, name, random)
		letters_neon_light: true, // Emission of light from letters.
		letters_neon_color: 'random', // Color of letters (hex, rgba, name, random)
		animation_time: 600 // Animation time (s)
	};

	// merge option
	let op = Object.assign(default_option, option);

	// whether the target element exists
	if (!document.querySelector(op.target_element)) {
		console.log('no target element.');
		return;
	}

	// target element
	let target_element = document.querySelector(op.target_element);
	target_element.style.position = 'relative';
	target_element.style.overflow = 'hidden';

	// Insert after the specified element
	let insert_after_element = '';
	if (op.where_to_insert != '') {
		insert_after_element = target_element.querySelector(op.where_to_insert);
	}

	// main container
	let container = document.createElement('div');
	if (!insert_after_element) {
		target_element.appendChild(container);
	} else {
		insert_after_element.after(container);
	}
	container.style.position = 'absolute';
	container.style.top = 0;
	container.style.left = "-100%";
	container.style.width = '3000px';
	container.style.height = '100vh';
	container.style.overflow = 'hidden';
    container.style.zIndex = "-999"
    container.style.overflowX = "hidden";

	// letters container
	let letters_container = document.createElement('div');
	container.appendChild(letters_container);
	letters_container.style.position = 'absolute';
	letters_container.style.width = '100%';
	letters_container.style.height = '100%';

	// letter clone
	let letter = document.createElement('div');
	letter.style.position = 'absolute';
	letter.style.opacity = 1;
	letter.style.fontFamily = '';

	// letters
	let chars = '';
	if (op.letters_type.includes('a')) {
		chars += 'abcdefghijklmnopqrstuvwxyz';
	}
	if (op.letters_type.includes('A')) {
		chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	}

	let colors = [];
	if (op.letters_color == 'random' || op.letters_neon_color == 'random') {
		for (let i = 0; i < 110; i++) {
			colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
		}
	}

	let letters = '';
	for (var i = 0; i < 500; i++) {
		letters += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	let no = 0;
	let count = 0;
	op.animation_time *= 60;
	const update = () => {
		let rand1 = Math.floor(Math.random() * 110);
		let rand2 = Math.floor(Math.random() * 100);

		// font color
		let letters_color = op.letters_color;
		if (op.letters_color == 'random') {
			letters_color = colors[rand1];
		}

		// neon color
		let letters_neon_color = op.letters_neon_color;
		if (op.letters_neon_color == 'random') {
			letters_neon_color = colors[rand2];
		}

		// angle
		let angle = 0;
		if (op.letters_angle == true) {
			angle = Math.floor(Math.random() * 360);
		}

		// rotate set reverse
		if (rand2 % 2 == 0 && op.letters_rotate_reverse == true) {
			op.letters_rotate_deg = -(op.letters_rotate_deg);
		}

		// rotate set
		let angle_set = 0;
		let rotate_angle_set = '';
		if (op.letters_rotate_mode == 0) {
			rotate_angle_set = `rotateX(0deg)`;
		} else if (op.letters_rotate_mode == 1) {
			angle_set = `rotate(${angle}deg)`;
			rotate_angle_set = `rotateX(${angle + op.letters_rotate_deg}deg)`;
		} else if (op.letters_rotate_mode == 2) {
			angle_set = `rotate(${angle}deg)`;
			rotate_angle_set = `rotateY(${angle + op.letters_rotate_deg}deg)`;
		} else if (op.letters_rotate_mode == 3) {
			angle_set = `rotate(${angle}deg)`;
			rotate_angle_set = `rotate(${angle + op.letters_rotate_deg}deg)`;
		}

		// letter drop
		if (count % (11 - op.letters_amount) == 0) {

			let letter_clone = letter.cloneNode();
			letter_clone.innerText = letters[no];
			letter_clone.style.fontSize = `${0.1 * rand2 * op.letters_size}vw`;
			letter_clone.style.left = `${rand1 - 10}%`;
			letter_clone.style.color = letters_color;
			letter_clone.style.transform = `rotate(${angle}deg)`;
			if (op.letters_neon_light == true) {
				letter_clone.style.textShadow = `
				0 0 1.0em ${letters_neon_color},
				0 0 0.5em ${letters_neon_color},
				0 0 0.1em ${letters_neon_color}
				`;
			}
			letters_container.appendChild(letter_clone);

			let letters_anim = letter_clone.animate(
				[
					{ top: `-20%`, transform: angle_set },
					{ top: `100%`, transform: rotate_angle_set }
				],
				{
					fill: 'forwards',
					duration: 6000 / op.letters_speed
				}
			);

			letters_anim.onfinish = (event) => {
				letter_clone.remove();
			};

			if (no < 499) {
				no++;
			} else {
				no = 1;
			}
		}

		// stop or run animation
		count++;
		if (op.animation_time >= count) {
			requestAnimationFrame(update);
		} else {
			cancelAnimationFrame(update);
		}
	};

	update();
};

//////////////////////////// call function

let option = {
	target_element: '#container', // target HTML element
	where_to_insert: 'img', // Insert after the specified element in target_element. If unspecified, insert at the end of the target_element. ('img' 'p' '#id' etc)
	letters_amount: 5, // Amount of letters (min 1 max 10)
	letters_speed: 5, // Speed of letters (min 1 max 10)
	letters_size: 1.0, // Size of letters (min 0.1)
	letters_type: 'aA', // Only lowercase and uppercase English letters
	letters_angle: true, // Random default angle / affect rotation mode
	letters_rotate_mode: 1, //Rotation mode (0=false 1=X 2=Y 3=XY)
	letters_rotate_deg: 180, // (0 = false 360 = 360deg)
	letters_rotate_reverse: true, // reverse rotation
	letters_color: 'random', // Color of letters (hex, rgba, name, random)
	letters_neon_light: true, // Emission of light from letters.
	letters_neon_color: 'random', // Color of letters (hex, rgba, name, random)
	animation_time: 600 // Animation time (s)
};

fallingLettersAnim(option);
