// About: Neeternity web page implementation
// Author: Nathan Rickey
// http://therickeys.com/first/neeternity


// Someone else's javascript thoughts
// http://www.toptal.com/javascript/10-most-common-javascript-mistakes

/////////////////////////////////////////
// Puzzle Piece Edge Colors
// @TODO: Modularize, Reformat
// from http://tools.medialab.sciences-po.fr/iwanthue/
kelly_colors = ['000000', 'F2F3F4', '222222', 'F3C300', '875692', 'F38400', 'A1CAF1', 'BE0032', 'C2B280', '848482', '008856', 'E68FAC', '0067A5', 'F99379', '604E97', 'F6A600', 'B3446C', 'DCD300', '882D17', '8DB600', '654522', 'E25822', '2B3D26']
other_colors = ["#080604", "#10467A", "#53C811", "#F55B38", "#861917", "#C0D8C0", "#979F55", "#F5D32D", "#0B5B1B", "#6FC7CA", "#F51491", "#9E477D", "#704B0E", "#246162", "#FDC374", "#7946AA", "#2D81F3", "#503537", "#D9ADC6", "#A1DE35", "#72D38A", "#B95051", "#C98435"]
some_colors = ["#023FA5", "#7D87B9", "#BEC1D4", "#D6BCC0", "#BB7784", "#8E063B", "#4A6FE3", "#8595E1", "#B5BBE3", "#E6AFB9", "#E07B91", "#D33F6A", "#11C638", "#8DD593", "#C6DEC7", "#EAD3C6", "#F0B98D", "#EF9708", "#0FCFC0", "#9CDED6", "#D5EAE7", "#F3E1EB", "#F6C4E1", ]
//                     0         1         2         3         4         5         6         7         8         9        10        11         12        13        14        15        16        17        18        19        20        21        22
alphabet_colors = ["#F0A3FF","#0075DC","#993F00","#4C005C","#191919","#005C31","#2BCE48","#FFCC99","#808080","#94FFB5","#8F7C00","#9DCC00","#C20088","#003380","#FFA405","#FFA8BB","#426600","#FF0010","#5EF1F2","#00998F","#E0FF66","#740AFF","#990000","#FFFF80","#FFFF00","#FF5005",]
//                     0         1         2         3         4         5         6         7         8         9        10        11         12        13        14        15        16        17        18        19        20        21        22
smart_colors_00 = ["#FFFFFF","#DCDCDC","#F2F3F4","#222222","#F3C300","#C0C0C0","#875692","#F38400","#A1CAF1","#808080","#BE0032","#C2B280","#848482","#696969","#008856","#E68FAC","#0067A5","#000000","#F99379","#604E97","#F6A600","#B3446C","#DCD300",]
//                     0         1         2         3         4         5         6         7         8         9        10        11         12        13        14        15        16        17        18        19        20        21        22
smart_colors_01 = ["#FFFFFF","#DCDCDC","#FF0000","#FFFF00","#00FF00","#C0C0C0","#00FFFF","#0000FF","#FF00FF","#808080","#700000","#878700","#007000","#696969","#007070","#000070","#700070","#000000","#FFDBAC","#F1C27D","#E0AC69","#C68642","#8D5524",]
//                     0         1         2         3         4         5         6         7         8         9        10        11         12        13        14        15        16        17        18        19        20        21        22


// Url Root
var HOSTEDURL = "http://therickeys.com"
var LOCALURL = "."

/////////////////////////////////////////
// Global statics and states
var vm = {
	UrlRoot : m.prop(LOCALURL + "/static/data/"), // Test locally via http-server . --cors
	PiecesFile : m.prop("pieces.json"),
	Status : m.prop("loading"), // overall state of the view
	Tiles : m.prop([]), // list of legend tiles (id+colored sides+rotation+tooltip) in the view
	MainElem : m.prop(document.body), // where to place Landing/View
	LegendDivId : m.prop("#legend_div"), // where to place Legend element (div id string)
	BoardDivId : m.prop("#board_div"), //
	TileSize : m.prop(40), // in pixels
	TilePadSize : m.prop(0), // in pixels
	CornerHighlight : m.prop(new Rune.Color(255, 0, 0)),
	BorderHighlight : m.prop(new Rune.Color(0, 255, 0)),
}

var board = {
	// list of legend tiles (id+colored sides+rotation+tooltip) in the view
	Corners : m.prop([]),
	Edges : m.prop([]),
	Normal : m.prop([]),
}

/////////////////////////////////////////
// Puzzle Piece Edge Colors @TODO: Serialize
vm.EdgeColors = m.prop(smart_colors_01.slice(0, 23))

