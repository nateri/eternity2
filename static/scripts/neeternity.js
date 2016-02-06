// About: Neeternity web page implementation
// Author: Nathan Rickey
// http://therickeys.com/first/neeternity


// Someone else's javascript thoughts
// http://www.toptal.com/javascript/10-most-common-javascript-mistakes


/////////////////////////////////////////
// Global statics and states
var vm = {
  UrlRoot : m.prop("http://therickeys.com/static/data/"), // Test locally via http-server . --cors
  PiecesFile : m.prop("pieces.json"),
	Status : m.prop("loading"), // overall state of the view
	Tiles : m.prop([]), // list of legend tiles (id+colored sides+rotation+tooltip) in the view
	MainElem : m.prop(document.body), // where to place Landing/View
	LegendDivId : m.prop("#legend_div"), // where to place Legend element (div id string)
	BoardsDivId : m.prop("#boards_div"), //
	TileSize : m.prop(40), // in pixels
	TilePadSize : m.prop(10), // in pixels
	CornerHighlight : m.prop(new Rune.Color(255, 0, 0)),
	BorderHighlight : m.prop(new Rune.Color(0, 255, 0)),
}

/////////////////////////////////////////
// Puzzle Piece Edge Colors @TODO: Serialize
// from http://tools.medialab.sciences-po.fr/iwanthue/
vm.EdgeColors = m.prop(["#080604", "#10467A", "#53C811", "#F55B38", "#861917", "#C0D8C0", "#979F55", "#F5D32D", "#0B5B1B", "#6FC7CA", "#F51491", "#9E477D", "#704B0E", "#246162", "#FDC374", "#7946AA", "#2D81F3", "#503537", "#D9ADC6", "#A1DE35", "#72D38A", "#B95051", "#C98435"])

	/////////////////////////////////////////
	// Resizable frame split via split.js
	// https://nathancahill.github.io/Split.js/
	// https://github.com/nathancahill/Split.js/blob/master/examples/jsfiddle.html
	// http://stackoverflow.com/questions/12194469/best-way-to-do-a-split-pane-in-html
	//
	// Uses vm->LegendDivId & vm->BoardsDivId
	var SplitNeeternityContent = function () {
	console.debug("[SplitNeeternityContent]")
	Split([vm.LegendDivId(), vm.BoardsDivId()], {
		direction : 'vertical',
		minSize : [100, 8],
		sizes : [20, 80],
		gutterSize : 8,
		cursor : 'row-resize',
	})
}

// Uses vm->TileSize & vm->EdgeColors
function makeRune(group, colors) {
	var runewidth = vm.TileSize() + vm.TilePadSize()
		var v0 = vm.TilePadSize() / 2;
	var v2 = runewidth - v0
		var v1 = runewidth / 2;

	group.add(new Rune.Triangle(v0, v0, v2, v0, v1, v1, group).fill(vm.EdgeColors()[colors.up]).stroke(false));
	group.add(new Rune.Triangle(v2, v0, v2, v2, v1, v1, group).fill(vm.EdgeColors()[colors.right]).stroke(false));
	group.add(new Rune.Triangle(v2, v2, v0, v2, v1, v1, group).fill(vm.EdgeColors()[colors.down]).stroke(false));
	group.add(new Rune.Triangle(v0, v2, v0, v0, v1, v1, group).fill(vm.EdgeColors()[colors.left]).stroke(false));
}

// Create a virtual DOM via mithril
// - Create separate ViewModel and ViewController entities
// - ViewController is responsible for redrawing the view (html/css) based
//   on changes in controller's state (user input + the ModelView)
// - ModelView is responsible for detecting changes in the model
//   which is realized as the network data (model/cache) + user's state (view)
// https://lhorie.github.io/mithril/mithril.html
// https://lhorie.github.io/mithril/mithril.route.html
// https://lhorie.github.io/mithril/mithril.request.html
// https://lhorie.github.io/mithril-blog/extending-the-view-language.html
// http://stackoverflow.com/questions/30719149/successful-requests-get-unwrapped-in-error-hook
// http://ratfactor.com/daves-guide-to-mithril-js
// https://disqus.com/home/discussion/mithriljs/mithril_76/#comment-1606176167
//
// If i want to get fancy and use templates:
// https://github.com/sdemjanenko/msx-reader
//

