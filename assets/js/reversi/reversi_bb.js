import Grid from "./grid.js";

const BLACK = 1;

const WHITE = -1;

// #region kari
function bb2b(bitboard, nbit = 64) {
  // bitboard to binary string
  var binary = bitboard.toString(2);
  return "0".repeat(nbit - binary.length) + binary;
}
function b2bs(binary, nbit = 64) {
  // binary string to bitboard view
  var bbString = "";
  for (var i = 0; i < nbit / 8; i++) {
    bbString += binary.slice(i * 8, (i + 1) * 8) + "\n";
  }
  return bbString;
}

function bitboardString(bitboard, nbit = 64) {
  return b2bs(bb2b(bitboard, nbit), nbit);
}
// #endregion /kari

export class Bitboard {
  top;
  bottom;

  // bitboard: hex 64bit bitboard
  constructor(bitboard = null, top = null, bottom = null) {
    if (bitboard) {
      bitboard = this._hexString(BigInt(bitboard));
      this.top = parseInt(bitboard.slice(0, 8), 16);
      this.bottom = parseInt(bitboard.slice(8, 16), 16);
    } else {
      this.top = top;
      this.bottom = bottom;
    }
  }

  // bitboard // bigint
  // return 0padding hex bitboard string
  _hexString(hexBitboard, nbit = 64) {
    var hex = hexBitboard.toString(16);
    return "0".repeat(nbit / 4 - hex.length) + hex;
  }
  _hex2binary(hexBitboard, nbit = 32) {
    var binary = hexBitboard.toString(2);
    return "0".repeat(nbit - binary.length) + binary;
  }
  _binary2bitboardString(binary) {
    var bbString = "";
    for (var i = 0; i < 4; i++) {
      bbString += binary.slice(i * 8, (i + 1) * 8) + "\n";
    }
    return bbString;
  }
  _hex2bitboardString(hex) {
    return this._binary2bitboardString(this._hex2binary(hex));
  }
  get bitboardString() {
    return (
      this._hex2bitboardString(this.top) + this._hex2bitboardString(this.bottom)
    );
  }

  not() {
    this.top = ~this.top >>> 0;
    this.bottom = ~this.bottom >>> 0;
  }

  and(bitboard) {
    var tmp = Bitboard.calc(this, bitboard, "and");
    this.top = tmp.top;
    this.bottom = tmp.bottom;
  }

  or(bitboard) {
    var tmp = Bitboard.calc(this, bitboard, "or");
    this.top = tmp.top;
    this.bottom = tmp.bottom;
  }

  xor(bitboard) {
    var tmp = Bitboard.calc(this, bitboard, "xor");
    this.top = tmp.top;
    this.bottom = tmp.bottom;
  }

  static calc(bitboard1, bitboard2, ope) {
    if (!(bitboard1 instanceof this)) {
      bitboard1 = new Bitboard(bitboard1);
    }
    if (!(bitboard2 instanceof this)) {
      bitboard2 = new Bitboard(bitboard2);
    }
    var top;
    var bottom;
    if (ope == "and") {
      top = bitboard1.top & bitboard2.top;
      bottom = bitboard1.bottom & bitboard2.bottom;
    } else if (ope == "or") {
      top = bitboard1.top | bitboard2.top;
      bottom = bitboard1.bottom | bitboard2.bottom;
    } else if (ope == "xor") {
      top = bitboard1.top ^ bitboard2.top;
      bottom = bitboard1.bottom ^ bitboard2.bottom;
    }
    return new Bitboard(null, top, bottom);
  }

  static horizonalMask(bitboard) {
    return Bitboard.calc(bitboard, 0x7e7e7e7e7e7e7e7en, "and");
  }

  static verticalMask(bitboard) {
    return Bitboard.calc(bitboard, 0x00ffffffffffff00n, "and");
  }

  static diagonalMask(bitboard) {
    return Bitboard.calc(bitboard, 0x007e7e7e7e7e7e00n, "and");
  }

