var wins = [
	[[0, 0], [0, 1], [0, 2]],
	[[1, 0], [1, 1], [1, 2]],
	[[2, 0], [2, 1], [2, 2]],
	[[0, 0], [1, 0], [2, 0]],
	[[0, 1], [1, 1], [2, 1]],
	[[0, 2], [1, 2], [2, 2]],
	[[0, 0], [1, 1], [2, 2]],
	[[0, 2], [1, 1], [2, 0]],
];
var head = {
	board: new Array(3).fill(new Array(3).fill(' ')),
	children: [],
	number: 0,
};
var id = 1;
function Move(i, j, parent) {
	this.id = 0;
	this.parent = parent || null;
	this.letter = this.parent && this.parent.letter === 'X' ? 'O' : 'X';
	this.number = this.parent ? this.parent.number + 1 : 1;
	this.board = this.parent
		? this.parent.board.map(x => x.slice())
		: head.board.map(x => x.slice());
	this.board[i][j] = this.letter;
	this.children = [];
	this.res = null;
	this.ratio = 0;
	this.wins = 0;
	this.losses = 0;
	this.ties = 0;
	this.total = 0;
	this.learned = 0;
}

Move.prototype.add = function() {
	var over = this.number > 4 ? this.over() : false;
	if (!over) {
		this.board.forEach((r, i) =>
			r.forEach((s, j) => {
				if (s === ' ') {
					this.children.push(new Move(i, j, this));
				}
			})
		);
		this.children.length
			? this.children.forEach(c => c.add())
			: this.tally('tie');
	} else {
		this.tally();
	}
};

Move.prototype.over = function() {
	return (
		wins.filter(w => w.every(s => this.board[s[0]][s[1]] === this.letter))
			.length > 0
	);
};

Move.prototype.tally = function(tie) {
	var node = this;
	if (tie) {
		this.res = 'tie';
		while (node) {
			node.ties++;
			node.balance();
			node = node.parent;
		}
	} else {
		this.res = 'win';
		while (node) {
			node.letter === this.letter ? node.wins++ : node.losses++;
			node.balance();
			node = node.parent;
		}
	}
};

Move.prototype.balance = function() {
	this.total = this.wins + this.losses + this.ties;
	this.ratio = (this.wins - this.losses) / this.total;
};

Move.prototype.findRes = function() {
	if (this.res) {
		stats.leaves++;
	}
	if (this.children) {
		this.children.forEach(c => c.findRes());
	}
};

head.board.forEach((r, i) =>
	r.forEach((s, j) => head.children.push(new Move(i, j)))
);
head.children.forEach(x => x.add());
head.children.forEach(x => x.balance());

// console.log(head.children.map(x=>x.ratio))
var stats = { X: 0, O: 0, ties: 0, total: 0, leaves: 0, uniq: 0 };
function best(a) {
	var curr = a.reduce(function(acc, el) {
		return acc.ratio < el.ratio ? el : acc;
	});
	curr.learned++;
	// console.log(curr.number, curr.letter, 'COMPUTER')
	// curr.board.forEach(r=>console.log(r))
	if (curr.children.length) {
		best(curr.children);
	} else {
		stats.total++;
		if (curr.id === 0) {
			curr.id = id++;
			stats.uniq++;
			// console.log(stats.total)
		}
		if (curr.over()) {
			stats[curr.letter]++;
			// console.log(curr.letter + ' wins!')
			curr.tally();
		} else {
			// console.log('TIE')
			stats.ties++;
			curr.tally('tie');
		}
		curr.balance();
	}
}

for (var i = 0; i < 1000000; i++) {
	best(head.children);
}
console.log(head.children.map(x => x.ratio));
head.children.forEach(c => c.findRes());
console.log(head.children.map(x => x.learned));
stats;
