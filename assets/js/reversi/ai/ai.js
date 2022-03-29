import * as Run from "./search.js";
import {Bitboard} from "../reversi_bb.js"
import Reversi from "../reversi_bb.js"

self.addEventListener("message", (e) => {
  const _reversi = e.data;
  var reversi = new Reversi()
  reversi.board[1] = new Bitboard(null, _reversi.board[1].top, _reversi.board[1].bottom)
  reversi.board[-1] = new Bitboard(null, _reversi.board[-1].top, _reversi.board[-1].bottom)
  reversi.turn = _reversi.turn
  reversi.thisNTurn = _reversi.thisNTurn
  self.postMessage(Object.keys(Run.run(reversi.clone)));
});