  get bitCoord() {
    var arr = [];

    var row = "abcdefgh".split("");
    var col = Array.from(Array(8), (v, k) => k);

    var flag = 0x80000000;

    for (var r of col) {
      for (var c of col) {
        var t = flag;
        var b = flag;
        if (c < 4) {
          t >>>= r;
          t >>>= 8 * c;
          if ((t & this.top) != 0) {
            arr.push(row[r] + (c + 1));
          }
        } else {
          b >>>= r;
          b >>>= 8 * c;
          if ((b & this.bottom) != 0) {
            arr.push(row[r] + (c + 1));
          }
        }
      }
    }
    return arr;
  }

  get bitCount() {
    var cnt = 0;

    var col = Array.from(Array(8), (v, k) => k);

    var flag = 0x80000000;

    for (var r of col) {
      for (var c of col) {
        var t = flag;
        var b = flag;
        if (c < 4) {
          t >>>= r;
          t >>>= 8 * c;
          if ((t & this.top) != 0) {
            cnt += 1;
          }
        } else {
          b >>>= r;
          b >>>= 8 * c;
          if ((b & this.bottom) != 0) {
            cnt += 1;
          }
        }
      }
    }
    return cnt;
  }

  get isZero() {
    return this.top == 0 && this.bottom == 0;
  }
}

export default class Reversi {
  static BLACK = BLACK;
  static WHITE = WHITE;
  turn; // 現在の手番
  get o_turn() {
    // 現在の手番ではない方
    return this.turn * -1;
  }
  thisNTurn; // 現在のターン数
  board = [];
  get p_board() {
    // 手番側の64ビットボード
    return this.board[this.turn];
  }
  get o_board() {
    // 手番でない側の64ビットボード
    return this.board[this.o_turn];
  }

  get blackCoord() {
    return this.board[BLACK].bitCoord;
  }

  get whiteCoord() {
    return this.board[WHITE].bitCoord;
  }

  get legalCoord() {
    return this.legalBoard().bitCoord;
  }

  get blackCount() {
    return this.board[BLACK].bitCount;
  }

  get whiteCount() {
    return this.board[WHITE].bitCount;
  }

  get stoneCount() {
    return this.blackCount + this.whiteCount
  }

  get blankCount() {
    return this.blankBoard.bitCount
  }

  get playerLegalCount() {
    return this.legalBoard().bitCount
  }

  get opponentLegalCount() {
    this.turn *= -1
    var cnt = this.legalBoard().bitCount
    this.turn *= -1
    return cnt
  }

  get clone() {
    var reversi = new Reversi()
    reversi.board[BLACK] = new Bitboard(null, this.board[BLACK].top, this.board[BLACK].bottom)
    reversi.board[WHITE] = new Bitboard(null, this.board[WHITE].top, this.board[WHITE].bottom)
    reversi.turn = this.turn
    reversi.thisNTurn = this.thisNTurn
    return reversi
  }

  constructor() {
    this.init();
  }

  init() {
    this.turn = BLACK;
    this.thisNTurn = 1;

    this.board[BLACK] = new Bitboard(0x0000000810000000);
    this.board[WHITE] = new Bitboard(0x0000001008000000);
  }

  get blankBoard() {
    var blankBoard = Bitboard.calc(this.p_board, this.o_board, "or");
    blankBoard.not();
    return blankBoard;
  }