var NeeternityModel = function () {
	this.selected = m.prop(-1) // route to boardset
		//this.legendpieces = m.prop([])
}

function legendcalccols(framewidth, elementwidth, numelements) {
	//console.log("[legendcalccols] [framewidth: " + framewidth + "] [elementwidth: " + elementwidth + "] [numelements: " + numelements + "]")

	var cols = Math.floor(framewidth / elementwidth)
		//console.log("[legendcalccols] [ceil: " + cols + "] [mod: " + (numelements % cols) + "]")
		/*
		for ( ; cols > 0 && 0 != (numelements % cols); cols--) {
		// noop
		}
		 */

		console.log("[legendcalccols] [cols: " + cols + "]")
		return cols
}
function legendcalcrows(numcols, numelements) {
	var rows = Math.floor(numelements / numcols)
		console.log("[legendcalcrows] [rows: " + rows + "]")
		return rows + ((0 == (numelements % numcols)) ? 0 : 1)
}

var NeeternityView = function () {
	this.legend = {}
	this.boards = {}

	this.boardsconfig = function (element, isInit, userdata) {
		console.log("[boardsconfig] [isInit: " + isInit + "]");
	}

	this.legendconfig = function (element, isInit, userdata) {
		console.log("[legendconfig] [isInit: " + isInit + "]")

		if (!isInit) {
			return
		}

		var width = Math.floor(element.clientWidth) - 20 // ignore the last 20 for scroll bar
			var height = Math.floor(element.clientHeight)

			if (width == userdata.lastWidth) {
				return
			}

			if (userdata.r) {
				var runeElem = userdata.r.getEl()
					console.debug("[runeElem: " + element + "]")
					element.removeChild(userdata.r.getEl())
					delete userdata.r
			}

			userdata.lastWidth = width
			userdata.lastHeight = height

			var piecelist = vm.Tiles()
			var tilesize = vm.TileSize()
			var tilepadsize = vm.TilePadSize()

			// Calculate how many rows are able to fit in the width
			var cols = legendcalccols(width, tilesize + tilepadsize, piecelist.length)
			if (0 == cols) {
				console.log("Legend is too small for any tiles")
				return
			}

			var rows = legendcalcrows(cols, piecelist.length)
			console.log("[#pieces: " + piecelist.length + "] [" + cols + "x" + rows + "]")

			userdata.r = new Rune({
				container : element,
				width : cols * (tilesize + tilepadsize),
				height : rows * (tilesize + tilepadsize),
				debug : true
			})

			var piecegrid = userdata.r.grid({
				columns : cols,
				rows : rows,
				moduleWidth : tilesize + tilepadsize,
				moduleHeight : tilesize + tilepadsize,
			});

		for (var i = 0; i < cols * rows && i < piecelist.length; i++) {
			var col = i % cols;
			var row = Math.floor(i / cols);
			//console.log(i + ": " + col + ", " + row + " [tile: " + piecelist[i] + "]"); // spam
			var newPieceGroup = userdata.r.group(0, 0);
      
			// @TODO: Add tooltip/routing to group element's onclick event
			piecegrid.add(newPieceGroup, col + 1, row + 1);
			makeRune(newPieceGroup, piecelist[i])
		}

		userdata.r.draw();
	}

	this.view = function (ctrl, options) {
		console.log("[NeeternityView.view]")
		if (0 == vm.Tiles().length) {
			console.log("[NeeternityView.view] [no pieces]")
			return
		}

      console.log("div" + vm.LegendDivId() + ".split content")
      console.log("div" + vm.BoardsDivId() + ".split content")
      
		// <div id="legend_div" class="split content"></div>
		// <div id="boards_div" class="split content"></div>
		return [
      // @TODO: Add some 'Filter' UI elements to the Legend
      /*
			m("div" + vm.LegendDivId() + ".split content", [
        m("div", {config : this.legendconfig}),
      ]),
      */
			m("div" + vm.LegendDivId() + ".split content", {
				config : this.legendconfig
			}),
			m("div" + vm.BoardsDivId() + ".split content", {
				config : this.boardsconfig
			}),
		]
	}
}

