/*
 Version: core-1.0
 The MIT License: Copyright (c) 2012 LiosK.
*/
"use strict";

function UUID() {}UUID.generate = function () {
  var a = UUID._gri,
      b = UUID._ha;return b(a(32), 8) + "-" + b(a(16), 4) + "-" + b(16384 | a(12), 4) + "-" + b(32768 | a(14), 4) + "-" + b(a(48), 12);
};UUID._gri = function (a) {
  return 0 > a ? NaN : 30 >= a ? 0 | Math.random() * (1 << a) : 53 >= a ? (0 | 1073741824 * Math.random()) + 1073741824 * (0 | Math.random() * (1 << a - 30)) : NaN;
};UUID._ha = function (a, b) {
  for (var c = a.toString(16), d = b - c.length, e = "0"; 0 < d; d >>>= 1, e += e) d & 1 && (c = e + c);return c;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV1aWQuY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFJQSxTQUFTLElBQUksR0FBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUMsWUFBVTtBQUFDLE1BQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJO01BQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUE7Q0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxTQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFBLEFBQUMsR0FBQyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUEsR0FBRSxVQUFVLElBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLElBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQSxBQUFDLENBQUEsQUFBQyxHQUFDLEdBQUcsQ0FBQTtDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxPQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLE1BQUksQ0FBQyxFQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7Q0FBQyxDQUFDIiwiZmlsZSI6InV1aWQuY29yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gVmVyc2lvbjogY29yZS0xLjBcbiBUaGUgTUlUIExpY2Vuc2U6IENvcHlyaWdodCAoYykgMjAxMiBMaW9zSy5cbiovXG5mdW5jdGlvbiBVVUlEKCl7fVVVSUQuZ2VuZXJhdGU9ZnVuY3Rpb24oKXt2YXIgYT1VVUlELl9ncmksYj1VVUlELl9oYTtyZXR1cm4gYihhKDMyKSw4KStcIi1cIitiKGEoMTYpLDQpK1wiLVwiK2IoMTYzODR8YSgxMiksNCkrXCItXCIrYigzMjc2OHxhKDE0KSw0KStcIi1cIitiKGEoNDgpLDEyKX07VVVJRC5fZ3JpPWZ1bmN0aW9uKGEpe3JldHVybiAwPmE/TmFOOjMwPj1hPzB8TWF0aC5yYW5kb20oKSooMTw8YSk6NTM+PWE/KDB8MTA3Mzc0MTgyNCpNYXRoLnJhbmRvbSgpKSsxMDczNzQxODI0KigwfE1hdGgucmFuZG9tKCkqKDE8PGEtMzApKTpOYU59O1VVSUQuX2hhPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWEudG9TdHJpbmcoMTYpLGQ9Yi1jLmxlbmd0aCxlPVwiMFwiOzA8ZDtkPj4+PTEsZSs9ZSlkJjEmJihjPWUrYyk7cmV0dXJuIGN9O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9