  // #region related
  // related: ある石の隣に連続した相手方石がある状態
  // --op-poop -> left related by p: 001000110
  //           -> blank: 110010000
  //           -> left related by p left shift(p << 1): 010001100
  //           -> blank & p << 1: 01000000 == canMove left
  _leftRelated(player, masked_opponent) {
    var top = masked_opponent.top & (player.top << 1);
    top |= masked_opponent.top & (top << 1);
    top |= masked_opponent.top & (top << 1);
    top |= masked_opponent.top & (top << 1);
    top |= masked_opponent.top & (top << 1);
    top |= masked_opponent.top & (top << 1);

    var bottom = masked_opponent.bottom & (player.bottom << 1);
    bottom |= masked_opponent.bottom & (bottom << 1);
    bottom |= masked_opponent.bottom & (bottom << 1);
    bottom |= masked_opponent.bottom & (bottom << 1);
    bottom |= masked_opponent.bottom & (bottom << 1);
    bottom |= masked_opponent.bottom & (bottom << 1);

    return { top: top, bottom: bottom };
  }
  _rightRelated(player, masked_opponent) {
    var top = masked_opponent.top & (player.top >>> 1);
    top |= masked_opponent.top & (top >>> 1);
    top |= masked_opponent.top & (top >>> 1);
    top |= masked_opponent.top & (top >>> 1);
    top |= masked_opponent.top & (top >>> 1);
    top |= masked_opponent.top & (top >>> 1);

    var bottom = masked_opponent.bottom & (player.bottom >>> 1);
    bottom |= masked_opponent.bottom & (bottom >>> 1);
    bottom |= masked_opponent.bottom & (bottom >>> 1);
    bottom |= masked_opponent.bottom & (bottom >>> 1);
    bottom |= masked_opponent.bottom & (bottom >>> 1);
    bottom |= masked_opponent.bottom & (bottom >>> 1);

    return { top: top, bottom: bottom };
  }
  _horizonalRelated(player, opponent) {
    var maskedOpponentBoard = Bitboard.horizonalMask(opponent);
    return {
      left: this._leftRelated(player, maskedOpponentBoard),
      right: this._rightRelated(player, maskedOpponentBoard),
    };
  }
  _upRelated(player, masked_opponent) {
    var bottom = masked_opponent.bottom & (player.bottom << 8);
    bottom |= masked_opponent.bottom & (bottom << 8);
    bottom |= masked_opponent.bottom & (bottom << 8);

    var top =
      masked_opponent.top &
      (((bottom | player.bottom) >>> 24) | (player.top << 8));
    top |= masked_opponent.top & (top << 8);
    top |= masked_opponent.top & (top << 8);

    return { top: top, bottom: bottom };
  }
  _downRelated(player, masked_opponent) {
    var top = masked_opponent.top & (player.top >>> 8);
    top |= masked_opponent.top & (top >>> 8);
    top |= masked_opponent.top & (top >>> 8);

    var bottom =
      masked_opponent.bottom &
      (((top | player.top) << 24) | (player.bottom >>> 8));
    bottom |= masked_opponent.bottom & (bottom >>> 8);
    bottom |= masked_opponent.bottom & (bottom >>> 8);

    return { top: top, bottom: bottom };
  }
  _verticalRelated(player, opponent) {
    var maskedOpponentBoard = Bitboard.verticalMask(opponent);
    return {
      up: this._upRelated(player, maskedOpponentBoard),
      down: this._downRelated(player, maskedOpponentBoard),
    };
  }
  _rightUpRelated(player, masked_opponent) {
    var bottom = masked_opponent.bottom & (player.bottom << 7);
    bottom |= masked_opponent.bottom & (bottom << 7);
    bottom |= masked_opponent.bottom & (bottom << 7);

    var top =
      masked_opponent.top &
      (((bottom | player.bottom) >>> 25) | (player.top << 7));
    top |= masked_opponent.top & (top << 7);
    top |= masked_opponent.top & (top << 7);

    return { top: top, bottom: bottom };
  }
  _rightDownRelated(player, masked_opponent) {
    var top = masked_opponent.top & (player.top >>> 9);
    top |= masked_opponent.top & (top >>> 9);
    top |= masked_opponent.top & (top >>> 9);

    var bottom =
      masked_opponent.bottom &
      (((top | player.top) << 23) | (player.bottom >>> 9));
    bottom |= masked_opponent.bottom & (bottom >>> 9);
    bottom |= masked_opponent.bottom & (bottom >>> 9);

    return { top: top, bottom: bottom };
  }
  _leftDownRelated(player, masked_opponent) {
    var top = masked_opponent.top & (player.top >>> 7);
    top |= masked_opponent.top & (top >>> 7);
    top |= masked_opponent.top & (top >>> 7);

    var bottom =
      masked_opponent.bottom &
      (((top | player.top) << 25) | (player.bottom >>> 7));
    bottom |= masked_opponent.bottom & (bottom >>> 7);
    bottom |= masked_opponent.bottom & (bottom >>> 7);

    return { top: top, bottom: bottom };
  }
  _leftUpRelated(player, masked_opponent) {
    var bottom = masked_opponent.bottom & (player.bottom << 9);
    bottom |= masked_opponent.bottom & (bottom << 9);
    bottom |= masked_opponent.bottom & (bottom << 9);

    var top =
      masked_opponent.top &
      (((bottom | player.bottom) >>> 23) | (player.top << 9));
    top |= masked_opponent.top & (top << 9);
    top |= masked_opponent.top & (top << 9);

    return { top: top, bottom: bottom };
  }
  _diagonalRelated(player, opponent) {
    var maskedOpponentBoard = Bitboard.diagonalMask(opponent);
    return {
      rightUp: this._rightUpRelated(player, maskedOpponentBoard),
      rightDown: this._rightDownRelated(player, maskedOpponentBoard),
      leftDown: this._leftDownRelated(player, maskedOpponentBoard),
      leftUp: this._leftUpRelated(player, maskedOpponentBoard),
    };
  }