// PageView Constructor
var PageView = {

	controller : function (options) {
		console.log("[PageView.controller] [arguments.length: " + arguments.length + "]")
		this.neeternitymodel = m.prop(new NeeternityModel())
			this.neeternityview = m.prop(new NeeternityView())
	},

	add : function () {
		console.log("[PageView.add]")
		// Generate the DOM elements for the page
		m.module(vm.MainElem(), PageView)

		// Render the page so that Split can be generated
		m.redraw()

		// Generate the page Split
		SplitNeeternityContent()

		// Re-render the page with the Split
		m.redraw()

    // Attach a resize handler to trigger virtual DOM redraw
		var resizes = document.getElementById("neeternity")
			new ResizeSensor(resizes, function () {
				console.log("[ResizeSensor.neeternity] [" + resizes.clientWidth + "]");
				m.redraw()
			})
	},

	view : function (ctrl, options) {
		console.log("[PageView.view]")
		/*
		<header>header</header>
		<div class="container">
		<div id="neeternity" class="content_divs">
		</div>
		</div>
		<footer>footer</footer>
		 */

		return [
			m("header", m(".card", [
						m("h2", "Eternity2 Puzzle Search Space Explorer"),
						m("h3", "As our server crunches numbers, you can explore its results"),
					])),
			m(".container", null, [
					m("#neeternity.content_divs", null, [
							ctrl.neeternityview().view(ctrl.neeternitymodel()),
						]),
				]),
			m("footer", ["Copyright © 2016 TheRickeys.com  |  ", m("a[href='/']", {
						config : m.route
					})]),
		]
	},
}

var Landing = {

	add : function () {
		m.module(vm.MainElem(), Landing)
	},
	remove : function () {
		m.module(vm.MainElem(), null) // unloads module
	},

	view : function () {
		return [
			m(".card", [
					m("h2", "Eternity2 Puzzle Search Space Explorer"),
					m("h3", "As our server crunches numbers, you can explore its results"),
					m("p", vm.Status()),
				]),
		]
	},
}

var LegendTile = function (id, colorIds) {
	this.id = id
		this.up = colorIds[0]
		this.right = colorIds[1]
		this.down = colorIds[2]
		this.left = colorIds[3]
}

function onloadpiecessuccess(startingedges) {
	console.log("[onloadpiecessuccess] [" + startingedges.length + "]")

	if (0 == startingedges.length) {
		console.debug("[onloadpiecessuccess] piece colors list is empty")
		vm.Status("There are no starting pieces configured")
		return
	}

	// Create the Legend index
	var index = 0
		for (var i = 0; i < startingedges.length; i++, index++) {
			var edgecolors = startingedges[i]

				if (4 != edgecolors.length) {
					console.debug("[onloadpiecessuccess] [" + i + "] [Invalid PieceColors format]")
				}

				// Add entries for each tile
				vm.Tiles().push(new LegendTile(index, edgecolors))

				// @TODO: Create routes for each tile used for the boards
		}

		if (0 == vm.Tiles().length) {
			vm.Status("No pieces are configured...")
			return
		}

		// Unload the landing page
		Landing.remove()

		// Load the main page
		PageView.add()
}

function onloadpiecesfailure() {
	console.debug("[onloadpiecesfailure]")
	vm.Status("Starting Pieces failed to load")
}

function main() {
	// Load the loading scene
	Landing.add()

	m.request({
		method : "GET",
		url : vm.UrlRoot() + vm.PiecesFile(),
	}).then(onloadpiecessuccess, onloadpiecesfailure)
}

// Execute main entry point
main()