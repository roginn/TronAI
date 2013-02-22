$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	
	var cell_size = 30;
	var interval = 150;
	var num_cols = Math.floor(w/cell_size);
	var num_rows = Math.floor(h/cell_size);
	
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

	function grid_set(x, y, v)
	{
		grid[y*num_cols+x] = v;
	}

	function grid_at(x, y)
	{
		return grid[y*num_cols+x];
	}
	
	function init()
	{
		clear_grid();
		create_snake();
		
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(iterate, interval);
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

		if(p1_lost || p2_lost || head_bang)
		{
			if(p1_lost ^ p2_lost)
				p1_lost ? score_p2++ : score_p1++;

			init();
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
				// if(grid_at(i, j) == p1)
				// 	paint_cell(i, j, "blue");
				// else if(grid_at(i, j) == p2)
				// 	paint_cell(i, j, "red");
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

		var score_text = "P1 " + score_p1 + " x " + score_p2 + " P2";
		ctx.fillStyle = "black";
		ctx.fillText(score_text, 5, h-5);		
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

		if(key == "65" && dir_p2 != "right") next_dir_p2 = "left";
		else if(key == "87" && dir_p2 != "down") next_dir_p2 = "up";
		else if(key == "68" && dir_p2 != "left") next_dir_p2 = "right";
		else if(key == "83" && dir_p2 != "up") next_dir_p2 = "down";

	});



	// AI FUNCTIONS

	function do_ia(){
		var p = head_p2;

		// count space
		var up = down = left = right = 0;

		if(p.x < num_cols-1 && grid_at(p.x+1, p.y) == 0)
			right = fill_count({x: p.x+1, y: p.y});

		if(p.x > 0 && grid_at(p.x-1, p.y) == 0)
			left = fill_count({x: p.x-1, y: p.y});

		if(p.y < num_rows-1 && grid_at(p.x, p.y+1) == 0)
			down = fill_count({x: p.x, y: p.y+1});

		if(p.y > 0 && grid_at(p.x, p.y-1) == 0)
			up = fill_count({x: p.x, y: p.y-1});

		var v_dir, v_value, h_dir, h_value, chosen_dir;
		v_dir 	= up > down ? "up" : "down";
		v_value = up > down ? up : down;
		h_dir   = right > left ? "right" : "left";
		h_value = right > left ? right : left;
		chosen_dir = v_value > h_value ? v_dir : h_dir;

		next_dir_p2 = chosen_dir;
	}

	function fill_count(seed)
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

		var count = 0;
		var count_red = count_black = 0;

		queue.enqueue(seed);
		while(queue.length > 0)
		{
			var p = queue.dequeue();
			if(red_black[p.y*num_rows+p.x] == 20)
				continue;

			red_black[p.y*num_rows+p.x] = 20;
			paint_cell(p.x, p.y, "yellow");

			// NOT RED_BLACK
			// count++;
			// RED_BLACK
			if((p.x + p.y) % 2 == 0)
				count_red++;
			else
				count_black++;

			function f(t){ queue.enqueue(t); }
			for_each_blank_neighbor(p, f);
		}

		// NOT RED_BLACK
		// return count;
		// RED_BLACK
		return Math.min(count_red, count_black);
	}

	function for_each_blank_neighbor(p, f)
	{
		if(p.x < num_cols-1 && grid_at(p.x+1, p.y) == 0)
			f({x: p.x+1, y: p.y});

		if(p.x > 0 && grid_at(p.x-1, p.y) == 0)
			f({x: p.x-1, y: p.y});

		if(p.y < num_rows-1 && grid_at(p.x, p.y+1) == 0)
			f({x: p.x, y: p.y+1});

		if(p.y > 0 && grid_at(p.x, p.y-1) == 0)
			f({x: p.x, y: p.y-1});
	}
});