  // #endregion

  // #region legal move
  _horizonalLegal(blank) {
    // 相手の石の左右に置けるか
    var rel = this._horizonalRelated(this.p_board, this.o_board);

    var left_top = blank.top & (rel.left.top << 1);
    var left_bottom = blank.bottom & (rel.left.bottom << 1);

    var right_top = blank.top & (rel.right.top >>> 1);
    var right_bottom = blank.bottom & (rel.right.bottom >>> 1);

    return {
      left: new Bitboard(null, left_top, left_bottom),
      right: new Bitboard(null, right_top, right_bottom),
    };
  }
  _verticalLegal(blank) {
    var rel = this._verticalRelated(this.p_board, this.o_board);

    var up_top = blank.top & ((rel.up.top << 8) | (rel.up.bottom >>> 24));
    var up_bottom = blank.bottom & (rel.up.bottom << 8);

    var down_top = blank.top & (rel.down.top >>> 8);
    var down_bottom =
      blank.bottom & ((rel.down.bottom >>> 8) | (rel.down.top << 24));

    return {
      up: new Bitboard(null, up_top, up_bottom),
      down: new Bitboard(null, down_top, down_bottom),
    };
  }
  _diagonalLegal(blank) {
    var rel = this._diagonalRelated(this.p_board, this.o_board);

    var right_up_top =
      blank.top & ((rel.rightUp.top << 7) | (rel.rightUp.bottom >>> 25));
    var right_up_bottom = blank.bottom & (rel.rightUp.bottom << 7);

    var right_down_top = blank.top & (rel.rightDown.top >>> 9);
    var right_down_bottom =
      blank.bottom & ((rel.rightDown.bottom >>> 9) | (rel.rightDown.top << 23));

    var left_down_top = blank.top & (rel.leftDown.top >>> 7);
    var left_down_bottom =
      blank.bottom & ((rel.leftDown.bottom >>> 7) | (rel.leftDown.top << 25));

    var left_up_top =
      blank.top & ((rel.leftUp.top << 9) | (rel.leftUp.bottom >>> 23));
    var left_up_bottom = blank.bottom & (rel.leftUp.bottom << 9);

    return {
      rightUp: new Bitboard(null, right_up_top, right_up_bottom),
      rightDown: new Bitboard(null, right_down_top, right_down_bottom),
      leftDown: new Bitboard(null, left_down_top, left_down_bottom),
      leftUp: new Bitboard(null, left_up_top, left_up_bottom),
    };
  }
  // 手番プレイヤーの合法手作成
  // reversi: Reversi インスタンス
  // return: 手番プレイヤーが置ける位置にのみビットが立っている64ビットボード
  legalBoard() {
    // 空きマスにのみビットが立ってるボード
    var blankBoard = this.blankBoard;

    // 8方向チェック
    // 一度に返せる石は最大6，bit演算なのでforを展開(効果は分からん)

    var hor = this._horizonalLegal(blankBoard);
    var ver = this._verticalLegal(blankBoard);
    var diag = this._diagonalLegal(blankBoard);

    var legal_t = hor.left.top;
    legal_t |= hor.right.top;
    legal_t |= ver.up.top;
    legal_t |= ver.down.top;
    legal_t |= diag.rightUp.top;
    legal_t |= diag.rightDown.top;
    legal_t |= diag.leftDown.top;
    legal_t |= diag.leftUp.top;

    var legal_b = hor.left.bottom;
    legal_b |= hor.right.bottom;
    legal_b |= ver.up.bottom;
    legal_b |= ver.down.bottom;
    legal_b |= diag.rightUp.bottom;
    legal_b |= diag.rightDown.bottom;
    legal_b |= diag.leftDown.bottom;
    legal_b |= diag.leftUp.bottom;

    return new Bitboard(null, legal_t, legal_b);
  }
  // #endregion

