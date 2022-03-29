import Reversi from "./reversi/reversi_bb.js";
import * as Lib from "./lib.js";

// リバーシの実態と描画の橋渡しをするプレゼンタ
// 盤面以外のプレイ関連の描画と処理も担う
class App {
  view; // reversi view: リバーシ盤面の描画処理
  reversi = new Reversi(); // reversi model: リバーシの実態処理
  aiThread = new Worker("./reversi/ai/ai.js", { type: "module" }); // aiの非同期処理スレッド

  history = [];
  nBack = 0

  // elm
  mainELm;
  banElm;
  turnELm;
  resetElm;
  backElm;
  nextElm;
  toggleELm;
  aiElm = {
    black: null,
    white: null,
  };
  stateElm = {
    all: {},
    black: {
      text: null,
      back: null,
    },
    white: {
      text: null,
      back: null,
    },
  };

  // config
  black_ai = false;
  white_ai = false;
  theme = true;

  constructor() {
    this.init();
    var _move = this.move.bind(this);
    this.view = new ReversiView();
    this.view.initBan(
      this.reversi.blackCoord,
      this.reversi.whiteCoord,
      this.reversi.legalCoord,
      _move
    );
    if (this.isAiTurn()) {
      this.aiMove(this.reversi);
    }
  }

  _initAi() {
    this.aiThread.addEventListener("message", (e) => {
      const coord = e.data;
      this.move(coord[0]);
    });
  }

  _initElm() {
    this._getScreenType();
    this.mainELm = document.querySelector(".main");
    this.mainELm.classList.add(this.screenType);
    this.banElm = document.querySelector(".ban");
    if (this.screenType == "seiho") {
      var height = banElm.clientHeight;
      banElm.parentElement.style.width = height + "px";
    }
    this.turnELm = document.querySelector(".turn");
    this.turnELm.classList.add("black");
    this.backElm = document.querySelector(".button.back");
    this.backElm.classList.add("off");
    this.nextElm = document.querySelector(".button.next");
    this.nextElm.classList.add("off");
    this.stateElm.black.text = document.querySelector(".state .black .text");
    this.stateElm.black.back = document.querySelector(".state .black .back");
    this.stateElm.white.text = document.querySelector(".state .white .text");
    this.stateElm.white.back = document.querySelector(".state .white .back");
    this.stateElm.all = document.querySelector(".state .all .back");
    this.resetElm = document.querySelector(".buttons .reset");
    this.resetElm.addEventListener("click", (_) => {
      this.reset();
    });
    this.backElm = document.querySelector(".buttons .back");
    this.backElm.addEventListener("click", (_) => {
      this.back();
    });
    this.toggleELm = document.querySelector(".theme .toggle");
    this.toggleELm.addEventListener("click", (_) => {
      this.toggleTheme();
    });
  }

  init() {
    this._initAi();
    this._initElm();
    this.history = [this.reversi.clone];
    this.nBack = 0
    window.addEventListener("resize", (_) => {
      this._onResize();
    });
  }

  reset() {
    this.reversi.init();
    this.history = [this.reversi.clone];
    this.nBack = 0
    this.view._clearBan();
    this.view.updateBan(
      this.reversi.blackCoord,
      this.reversi.whiteCoord,
      this.reversi.legalCoord
    );
    if (this.isAiTurn()) {
      this.aiMove(this.reversi);
    }
    this.turnELm.classList.add("black");
    this.turnELm.classList.remove("white");
    this.backElm.classList.add("off");
    this.nextElm.classList.add("off");
    this._updateStateElm();
  }

  _viewUpdate() {
    this.view.updateBan(
      this.reversi.blackCoord,
      this.reversi.whiteCoord,
      this.reversi.legalCoord
    );
  }