/////////////////////////////////////////
// Resizable frame split via split.js
// https://nathancahill.github.io/Split.js/
// https://github.com/nathancahill/Split.js/blob/master/examples/jsfiddle.html
// http://stackoverflow.com/questions/12194469/best-way-to-do-a-split-pane-in-html
//
// Uses vm->LegendDivId & vm->BoardDivId
var SplitNeeternityContent = function () {
	console.debug("[SplitNeeternityContent]")
	return Split([vm.BoardDivId(), vm.LegendDivId()], {
		direction : 'horizontal',
		minSize : [2+16*vm.TileSize(), 100],
		sizes : [75, 25],
		gutterSize : 2,
		cursor : 'col-resize',
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
	this.data = {
		state : m.prop("init"),
	}
}

function boardcalccols(framewidth, elementwidth, numelements) {
	//console.log("[boardcalccols] [framewidth: " + framewidth + "] [elementwidth: " + elementwidth + "] [numelements: " + numelements + "]")

	var cols = Math.floor(framewidth / elementwidth)
	//console.log("[boardcalccols] [ceil: " + cols + "] [mod: " + (numelements % cols) + "]")
	/*
	for ( ; cols > 0 && 0 != (numelements % cols); cols--) {
	// noop
	}
		*/

	console.log("[boardcalccols] [cols: " + cols + "]")
	return cols
}

function boardcalcrows(numcols, numelements) {
	var rows = Math.floor(numelements / numcols)
	console.log("[boardcalcrows] [rows: " + rows + "]")
	return rows + ((0 == (numelements % numcols)) ? 0 : 1)
}

var NeeternityView = function () {
	// Called by PageView->on*(NeeternityModel)
	this.view = function (ctrl, options) {
		console.log("[NeeternityView.view] [arguments.length: " + arguments.length + "]" + ctrl)

		if (0 == vm.Tiles().length) {
			console.log("[NeeternityView.view] [no pieces]")
			return [m("div", null, "oops")]
		}

		//var Hero = ".black.bg-dark-blue.br2.pa3"

		console.log("legend: " + vm.LegendDivId())
		console.log("board: " + vm.BoardDivId())
		
		// <div id="legend_div" class="split content"></div>
		// <div id="board_div" class="split content"></div>
		return [
			//m("div#Frame", {style: "border: 2px solid; padding: 20px; width: 300px; overflow: auto;"}, [
				
      // @TODO: Add some 'Filter' UI elements to the Legend
      /*
			m("div" + vm.LegendDivId() + ".split content", [
        m("div", {config : this.legendconfig}),
      ]),
      */
			/*m("div", {
				class: "page-wrapper",
			}, [*/
				m("nav", {
					id: vm.BoardDivId(),
					class: "board",
					config : this.boardRedraw,
					}, []),
				m("article", {
					id: vm.LegendDivId(),
					class: "legend",
					//config : this.legendRedraw,
					}, [
						m("p", "Test"),
					]),
				/*]),*/
			]
	}

	// element: div's HTML
	// isInit: is element already created
	// context: m("#legend_div")
	this.legendRedraw = function (element, isInit, context) {
		console.log("[NeeternityView.legendRedraw] [isInit: " + isInit + "] " + context + "")
		// Accessing the real DOM element
		//  https://mithril.js.org/archive/v0.2.3/mithril.html#accessing-the-real-dom-element
		// context is #legend_div
		//var t = element.getContext("2d");
	},

	// element: div's HTML
	// isInit: is element already created
	// context: m("#board_div")
	this.boardRedraw = function (element, isInit, context) {
		console.log("[NeeternityView.boardRedraw] [isInit: " + isInit + "] " + context + "")

		if (isInit) {
			console.log("boardRedraw Initialized]")
			return
		}

		var width = Math.floor(element.clientWidth) - 20 // ignore the last 20 for scroll bar
		var height = Math.floor(element.clientHeight)

		if (width == context.lastWidth) {
			return
		}

		if (context.r) {
			var runeElem = context.r.getEl()
			console.debug("[runeElem: " + element + "]")
			element.removeChild(context.r.getEl())
			delete context.r
		}

		context.lastWidth = width
		context.lastHeight = height

		var piecelist = vm.Tiles()
		var tilesize = vm.TileSize()
		var tilepadsize = vm.TilePadSize()

		// Calculate how many rows are able to fit in the width
		//var cols = legendcalccols(width, tilesize + tilepadsize, piecelist.length)

		// Hard-code board width to 16 based on actual puzzle
		var cols = 16

		var rows = boardcalcrows(cols, piecelist.length)
		console.log("[#pieces: " + piecelist.length + "] [" + cols + "x" + rows + "]")

		context.r = new Rune({
			container : element,
			width : cols * (tilesize + tilepadsize),
			height : rows * (tilesize + tilepadsize),
			debug : false
		})

		var piecegrid = context.r.grid({
			columns : cols,
			rows : rows,
			moduleWidth : tilesize + tilepadsize,
			moduleHeight : tilesize + tilepadsize,
		});

		for (var i = 0; i < cols * rows && i < piecelist.length; i++) {
			var col = i % cols;
			var row = Math.floor(i / cols);
			//console.log(i + ": " + col + ", " + row + " [tile: " + piecelist[i] + "]"); // spam
			var newPieceGroup = context.r.group(0, 0);
      
			// @TODO: Add tooltip/routing to group element's onclick event
			piecegrid.add(newPieceGroup, col + 1, row + 1);
			makeRune(newPieceGroup, piecelist[i])
		}

		context.r.draw();
	}
}

// PageView Constructor
var PageView = {
	view : function (ctrl, options) {
		console.log("[PageView.view] get_content")
		content = this.get_content(ctrl)
		console.log("[PageView.view] get_page")
		elems = this.get_page(content)

		/*
		example of m("div.classname#id[param=one][param2=two]", ...)
		*/
		return elems
	},

	controller : function (options) {
		console.log("[PageView.controller] [arguments.length: " + arguments.length + "]")
		this.modelProp = m.prop(new NeeternityModel())
		this.viewProp = m.prop(new NeeternityView())
	},

	add : function () {
		console.log("[PageView.add]")
		// Generate the DOM elements for the page
		m.module(vm.MainElem(), PageView)

		// Render the page so that Split can be generated
		m.redraw()
	},

	oncreate : function(vnode) {
		console.log("[PageView.oncreate]")
		
		// Update the page Split
		//SplitNeeternityContent()

		m.redraw()
	},

	onupdate : function(vnode) {
		console.log("[PageView.onupdate]")
		
		// Update the page Split
		//SplitNeeternityContent()

		// Attach a resize handler to trigger virtual DOM redraw
		var resizes = document.getElementById("neeternity")
		new ResizeSensor(resizes, function () {
			console.log("[ResizeSensor.neeternity] [" + resizes.clientWidth + "]");
			m.redraw()
		})
	},
	
	// From Control, returns a View of the Model
	get_content : function(ctrl) {
		console.log("[PageView.get_content]")
		// console.log("get_content get view")
		var viewProp = ctrl.viewProp()
		// console.log("get_content get model")
		var modelProp = ctrl.modelProp()
		// console.log("get_content view model")

		// Calls NeeternityView->view(NeternityModel)
		return viewProp.view(modelProp)
	},

	get_page : function(eternity_content) {
		// console.log("[PageView.get_page]")
		return [
			m("div", {
				id: "neeternity",
				class: "page pretty_bg",
			}, [
				m("header", null, [
					m("nav", {
						id: "nav_head",
						class: "title",
					}, [
						m("a", {
							href : "/",
							class : "logo",
							config : m.route,
						}, "Eternity 2"),
						m("a", {
							href: "/about",
							config : m.route,
						}, "About"),
						m("a", {
							href : "/login",
							config : m.route,
						}, "Login"),
					]),
				]),
				eternity_content,
				m("footer", null, [
					m("p", "Copyright...")
					/*
					m("div", {
						class: "container pretty_bg",
					}, [
						m("p", "All Rights Reserved"),
						m("p", "© 2016 Nathan Rickey"),
					])
					*/
				]),
			])
		] // end of return
	},
}

var Landing = {

	add : function () {
		console.log("[Landing.add]")
		m.module(vm.MainElem(), Landing)
	},
	remove : function () {
		console.log("[Landing.remove]")
		m.module(vm.MainElem(), null) // unloads module
	},

	get_page : function(landing_content) {
		return [
			m("header", null, [
				m("nav", {
					class: "container pretty_bg",
				}, [
					m("a", {
						href : "/",
						class : "logo",
						config : m.route,
					}, "E2"),
					m("a", {
						href: "/about",
						config : m.route,
					}, "About"),
					m("a", {
						href : "/login",
						config : m.route,
					}, "Login"),
				]),
			]),
			m("section", {
				class: "content pretty_bg",
			}, [
				m("div", {
					id: "landing",
					class: "content",
				}, [
					/* landing_content*/
					m("h2", "Eternity2 Puzzle Search Space Explorer"),
					m("h3", "As our server crunches numbers, you can explore its results"),
					m("p", "Status: " + vm.Status()),
				]),
			]),
			m("footer", null, [
				m("div", {
					class: "container pretty_bg",
				}, [
				])
			]),
		]
	},

	view : function () {
		console.log("[Landing.view]")
		return this.get_page("unused")
	},
}

var LegendTile = function (id, colorIds) {
	this.id = id
	this.up = colorIds[0]
	this.right = colorIds[1]
	this.down = colorIds[2]
	this.left = colorIds[3]
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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

	sleep(1)
	// Load the main page
	//  via m.module(this)->view()
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