  // move: bitboard
  // return: revese bitboard
  reverse(move) {
    var blankBoard = this.blankBoard;

    var reverse_t;
    var reverse_b;

    var hor_leg = this._horizonalLegal(blankBoard);
    var right_rev = this._rightRelated(
      Bitboard.calc(move, hor_leg.left, "and"),
      this.o_board
    );
    var left_rev = this._leftRelated(
      Bitboard.calc(move, hor_leg.right, "and"),
      this.o_board
    );

    var ver_leg = this._verticalLegal(blankBoard);
    var up_rev = this._upRelated(
      Bitboard.calc(move, ver_leg.down, "and"),
      this.o_board
    );
    var down_rev = this._downRelated(
      Bitboard.calc(move, ver_leg.up, "and"),
      this.o_board
    );

    var diag_leg = this._diagonalLegal(blankBoard);
    var right_up_rev = this._rightUpRelated(
      Bitboard.calc(move, diag_leg.leftDown, "and"),
      this.o_board
    );
    var right_down_rev = this._rightDownRelated(
      Bitboard.calc(move, diag_leg.leftUp, "and"),
      this.o_board
    );
    var left_down_rev = this._leftDownRelated(
      Bitboard.calc(move, diag_leg.rightUp, "and"),
      this.o_board
    );
    var left_up_rev = this._leftUpRelated(
      Bitboard.calc(move, diag_leg.rightDown, "and"),
      this.o_board
    );

    reverse_t = right_rev.top;
    reverse_t |= left_rev.top;
    reverse_t |= up_rev.top;
    reverse_t |= down_rev.top;
    reverse_t |= right_up_rev.top;
    reverse_t |= right_down_rev.top;
    reverse_t |= left_down_rev.top;
    reverse_t |= left_up_rev.top;

    reverse_b = right_rev.bottom;
    reverse_b |= left_rev.bottom;
    reverse_b |= up_rev.bottom;
    reverse_b |= down_rev.bottom;
    reverse_b |= right_up_rev.bottom;
    reverse_b |= right_down_rev.bottom;
    reverse_b |= left_down_rev.bottom;
    reverse_b |= left_up_rev.bottom;

    return new Bitboard(null, reverse_t, reverse_b);
  }

  nextTurn() {
    this.thisNTurn += 1
    this.turn *= -1
  }

  // move: legal move coord string
  move(move) {
    var bit = new Bitboard(Grid.bit[move[0]][move[1]]);
    var reverse = this.reverse(bit);
    this.p_board.xor(Bitboard.calc(reverse, bit, "or"));
    this.o_board.xor(reverse);
    this.nextTurn()
  }

  isPass() {
    return this.legalBoard().isZero;
  }

  isFinish() {
    var p_legal = this.legalBoard();
    this.turn *= -1;
    var o_legal = this.legalBoard();
    this.turn *= -1;

    return p_legal.isZero && o_legal.isZero;
  }
}
