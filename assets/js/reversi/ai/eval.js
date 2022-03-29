const movableWeight = 10
const placeWeight = 3
const stoneTopWeight = [
  30, -12,  0, -1, -1,  0, -12,  30,
  -12, -15, -3, -3, -3, -3, -15, -12,
  0, -3, 0, -1, -1, 0, -3, 0,
  -1, -3, -1, -1, -1, -1, -3, -1,
]
const stoneBottomWeight = [
  -1, -3, -1, -1, -1, -1, -3, -1,
  0, -3, 0, -1, -1, 0, -3, 0,
  -12, -15, -3, -3, -3, -3, -15, -12,
  30, -12,  0, -1, -1,  0, -12,  30,
]

export function evaluate(reversi) {
  var movableScore = movableWeight * (reversi.playerLegalCount - reversi.opponentLegalCount)
  var placeScore = placeWeight * (calcPlaceScore(reversi.p_board) - calcPlaceScore(reversi.o_board))
  return movableScore + placeScore
}

function calcPlaceScore(bitboard) {
  var score = 0
  var flag = 0x80000000
  for(var i=0; i<32; i++) {
    if(((flag >>> i) & bitboard.top) != 0) {
      score += stoneTopWeight[i]
    }
    if(((flag >>> i) & bitboard.bottom) != 0) {
      score += stoneBottomWeight[i]
    }
  }
  return score
}