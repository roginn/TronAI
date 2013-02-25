$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	
	var cell_size = 30;
	var interval = 300;
	var num_cols = Math.floor(w/cell_size);
	var num_rows = Math.floor(h/cell_size);

	var game = {
		// strategy: fill_difference,
		strategy: voronoi_difference,
		minimax_depth: 6,
		end: false
	};
	
	var grid = new Array(num_cols*num_rows);

	//players
	var p1 = 1;
	var p2 = 2;
	var head_p1, head_p2;
	var dir_p1, dir_p2;
	var next_dir_p1, next_dir_p2;
	var score_p1 = score_p2 = 0

	// start game!
	init();

	function map_set(map, x, y, v) { map[y*num_cols+x] = v; }
	function map_at(map, x, y) { return map[y*num_cols+x]; }

	function grid_set(x, y, v) { map_set(grid, x, y, v); }
	function grid_at(x, y) { return map_at(grid, x, y); }

	function show_endgame(result)
	{
		ctx.font = "40pt Arial";
		ctx.textAlign = "center";
		if(result == "human"){
			ctx.fillStyle = "blue";
			ctx.fillText("You win!", w/2, h/2);	
		}
		else if(result == "machine"){
			ctx.fillStyle = "red";
			ctx.fillText("Machine wins!", w/2, h/2);		
		}
		else{
			ctx.fillStyle = "grey";
			ctx.fillText("Draw!", w/2, h/2);		
		}

		ctx.font = "20pt Arial";
		ctx.fillStyle = "black";
		ctx.fillText("press space to play again", w/2, 3*h/4);
	}
	
	function init()
	{
		game.end = false;
		clear_grid();
		create_snake();
		iterate();
	}
	
	function clear_grid()
	{
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);

		var length = num_cols*num_rows;
		for(var i=0; i < length; i++)
		{
			grid[i] = 0;
		}
	}

	function create_snake()
	{
		var length = 5; //Length of the snake
		for(var i = 0; i < length; i++)
		{
			grid_set(i, 0, p1);
			grid_set(num_cols-1-i, num_rows-1, p2);
		}

		head_p1 = {x: length-1, y: 0};
		head_p2 = {x: num_cols-length, y: num_rows-1};

		next_dir_p1 = dir_p1 = "right";
		next_dir_p2 = dir_p2 = "left";
	}

	function move_head(head, dir)
	{
		var new_pos = {x: head.x, y: head.y}
		if(dir == "right") new_pos.x++;
		else if(dir == "left") new_pos.x--;
		else if(dir == "down") new_pos.y++;
		else if(dir == "up") new_pos.y--;

		return new_pos;
	}


	function check_collision(head)
	{
		if(head.x < 0 || head.x >= num_cols || head.y < 0 || head.y >= num_rows)
			return true;

		var at_pos = grid_at(head.x, head.y);
		if(at_pos == p1 || at_pos == p2)
			return true;

		return false;
	}

	function check_heads(head1, head2)
	{
		if(head1.x == head2.x && head1.y == head2.y)
			return true;

		return false;
	}
	
	function iterate()
	{
		var start = new Date().getTime();
		do_ia();		

		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);

		dir_p1 = next_dir_p1;
		dir_p2 = next_dir_p2;

		var new_head1 = move_head(head_p1, dir_p1);
		var new_head2 = move_head(head_p2, dir_p2);

		var p1_lost = check_collision(new_head1);
		var p2_lost = check_collision(new_head2);
		var head_bang = check_heads(new_head1, new_head2);

		if(head_bang || (p1_lost && p2_lost)){
			show_endgame("draw");			
			game.end = true;
			return;
		}

		if(p1_lost || p2_lost) {
			var winner = p1_lost ? "machine" : "human";
			show_endgame(winner);			
			game.end = true;
			return;
		}

		grid_set(new_head1.x, new_head1.y, p1);
		grid_set(new_head2.x, new_head2.y, p2);
		head_p1 = new_head1;
		head_p2 = new_head2;

		for(var i = 0; i < num_cols; i++)
		{
			for(var j = 0; j < num_rows; j++)
			{
				switch(grid_at(i, j))
				{
					case p1:
						paint_cell(i, j, "blue");
						break;
					case p2:
						paint_cell(i, j, "red");
						break;
					case 10:
						paint_cell(i, j, "green");
						break;
					case 20:
						paint_cell(i, j, "yellow");
						break;
				}
			}
		}

		// var score_text = "P1 " + score_p1 + " x " + score_p2 + " P2";
		// ctx.fillStyle = "black";
		// ctx.fillText(score_text, 5, h-5);		

		var elapsed = new Date().getTime() - start;
		if(!game.end){
			setTimeout(iterate, Math.max(interval - elapsed));
		}
	}

	function paint_cell(x, y, color)
	{
		ctx.fillStyle = color;
		ctx.fillRect(x*cell_size, y*cell_size, cell_size, cell_size);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cell_size, y*cell_size, cell_size, cell_size);
	}
		
	// game controls
	// (arrows for player1 and WASD for player2)
	$(document).keydown(function(e){
		var key = e.which;
		if(key == "37" && dir_p1 != "right") next_dir_p1 = "left";
		else if(key == "38" && dir_p1 != "down") next_dir_p1 = "up";
		else if(key == "39" && dir_p1 != "left") next_dir_p1 = "right";
		else if(key == "40" && dir_p1 != "up") next_dir_p1 = "down";

		// if(key == "65" && dir_p2 != "right") next_dir_p2 = "left";
		// else if(key == "87" && dir_p2 != "down") next_dir_p2 = "up";
		// else if(key == "68" && dir_p2 != "left") next_dir_p2 = "right";
		// else if(key == "83" && dir_p2 != "up") next_dir_p2 = "down";

		if(key == "32" && game.end) { init(); }
		e.preventDefault();
	});



	// AI FUNCTIONS

	function do_ia(){
		var p = head_p2;

		// count space
		var up = down = left = right = 0;

		if(p.x < num_cols-1 && grid_at(p.x+1, p.y) == 0)
			right = fill_count(grid, {x: p.x+1, y: p.y});

		if(p.x > 0 && grid_at(p.x-1, p.y) == 0)
			left = fill_count(grid, {x: p.x-1, y: p.y});

		if(p.y < num_rows-1 && grid_at(p.x, p.y+1) == 0)
			down = fill_count(grid, {x: p.x, y: p.y+1});

		if(p.y > 0 && grid_at(p.x, p.y-1) == 0)
			up = fill_count(grid, {x: p.x, y: p.y-1});

		var v_dir, v_value, h_dir, h_value, chosen_dir;
		v_dir 	= up > down ? "up" : "down";
		v_value = up > down ? up : down;
		h_dir   = right > left ? "right" : "left";
		h_value = right > left ? right : left;
		chosen_dir = v_value > h_value ? v_dir : h_dir;

		next_dir_p2 = chosen_dir;


		next_dir_p2 = minimax(grid, head_p1, head_p2, game.minimax_depth);

	}

	function fill_count(map, seed)
	{
		var red_black = new Array(num_cols*num_rows);
		var queue = {
			length: 0,
			index: 0,
			items: new Array(),

			enqueue: function(item)
			{
				queue.items.push(item);
				queue.length++;
			},

			dequeue: function()
			{
				if(queue.length == 0)
					return;

				queue.length--;
				return queue.items[queue.index++];
			}
		};

		var count_red = count_black = 0;

		queue.enqueue(seed);
		while(queue.length > 0)
		{
			var p = queue.dequeue();
			if(red_black[p.y*num_rows+p.x] == 20)
				continue;

			red_black[p.y*num_rows+p.x] = 20;
			// paint_cell(p.x, p.y, "yellow");

			if((p.x + p.y) % 2 == 0)
				count_red++;
			else
				count_black++;

			function f(t){ queue.enqueue(t); }
			for_each_blank_neighbor(map, p, f);
		}

		return Math.min(count_red, count_black);
	}

	function for_each_blank_neighbor(map, p, f)
	{
		if(p.x < num_cols-1 && map_at(map, p.x+1, p.y) == 0)
			f({x: p.x+1, y: p.y});

		if(p.x > 0 && map_at(map, p.x-1, p.y) == 0)
			f({x: p.x-1, y: p.y});

		if(p.y < num_rows-1 && map_at(map, p.x, p.y+1) == 0)
			f({x: p.x, y: p.y+1});

		if(p.y > 0 && map_at(map, p.x, p.y-1) == 0)
			f({x: p.x, y: p.y-1});
	}

	function makeState(_map, _head1, _head2, _direction)
	{
		return {
			map: _map.slice(),
			head1: {x: _head1.x, y: _head1.y},
			head2: {x: _head2.x, y: _head2.y},
			direction: _direction
		};
	}

	function minimax(init_map, head1, head2, max_depth)
	{
		var s0 = new makeState(init_map, head1, head2);
		var mov = new Array();
		var p = head2;

		if(p.x < num_cols-1 && map_at(init_map, p.x+1, p.y) == 0)
			mov.push(makeState(init_map, head1, {x: p.x+1, y: p.y}, "right"));

		if(p.x > 0 && map_at(init_map, p.x-1, p.y) == 0)
			mov.push(makeState(init_map, head1, {x: p.x-1, y: p.y}, "left"));

		if(p.y < num_rows-1 && map_at(init_map, p.x, p.y+1) == 0)
			mov.push(makeState(init_map, head1, {x: p.x, y: p.y+1}, "down"));

		if(p.y > 0 && map_at(init_map, p.x, p.y-1) == 0)
			mov.push(makeState(init_map, head1, {x: p.x, y: p.y-1}, "up"));


		var dir_to_go;
		var max_value = -1 * num_rows * num_cols; // -infinity

		if(mov.length == 1){
			dir_to_go = mov[0].direction;
		} else {
			for(var i = 0; i < mov.length; i++) {
				var this_value = minimax_iter(mov[i], 2, max_depth, max_value);
				if(this_value > max_value){
					dir_to_go = mov[i].direction;
					max_value = this_value;
				}
			}
		}

		return dir_to_go;
	}	

	function minimax_iter(state, cur_depth, max_depth, alpha_value)
	{
		if(cur_depth < max_depth){

			var p;
			var mov = new Array();

			if(cur_depth % 2 == 0){
				// player 1's ply
				p = state.head1;

				if(p.x < num_cols-1 && map_at(state.map, p.x+1, p.y) == 0){
					var next_state = makeState(state.map, {x: p.x+1, y: p.y}, state.head2, "right");
					map_set(next_state.map, p.x+1, p.y, p1);
					mov.push(next_state);
				}

				if(p.x > 0 && map_at(state.map, p.x-1, p.y) == 0){
					var next_state = makeState(state.map, {x: p.x-1, y: p.y}, state.head2, "left");
					map_set(next_state.map, p.x-1, p.y, p1);
					mov.push(next_state);					
				}

				if(p.y < num_rows-1 && map_at(state.map, p.x, p.y+1) == 0){
					var next_state = makeState(state.map, {x: p.x, y: p.y+1}, state.head2, "down");
					map_set(next_state.map, p.x, p.y+1, p1);
					mov.push(next_state);					
				}

				if(p.y > 0 && map_at(state.map, p.x, p.y-1) == 0){
					var next_state = makeState(state.map, {x: p.x, y: p.y-1}, state.head2, "up");
					map_set(next_state.map, p.x, p.y-1, p1);
					mov.push(next_state);					
				}

				var min_value = num_rows * num_cols; // +infinity
				for(var i = 0; i < mov.length; i++) {
					var this_value = minimax_iter(mov[i], cur_depth+1, max_depth, 0);

					//alpha-beta prunning
					if(this_value < alpha_value){
						return this_value;
					}

					if(this_value < min_value){
						min_value = this_value;
					}
				}

				return min_value;

			} else {
				// player 2's ply
				p = state.head2;

				if(p.x < num_cols-1 && map_at(state.map, p.x+1, p.y) == 0){
					var next_state = makeState(state.map, state.head1, {x: p.x+1, y: p.y}, "right");
					map_set(next_state.map, p.x+1, p.y, p2);
					mov.push(next_state);
				}

				if(p.x > 0 && map_at(state.map, p.x-1, p.y) == 0){
					var next_state = makeState(state.map, state.head1, {x: p.x-1, y: p.y}, "left");
					map_set(next_state.map, p.x-1, p.y, p2);
					mov.push(next_state);					
				}

				if(p.y < num_rows-1 && map_at(state.map, p.x, p.y+1) == 0){
					var next_state = makeState(state.map, state.head1, {x: p.x, y: p.y+1}, "down");
					map_set(next_state.map, p.x, p.y+1, p2);
					mov.push(next_state);					
				}

				if(p.y > 0 && map_at(state.map, p.x, p.y-1) == 0){
					var next_state = makeState(state.map, state.head1, {x: p.x, y: p.y-1}, "up");
					map_set(next_state.map, p.x, p.y-1, p2);
					mov.push(next_state);					
				}

				var max_value = -1 * num_rows * num_cols; // -infinity
				for(var i = 0; i < mov.length; i++) {
					var this_value = minimax_iter(mov[i], cur_depth+1, max_depth, max_value);
					if(this_value > max_value){
						max_value = this_value;
					}
				}

				return max_value;
			}

		} else {
			// evaluate and return result
			return game.strategy(state);
		}
	}

	function fill_difference(state)
	{
		var fill_p1 = fill_count(state.map, state.head1);
		var fill_p2 = fill_count(state.map, state.head2);

		return fill_p2 - fill_p1;
	}

	function voronoi_difference(state)
	{
		var map_p1 = state.map.slice();
		var map_p2 = state.map.slice();


		voronoi_count(map_p1, {pos: state.head1, dist: 10});
		voronoi_count(map_p2, {pos: state.head2, dist: 10});

		var count = 0;
		for(var i = 0; i < num_rows; i++){
			for(var j = 0; j < num_cols; j++){
				var dist_p1 = map_at(map_p1, j, i);
				var dist_p2 = map_at(map_p2, j, i);

				if(dist_p1 <= 10 && dist_p2 <= 10)
					continue;

				if(dist_p2 <= 10){
					count--;
				} else if(dist_p1 <= 10){
					count++;
				} else {
					if(dist_p2 < dist_p1)
						count++;
					else if(dist_p2 > dist_p1)
						count--;
				}
			}
		}

		return count;
	}

	function voronoi_count(map, seed)
	{
		var queue = {
			length: 0,
			index: 0,
			items: new Array(),

			enqueue: function(item)
			{
				queue.items.push(item);
				queue.length++;
			},

			dequeue: function()
			{
				if(queue.length == 0)
					return;

				queue.length--;
				return queue.items[queue.index++];
			}
		};

		queue.enqueue(seed);
		while(queue.length > 0)
		{
			var p = queue.dequeue();
			var d = p.dist;
			if(map_at(map, p.pos.x, p.pos.y) >= 10)	
				continue;

			map_set(map, p.pos.x, p.pos.y, d);

			function f(t){ queue.enqueue({pos: t, dist: d+1}); }
			for_each_blank_neighbor(map, p.pos, f);
		}
	}	
});
