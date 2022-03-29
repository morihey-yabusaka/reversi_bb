import { evaluate } from "./eval.js";

const fullSearchCount = 12;
const minScore = -10000;
const maxScore = 10000;
const timeout = 500; // [ms]
const minDepth = 3;

export function run(reversi) {
  if (!reversi.isFinish()) {
    if (reversi.blankCount > fullSearchCount) {
      return iterativeDeepening(reversi);
    } else {
      return fullSearch(reversi);
    }
  }
  return null;
}

function iterativeDeepening(reversi) {
  // console.log("iterative deepening");
  const legal = reversi.legalCoord;
  const timelimit = Date.now() + timeout;
  let scores = {};
  for (let depth = minDepth; ; depth++) {
    try {
      for (let move of legal) {
        let r = reversi.clone;
        r.move(move);
        let score = alphaBeta(r, depth - 1, -maxScore, -minScore, timelimit);
        scores[move] = score;
      }
    } catch (error) {
      // console.log("depth: ", depth);
      break;
    }
  }
  return Object.fromEntries(
    Object.entries(scores).sort((a, b) => {
      return a[1] - b[1];
    })
  );
}

function alphaBeta(reversi, depth, a, b, timelimit) {
  if (Date.now() > timelimit) throw "tle";
  if (depth <= 0) return evaluate(reversi);
  var legal = reversi.legalCoord;

  if (legal.length == 0) {
    var r = reversi.clone;
    r.turn *= -1;
    return -alphaBeta(r, depth - 1, -b, -a, timelimit);
  }

  for (var move of legal) {
    var r = reversi.clone;
    r.move(move);
    a = Math.max(a, -alphaBeta(r, depth - 1, -b, -a, timelimit));
    if (a >= b) return a;
  }
  return a;
}

function fullSearch(reversi) {
  // console.log("full search");
  var legal = reversi.legalCoord;
  var scores = {};
  for (var move of legal) {
    var r = reversi.clone;
    r.move(move);
    var score = alphaBetaFull(r, 0, -maxScore, -minScore);
    scores[move] = score;
  }
  return Object.fromEntries(
    Object.entries(scores).sort((a, b) => {
      return a[1] - b[1];
    })
  );
}

function alphaBetaFull(reversi, depth, a, b) {
  var black = reversi.blackCount;
  var white = reversi.whiteCount;
  if (reversi.stoneCount == 64) return black - white;
  var legal = reversi.legalCoord;
  if (legal.length == 0) {
    if (depth > 0) return black - white;
    var r = reversi.clone;
    r.turn *= -1;
    return -alphaBetaFull(r, depth + 1, -b, -a);
  }
  for (var move of legal) {
    var r = reversi.clone;
    r.move(move);
    a = Math.max(a, -alphaBetaFull(r, depth, -b, -a));
    if (a >= b) return a;
  }
  return a;
}
