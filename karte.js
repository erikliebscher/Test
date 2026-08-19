(function () {
  // Hinweis: Diese Datei verwendet bewusst KEIN CSS (kein <style>, keine
  // style="..."-Attribute, auch nicht per JS über .style.xyz gesetzt). Grund:
  // Manche TYPO3-Installationen setzen eine sehr strikte Content-Security-
  // Policy (style-src 'none'), die JEDES CSS blockiert, auch inline.
  //
  // Damit die Karte trotzdem in jedem Setup funktioniert UND sich schön
  // gestalten lässt (abgerundete Ecken, eigene Schriftart, Schatten), wird
  // hier ALLES per <canvas> gezeichnet - die Karte selbst, die farbige
  // Hervorhebung, UND das Popup samt Kasten, Titel, Text und Schließen-
  // Knopf. Ein natives <dialog>-Element hätten wir zwar auch ohne CSS
  // benutzen können, aber dessen Aussehen (eckige Ecken, Standardschrift)
  // lässt sich ohne CSS nicht verändern - deshalb zeichnen wir das Popup
  // jetzt komplett selbst, mit voller Kontrolle über Form und Schrift, ohne
  // dabei auch nur ein Bit CSS zu benötigen.
  //
  // Und: dieses Skript liegt in einer EXTERNEN .js-Datei statt inline im
  // HTML, weil manche CSP-Regeln zwar externe Skripte vom selben Server
  // erlauben (script-src 'self'), aber eingebettete <script>-Blöcke
  // blockieren.

  var TEXTE = {
    rosa: {
      titel: "Sachsen-Coburg und Gotha",
      absaetze: [
        "Das Gothaer Land ging an Herzog Ernst von Coburg, der als Ernst I. das neue Doppelherzogtum Sachsen-Coburg und Gotha begründete.",
        "Die Nebenkarte rechts unten zeigt das Fürstentum Lichtenberg. Eine auf dem Gebiet der heutigen Bundesländer Rheinland-Pfalz und Saarland gelegene Exklave, die dem Coburger Herzog in Folge des Wiener Kongresses zugesprochen worden war."
      ]
    },
    gelb: {
      titel: "Sachsen-Meiningen",
      absaetze: [
        "Sachsen-Meiningen konnte sein Territorium erweitern: Es erhielt das bisherige Herzogtum Hildburghausen, zudem Saalfeld und andere kleinere Gebiete aus dem Coburger Besitz sowie kleine Teile Altenburgs."
      ]
    },
    orange: {
      titel: "Sachsen-Altenburg",
      absaetze: [
        "Der Herzog von Hildburghausen verzichtete ganz auf sein bisheriges Territorium und erhielt dafür den Großteil des Landes Altenburg, das nun wieder ein eigenständiges Territorium wurde."
      ]
    }
  };

  var FARBEN = {
    rosa:   "#e6007e",
    gelb:   "#f2c200",
    orange: "#ff8c00"
  };

  var REGIONS = [
    { group: "rosa", points: [[674,835],[661,816],[643,834],[627,830],[621,812],[656,795],[601,777],[573,739],[551,738],[578,717],[551,697],[528,705],[511,664],[541,646],[539,623],[553,624],[553,598],[536,586],[544,573],[541,555],[565,553],[588,566],[620,576],[631,568],[625,552],[668,533],[678,544],[699,542],[693,530],[723,511],[726,541],[707,551],[704,567],[724,578],[737,593],[725,610],[707,605],[682,611],[698,615],[701,636],[726,634],[712,653],[729,659],[738,639],[752,650],[770,641],[784,650],[754,667],[775,671],[768,694],[733,698],[707,749],[718,769],[698,769],[696,783],[712,780],[708,828],[682,841],[674,835]] },
    { group: "rosa", points: [[745,1146],[720,1125],[740,1113],[737,1088],[713,1082],[706,1069],[696,1064],[696,1049],[682,1049],[668,1032],[651,1026],[652,1019],[652,1003],[674,1006],[690,993],[730,994],[752,1005],[767,1031],[775,1019],[788,1032],[805,1016],[811,1033],[823,1033],[840,1073],[856,1082],[854,1102],[865,1107],[853,1109],[840,1122],[815,1121],[799,1114],[780,1102],[763,1109],[768,1131],[757,1131],[748,1147],[745,1146]] },
    { group: "rosa", points: [[632,1219],[610,1211],[596,1194],[576,1190],[588,1176],[609,1183],[618,1202],[631,1194],[635,1220],[632,1219]] },
    { group: "rosa", points: [[604,474],[626,467],[618,447],[610,435],[612,422],[610,401],[604,396],[592,405],[571,396],[569,402],[593,413],[590,438],[605,473],[604,474]] },
    { group: "rosa", points: [[1318,1169],[1326,1147],[1338,1136],[1335,1122],[1354,1103],[1370,1113],[1372,1104],[1380,1119],[1405,1103],[1407,1089],[1399,1082],[1397,1064],[1404,1045],[1449,992],[1488,978],[1515,992],[1504,1008],[1522,1005],[1532,1016],[1548,1006],[1546,1044],[1510,1052],[1465,1069],[1468,1096],[1429,1103],[1411,1121],[1397,1135],[1404,1150],[1390,1146],[1398,1168],[1389,1178],[1382,1164],[1367,1178],[1351,1178],[1341,1188],[1318,1168],[1318,1169]] },

    { group: "gelb", points: [[535,709],[504,755],[523,799],[541,819],[546,867],[582,894],[593,868],[625,882],[635,910],[625,927],[644,934],[635,953],[661,949],[693,952],[698,934],[715,848],[740,859],[758,936],[794,939],[827,917],[836,877],[853,882],[870,866],[883,812],[905,817],[921,791],[954,777],[963,789],[987,769],[1004,777],[998,789],[1026,799],[1021,808],[979,804],[972,822],[944,834],[931,864],[924,850],[907,851],[904,866],[924,876],[932,897],[955,910],[961,939],[952,970],[940,958],[943,939],[925,919],[898,933],[874,939],[868,964],[882,986],[882,1010],[863,1049],[874,1070],[861,1077],[829,1060],[828,1035],[810,1030],[810,1018],[785,1020],[779,1018],[766,1026],[751,1003],[733,996],[684,992],[664,1009],[652,1003],[648,1028],[678,1055],[699,1064],[707,1080],[691,1086],[673,1078],[654,1080],[642,1096],[631,1088],[616,1086],[604,1067],[612,1031],[596,1028],[590,1013],[568,1013],[532,989],[514,953],[462,906],[471,880],[449,848],[457,839],[443,826],[451,775],[438,750],[458,713],[450,698],[460,686],[471,691],[484,671],[502,700],[513,693],[535,709]] },
    { group: "gelb", points: [[1021,590],[1020,561],[1041,558],[1046,546],[1102,522],[1104,541],[1088,556],[1088,562],[1102,558],[1113,568],[1077,587],[1050,590],[1041,587],[1021,590]] },
    { group: "gelb", points: [[798,691],[797,675],[819,670],[832,686],[858,696],[848,701],[848,710],[863,714],[836,738],[834,717],[818,722],[807,703],[819,691],[811,685],[798,691]] },

    { group: "orange", points: [[940,787],[918,762],[904,753],[908,733],[942,733],[935,713],[964,683],[1006,711],[1025,694],[1018,676],[1042,670],[1049,646],[1076,662],[1089,676],[1116,652],[1094,646],[1081,624],[1114,581],[1121,602],[1141,603],[1148,586],[1163,594],[1163,619],[1152,628],[1171,636],[1157,647],[1162,659],[1144,670],[1165,672],[1161,681],[1148,681],[1132,694],[1126,709],[1127,730],[1104,733],[1081,752],[1066,740],[1051,757],[1013,762],[1006,777],[995,770],[963,794],[954,782],[940,786],[940,787]] },
    { group: "orange", points: [[1248,748],[1251,728],[1243,719],[1244,705],[1221,705],[1244,691],[1227,680],[1242,658],[1255,674],[1255,647],[1242,637],[1243,622],[1257,633],[1268,647],[1295,597],[1285,583],[1301,563],[1299,553],[1285,576],[1274,572],[1291,547],[1313,544],[1313,575],[1328,561],[1349,555],[1374,566],[1385,589],[1390,611],[1414,611],[1428,639],[1439,653],[1404,661],[1401,676],[1390,671],[1381,655],[1370,663],[1379,674],[1368,672],[1367,691],[1349,691],[1351,714],[1334,710],[1333,693],[1323,685],[1310,697],[1316,709],[1303,731],[1287,719],[1248,750],[1248,748]] }
  ];

  var NATURAL_W = 1800;
  var NATURAL_H = 1375;

  // Schriftart fürs Popup: Noto Sans. Die ist nicht auf jedem System
  // vorinstalliert, deshalb wird sie hier als eigene Schriftdatei (.woff2,
  // liegt neben dieser .js-Datei) per FontFace-API nachgeladen - das ist
  // reines JavaScript, braucht kein <link rel="stylesheet"> und kein @font-
  // face in einem <style>-Block, funktioniert also auch unter der striktesten
  // CSP. Bis die Schrift geladen ist (meist nur ein paar Millisekunden),
  // greift automatisch der sans-serif-Ersatz in der Liste unten.
  var SCHRIFT = '"Noto Sans", Arial, "Helvetica Neue", sans-serif';
  var schriftenBereit = false;

  function schriftenLaden() {
    if (typeof FontFace === 'undefined') return; // sehr alter Browser - Ersatzschrift greift automatisch
    var regular = new FontFace('Noto Sans', 'url(NotoSans-Regular.woff2)', { weight: '400' });
    var fett = new FontFace('Noto Sans', 'url(NotoSans-Bold.woff2)', { weight: '700' });
    Promise.all([regular.load(), fett.load()]).then(function (geladen) {
      geladen.forEach(function (f) { document.fonts.add(f); });
      schriftenBereit = true;
      draw(); // falls das Popup schon (mit Ersatzschrift) offen war, neu zeichnen
    }).catch(function () {
      // Schriftdatei fehlt/blockiert o.ä. - kein Problem, die Ersatzschrift
      // aus SCHRIFT oben wird einfach weiterverwendet.
    });
  }

  // Feste Akzentfarbe für Kasten-Streifen und Schließen-Knopf im Popup -
  // bewusst unabhängig von der jeweiligen Kartenfarbe (rosa/gelb/orange),
  // die weiterhin nur für die Hervorhebung auf der Karte selbst gilt.
  var POPUP_FARBE = '#2E7178';

  var canvas = document.getElementById('karte');
  var ctx = canvas.getContext('2d');

  var baseImg = new Image();
  var aktiveGruppe = null; // per Klick ausgewählt (Popup offen)
  var hoverGruppe = null;  // aktuell unter der Maus
  var ready = false;

  // Trefferflächen des zuletzt gezeichneten Popups (Kasten + Schließen-Knopf),
  // in Canvas-Pixelkoordinaten - wird bei jedem Zeichnen neu gesetzt und vom
  // Klick-Handler zum Hit-Test benutzt.
  var popupBox = null;
  var popupCloseBtn = null;

  function pointInPolygon(x, y, pts) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1];
      var xj = pts[j][0], yj = pts[j][1];
      var intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function findRegion(x, y) {
    for (var i = 0; i < REGIONS.length; i++) {
      if (pointInPolygon(x, y, REGIONS[i].points)) return REGIONS[i].group;
    }
    return null;
  }

  // Zeichnet die Umrandungen aller Teilflächen einer Gruppe farbig auf den Canvas
  function zeichneGruppe(gruppe, alpha) {
    var farbe = FARBEN[gruppe] || 'red';
    var sx = canvas.width / NATURAL_W;
    var sy = canvas.height / NATURAL_H;

    REGIONS.filter(function (r) { return r.group === gruppe; }).forEach(function (r) {
      ctx.beginPath();
      r.points.forEach(function (p, i) {
        var dx = p[0] * sx, dy = p[1] * sy;
        if (i === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
      });
      ctx.closePath();

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = farbe;
      ctx.fill();
      ctx.restore();

      ctx.lineWidth = Math.max(2, canvas.width / 450);
      ctx.strokeStyle = farbe;
      ctx.stroke();
    });
  }

  // Zeichnet ein Rechteck mit abgerundeten Ecken (per Hand statt über die
  // ctx.roundRect()-Methode, damit es auch in etwas älteren Browsern
  // zuverlässig funktioniert - reines Canvas-Zeichnen, kein CSS nötig).
  function abgerundetesRechteck(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // Bricht einen Text in mehrere Zeilen um, die jeweils in maxWidth passen -
  // Canvas kann das (anders als HTML) nicht von selbst, das übernehmen wir
  // hier per Hand anhand der tatsächlichen Textbreite der aktuellen Schrift.
  function textUmbrechen(text, maxWidth) {
    var woerter = text.split(' ');
    var zeilen = [];
    var zeile = '';
    woerter.forEach(function (wort) {
      var test = zeile ? zeile + ' ' + wort : wort;
      if (ctx.measureText(test).width > maxWidth && zeile) {
        zeilen.push(zeile);
        zeile = wort;
      } else {
        zeile = test;
      }
    });
    if (zeile) zeilen.push(zeile);
    return zeilen;
  }

  // Zeichnet das Popup (abgedunkelter Hintergrund + Kasten mit abgerundeten
  // Ecken, Schlagschatten, Titel, Absätzen und Schließen-Knopf) direkt auf
  // den Haupt-Canvas, oben auf der Karte. Alles reines Canvas-Zeichnen -
  // keine <dialog>-Box, kein CSS, aber dafür volle Gestaltungsfreiheit.
  function popupZeichnen() {
    if (!aktiveGruppe) { popupBox = null; popupCloseBtn = null; return; }
    var info = TEXTE[aktiveGruppe];
    if (!info) { popupBox = null; popupCloseBtn = null; return; }

    // Abgedunkelter Hintergrund über der ganzen Karte (macht deutlich, dass
    // gerade ein Popup im Vordergrund ist - wie bei einem echten Modal).
    ctx.save();
    ctx.fillStyle = 'rgba(25,18,12,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var pad = Math.max(16, Math.round(canvas.width * 0.028));
    var boxW = Math.min(canvas.width - pad * 2, Math.max(280, canvas.width * 0.62), 620);
    var headFont = Math.max(19, Math.round(canvas.width / 40));
    var bodyFont = Math.max(14, Math.round(canvas.width / 60));
    var zeilenAbstand = Math.round(bodyFont * 1.5);

    ctx.font = '700 ' + headFont + 'px ' + SCHRIFT;
    var titelZeilen = textUmbrechen(info.titel, boxW - pad * 2);

    ctx.font = bodyFont + 'px ' + SCHRIFT;
    var absatzZeilen = (info.absaetze || []).map(function (abs) {
      return textUmbrechen(abs, boxW - pad * 2);
    });

    var knopfHoehe = Math.max(36, Math.round(bodyFont * 2.3));

    var inhaltsHoehe = pad;
    inhaltsHoehe += titelZeilen.length * Math.round(headFont * 1.3);
    inhaltsHoehe += Math.round(pad * 0.7);
    absatzZeilen.forEach(function (zeilen, i) {
      inhaltsHoehe += zeilen.length * zeilenAbstand;
      if (i < absatzZeilen.length - 1) inhaltsHoehe += Math.round(zeilenAbstand * 0.4);
    });
    inhaltsHoehe += Math.round(pad * 0.9) + knopfHoehe + pad;

    var boxH = Math.min(inhaltsHoehe, canvas.height - pad * 2);
    var boxX = Math.round((canvas.width - boxW) / 2);
    var boxY = Math.round((canvas.height - boxH) / 2);

    // Kasten mit Schlagschatten und abgerundeten Ecken
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    abgerundetesRechteck(boxX, boxY, boxW, boxH, 18);
    ctx.fillStyle = '#fbf6ec';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(40,30,20,0.18)';
    ctx.stroke();

    // Farbiger Akzentstreifen oben im Kasten (feste Popup-Akzentfarbe)
    ctx.save();
    abgerundetesRechteck(boxX, boxY, boxW, boxH, 18);
    ctx.clip();
    ctx.fillStyle = POPUP_FARBE;
    ctx.fillRect(boxX, boxY, boxW, 7);
    ctx.restore();

    // Text
    ctx.fillStyle = '#2c2117';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    var ty = boxY + pad;
    ctx.font = '700 ' + headFont + 'px ' + SCHRIFT;
    titelZeilen.forEach(function (zeile) {
      ctx.fillText(zeile, boxX + pad, ty);
      ty += Math.round(headFont * 1.3);
    });
    ty += Math.round(pad * 0.7);

    ctx.font = bodyFont + 'px ' + SCHRIFT;
    absatzZeilen.forEach(function (zeilen, i) {
      zeilen.forEach(function (zeile) {
        ctx.fillText(zeile, boxX + pad, ty);
        ty += zeilenAbstand;
      });
      if (i < absatzZeilen.length - 1) ty += Math.round(zeilenAbstand * 0.4);
    });

    // Schließen-Knopf (abgerundet, in der festen Popup-Akzentfarbe) unten rechts im Kasten
    var knopfText = 'Schließen';
    ctx.font = '600 ' + bodyFont + 'px ' + SCHRIFT;
    var knopfBreite = Math.max(Math.round(bodyFont * 6.5), Math.round(ctx.measureText(knopfText).width) + pad * 2);
    var knopfX = boxX + boxW - pad - knopfBreite;
    var knopfY = boxY + boxH - pad - knopfHoehe;
    abgerundetesRechteck(knopfX, knopfY, knopfBreite, knopfHoehe, Math.round(knopfHoehe / 2));
    ctx.fillStyle = POPUP_FARBE;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(knopfText, knopfX + knopfBreite / 2, knopfY + knopfHoehe / 2 + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.restore();

    // Trefferflächen für den Klick-Handler merken (in Canvas-Pixelkoordinaten,
    // nicht in den "natürlichen" 1800x1375-Kartenkoordinaten - das Popup ist
    // an die aktuelle Anzeigegröße gebunden, nicht an die Kartenkoordinaten).
    popupBox = { x: boxX, y: boxY, w: boxW, h: boxH };
    popupCloseBtn = { x: knopfX, y: knopfY, w: knopfBreite, h: knopfHoehe };
  }

  function draw() {
    if (!ready) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // Hover zuerst (dezenter), damit ein zusätzlich per Klick aktiver Bereich
    // sichtbar darüber liegt, falls beide zusammenfallen.
    if (hoverGruppe && hoverGruppe !== aktiveGruppe) {
      zeichneGruppe(hoverGruppe, 0.16);
    }
    if (aktiveGruppe) {
      zeichneGruppe(aktiveGruppe, 0.30);
    }

    popupZeichnen();
  }

  function resizeCanvas() {
    // Ohne eigenes CSS gilt für <body> der Browser-Standardrand (meist 8px
    // links/rechts). Der wird hier abgezogen, damit die Karte nicht seitlich
    // über den sichtbaren Bereich hinausragt (sonst entsteht v.a. auf dem
    // Handy ein horizontaler Scrollbalken).
    var bodyStyle = window.getComputedStyle(document.body);
    var randLinks = parseFloat(bodyStyle.marginLeft) || 0;
    var randRechts = parseFloat(bodyStyle.marginRight) || 0;
    var containerWidth = document.documentElement.clientWidth || window.innerWidth || NATURAL_W;
    var verfuegbar = containerWidth - randLinks - randRechts;
    var w = Math.max(200, Math.round(verfuegbar));
    canvas.width = w;
    canvas.height = Math.round(w * NATURAL_H / NATURAL_W);
    draw();
  }

  var BILDNAME = 'karte.jpg';
  var fehlerEl = document.getElementById('fehlermeldung');

  schriftenLaden();

  baseImg.onload = function () {
    ready = true;
    resizeCanvas();
  };
  baseImg.onerror = function () {
    fehlerEl.textContent =
      'Bild "' + BILDNAME + '" konnte nicht geladen werden. Mögliche Ursachen: ' +
      'die Datei liegt nicht im selben Ordner wie diese HTML-Datei, der Dateiname ' +
      'stimmt nicht exakt überein (Groß-/Kleinschreibung zählt!), oder eine ' +
      'Sicherheitsregel der Seite blockiert das Nachladen von Bildern.';
  };
  baseImg.src = BILDNAME;

  // Nach 4 Sekunden prüfen, ob das Bild immer noch nicht geladen ist
  // (z.B. wenn die Anfrage einfach nie ankommt/hängt, statt sauber zu scheitern)
  setTimeout(function () {
    if (!ready) {
      fehlerEl.textContent =
        'Bild "' + BILDNAME + '" lädt seit mehreren Sekunden nicht. Bitte prüfen, ' +
        'ob die Datei tatsächlich im selben Ordner liegt wie diese HTML-Datei ' +
        'und der Dateiname exakt "karte.jpg" (klein geschrieben) lautet.';
    }
  }, 4000);

  window.addEventListener('resize', resizeCanvas);

  function positionZuNaturalKoordinaten(e) {
    var rect = canvas.getBoundingClientRect();
    var cx = e.clientX - rect.left;
    var cy = e.clientY - rect.top;
    return [cx / rect.width * NATURAL_W, cy / rect.height * NATURAL_H];
  }

  // Wie oben, aber in Canvas-Pixelkoordinaten (canvas.width/height) statt in
  // den "natürlichen" Kartenkoordinaten - für Klicks auf das Popup selbst,
  // dessen Geometrie an die aktuelle Anzeigegröße gebunden ist.
  function positionZuCanvasKoordinaten(e) {
    var rect = canvas.getBoundingClientRect();
    var cx = e.clientX - rect.left;
    var cy = e.clientY - rect.top;
    return [cx / rect.width * canvas.width, cy / rect.height * canvas.height];
  }

  function inRechteck(x, y, rechteck) {
    return !!rechteck && x >= rechteck.x && x <= rechteck.x + rechteck.w &&
      y >= rechteck.y && y <= rechteck.y + rechteck.h;
  }

  function popupSchliessen() {
    aktiveGruppe = null;
    // hoverGruppe ebenfalls zurücksetzen: solange das Popup offen war, wurden
    // Mausbewegungen ignoriert (siehe mousemove-Handler unten), daher könnte
    // hier sonst eine veraltete Hervorhebung von vor dem Öffnen kurz wieder
    // aufblitzen, bis die nächste echte Mausbewegung sie aktualisiert.
    hoverGruppe = null;
    draw();
  }

  // Hervorhebung schon beim Drüberfahren mit der Maus (nicht erst beim Klick).
  // Solange das Popup offen ist, ignorieren wir Hover-Updates - die Karte
  // liegt dann eh abgedunkelt im Hintergrund.
  canvas.addEventListener('mousemove', function (e) {
    if (aktiveGruppe) return;
    var p = positionZuNaturalKoordinaten(e);
    var gruppe = findRegion(p[0], p[1]);
    if (gruppe !== hoverGruppe) {
      hoverGruppe = gruppe;
      draw();
    }
  });

  canvas.addEventListener('mouseleave', function () {
    if (hoverGruppe) {
      hoverGruppe = null;
      draw();
    }
  });

  canvas.addEventListener('click', function (e) {
    // Bei offenem Popup: Klick auf den Schließen-Knopf oder außerhalb des
    // Kastens schließt das Popup; ein Klick innerhalb des Kastens (aber
    // nicht auf den Knopf) tut nichts, statt versehentlich eine neue Region
    // darunter auszuwählen.
    if (aktiveGruppe) {
      var cp = positionZuCanvasKoordinaten(e);
      if (inRechteck(cp[0], cp[1], popupCloseBtn) || !inRechteck(cp[0], cp[1], popupBox)) {
        popupSchliessen();
      }
      return;
    }

    var p = positionZuNaturalKoordinaten(e);
    var gruppe = findRegion(p[0], p[1]);
    if (!gruppe) return;

    aktiveGruppe = gruppe;
    hoverGruppe = null;
    draw();
  });

  // Esc schließt das Popup ebenfalls, wie man es von echten Dialogen kennt.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && aktiveGruppe) popupSchliessen();
  });
})();
