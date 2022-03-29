function zeroPadding(str, length) {
  return "0".repeat(length - str.length) + str;
}

function num2formatBin(number, length) {
  number = number.toString(2);
  return zeroPadding(number, length);
}

function logGridBit() {
  var text = "static bit = {";

  var row = "abcdefgh".split("");
  var col = Array.from(Array(8), (v, k) => k);

  var flag = 0x80000000;
  var not_flag = 0x00000000;

  for (var r of col) {
    text += `"${row[r]}": {`;
    for (var c of col) {
      // console.log(row[r],c+1);
      var t;
      var b;
      if (c < 4) {
        t = flag;
        b = not_flag;
        t >>>= r;
        t >>>= 8 * c;
      } else {
        t = not_flag;
        b = flag;
        b >>>= r;
        b >>>= 8 * c;
      }
      text += `"${c + 1}": ${BigInt(
        "0b" + num2formatBin(t, 32) + num2formatBin(b, 32),
        2
      )}n,`;
    }
    text += "},";
  }

  text += "}";

  console.log(text);
}

function logGridCoord() {
  var text = "static coord = {";

  var row = "abcdefgh".split("");
  var col = Array.from(Array(8), (v, k) => k);

  var flag = 0x80000000;
  var not_flag = 0x00000000;

  for (var r of col) {
    for (var c of col) {
      // console.log(row[r],c+1);
      var t;
      var b;
      if (c < 4) {
        t = flag;
        b = not_flag;
        t >>>= r;
        t >>>= 8 * c;
      } else {
        t = not_flag;
        b = flag;
        b >>>= r;
        b >>>= 8 * c;
      }
      text += `${BigInt(
        "0b" + num2formatBin(t, 32) + num2formatBin(b, 32),
        2
      )}n: "${row[r] + (c + 1)}",`;
    }
  }

  text += "}";

  console.log(text);
}