  _updateStateElm() {
    this.stateElm.black.text.textContent = this.reversi.blackCount;
    this.stateElm.white.text.textContent = this.reversi.whiteCount;
    this.stateElm.black.back.style.height =
      (this.reversi.blackCount / 64) * 100 + "%";
    this.stateElm.white.back.style.height =
      (this.reversi.whiteCount / 64) * 100 + "%";
    this.stateElm.all.style.width =
      (this.reversi.blackCount / this.reversi.stoneCount) * 100 + "%";
  }

  update() {
    this._viewUpdate();
    this.turnELm.classList.toggle("white");
    this.turnELm.classList.toggle("black");
    this._updateStateElm();
  }

  move(coord) {
    this.reversi.move(coord);
    this.history.push(this.reversi.clone);
    this.nBack = 0
    this.update();
    if (this.reversi.isFinish()) {
      console.log("finish");
    } else {
      if (this.reversi.isPass()) {
        console.log("pass");
        this.reversi.nextTurn();
        this.update();
      }
      if (this.isAiTurn()) {
        this.aiMove(this.reversi);
      }
    }
  }

  isAiTurn() {
    return (
      (this.reversi.turn == Reversi.BLACK && this.black_ai) ||
      (this.reversi.turn == Reversi.WHITE && this.white_ai)
    );
  }

  aiMove(reversi) {
    this.aiThread.postMessage(reversi);
  }

  toggleTheme() {
    if (this.theme) {
      this.mainELm.classList.add("dark");
    } else {
      this.mainELm.classList.remove("dark");
    }
    this.theme = !this.theme;
  }

  _getScreenType() {
    var width = document.body.clientWidth;
    var height = document.documentElement.clientHeight;
    var ratio = width / height;
    if (ratio < 0.7) {
      this.screenType = "tate";
    } else if (1.3 < ratio) {
      this.screenType = "yoko";
    } else {
      this.screenType = "seiho";
    }
  }

  _onResize() {
    var beforeScreenType = this.screenType;
    this._getScreenType();
    if (this.screenType != beforeScreenType) {
      this.mainELm.classList.add(this.screenType);
      this.mainELm.classList.remove(beforeScreenType);
    }
    if (this.screenType == "seiho") {
      var height = this.banElm.clientHeight;
      this.banElm.parentElement.style.width = height + "px";
    } else {
      this.banElm.parentElement.style.width = "";
    }
  }

  _canBack() {
    return true
  }

  back() { // 待った
    /* TODO: complete */
    if(this._canBack()) {
      this.nBack += 1
      console.log(this.nBack);
      console.log(this.history);
      console.log(this.history[this.history.length - this.nBack - 1]);
    }
  }

  next() {
    /* TODO: complete next function, and attach to next button */
  }
}

class ReversiView {
  ban;
  masu = {};
  constructor() {
    this.ban = document.querySelector(".ban");
  }

  _initMasu(callback) {
    var row = "abcdefgh".split("");
    var col = Array.from(Array(8), (v, k) => k + 1);

    for (var c of col) {
      for (var r of row) {
        var elm = Lib.createElm("masu");
        elm.setAttribute("coord", r + c);
        this.ban.appendChild(elm);
        this.masu[r + c] = elm;
        elm.addEventListener("click", (e) => {
          var elm = e.target;
          if (elm.classList.contains("can")) {
            callback(e.target.getAttribute("coord"));
          }
        });
      }
    }
  }

  initBan(black, white, legal, callback) {
    this._initMasu(callback);
    this.updateBan(black, white, legal);
  }

  _clearBan() {
    for (var coord in this.masu) {
      var m = this.masu[coord];
      m.classList.remove("black");
      m.classList.remove("white");
      m.classList.remove("can");
    }
  }

  updateBan(black, white, legal) {
    this._clearBan();
    for (var b of black) {
      this.masu[b].classList.add("black");
    }
    for (var w of white) {
      this.masu[w].classList.add("white");
    }
    for (var c of legal) {
      this.masu[c].classList.add("can");
    }
  }
}

var app;

window.addEventListener("DOMContentLoaded", (_) => {
  app = new App();
});
