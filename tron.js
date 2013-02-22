$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	
	var cell_size = 30;
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
		game_loop = setInterval(paint2, 100);
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

	function move_head2(head, dir)
	{
		if(dir == "right") head.x++;
		else if(dir == "left") head.x--;
		else if(dir == "down") head.y++;
		else if(dir == "up") head.y--;
	}	

	function check_collision2(head)
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
	
	function paint2()
	{
		dir_p1 = next_dir_p1;
		dir_p2 = next_dir_p2;

		var new_head1 = move_head(head_p1, dir_p1);
		var new_head2 = move_head(head_p2, dir_p2);

		var p1_lost = check_collision2(new_head1);
		var p2_lost = check_collision2(new_head2);
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
				if(grid_at(i, j) == p1)
					paint_cell(i, j, "blue");
				else if(grid_at(i, j) == p2)
					paint_cell(i, j, "red");
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
});