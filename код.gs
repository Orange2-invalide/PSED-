const WEBHOOK = "https://discord.com/api/webhooks/1469647368621391913/Enz4RWQbIyr9Xvmroi2vPsqD_jU52Nize7d_HQLwZdSrCcHateDG577wZ0uGq9oIw9D6";
const SHEET_ID = "1djm3JXVXFTuMb0JA5wD0X-5y-4TZfuFxUa2g3z3g_S0";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle("Отчёт PSED")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function submitReport(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var sheet = ss.getSheetByName("Отчёты");
  if (!sheet) sheet = ss.getSheetByName("Sheet1");
  if (!sheet) sheet = ss.getSheetByName("Лист1");
  if (!sheet) {
    var allSheets = ss.getSheets();
    sheet = allSheets.length > 0 ? allSheets[0] : ss.insertSheet("Отчёты");
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Дата", "Имя", "Статик", "Discord ID",
      "Табл ELSH", "Док Табл ELSH",
      "Табл Sandy", "Док Табл Sandy",
      "Вакц ELSH", "Док Вакц ELSH",
      "Вакц Sandy", "Док Вакц Sandy",
      "ПМП День", "Док ПМП День",
      "ПМП Ночь", "Док ПМП Ночь",
      "Справки ELSH", "Док Справки ELSH",
      "Справки Sandy", "Док Справки Sandy",
      "Психолог", "Док Психолог",
      "Деж ELSH", "Док Деж ELSH",
      "Деж Sandy", "Док Деж Sandy",
      "Участие пров", "Док Участие пров",
      "Провед пров", "Док Провед пров",
      "Гос волна", "Док Гос волна",
      "Доп баллы", "Док Доп баллы",
      "Итого", "Статус норм"
    ]);
  }

  sheet.appendRow([
    new Date(),
    data.name, data.staticVal, data.discordId,
    data.t1, data.proofT1,
    data.t2, data.proofT2,
    data.v1, data.proofV1,
    data.v2, data.proofV2,
    data.p1, data.proofP1,
    data.p2, data.proofP2,
    data.s1, data.proofS1,
    data.s2, data.proofS2,
    data.psy, data.proofPsy,
    data.d1, data.proofD1,
    data.d2, data.proofD2,
    data.c1, data.proofC1,
    data.c2, data.proofC2,
    data.wave, data.proofWave,
    data.extra, data.proofExtra,
    data.total, data.normStatus
  ]);

  var t1 = Number(data.t1) || 0;
  var t2 = Number(data.t2) || 0;
  var v1 = Number(data.v1) || 0;
  var v2 = Number(data.v2) || 0;
  var p1 = Number(data.p1) || 0;
  var p2 = Number(data.p2) || 0;
  var s1 = Number(data.s1) || 0;
  var s2 = Number(data.s2) || 0;
  var psy = Number(data.psy) || 0;
  var d1 = Number(data.d1) || 0;
  var d2 = Number(data.d2) || 0;
  var c1 = Number(data.c1) || 0;
  var c2 = Number(data.c2) || 0;
  var wave = Number(data.wave) || 0;
  var extra = Number(data.extra) || 0;
  var total = Number(data.total) || 0;

  var tabletsScore = t1 * 1 + t2 * 2;
  var vaccScore    = v1 * 2 + v2 * 4;
  var pmpScore     = p1 * 3 + p2 * 5;
  var spravkiScore = s1 * 4 + s2 * 5;
  var psyScore     = psy * 60;
  var dutyScore    = d1 * 40 + d2 * 52;
  var checkScore   = c1 * 50 + c2 * 100;
  var waveScore    = wave * 30;

  var totalPmp     = p1 + p2;
  var totalSpravki = s1 + s2;
  var totalChecks  = c1 + c2;

  var discordId = (data.discordId || "").trim();
  var userMention = discordId ? "<@" + discordId + ">" : "Не указан";

  var role1 = "<@&1451273907289194752>";
  var role2 = "<@&1451227172411801848>";

  var normColor = data.normStatus === "Нормы выполнены" ? 3066993 : 15158332;
  var normIcon  = data.normStatus === "Нормы выполнены" ? "✅" : "❌";

  function progressBar(current, required) {
    var pct = Math.min(Math.floor((current / required) * 10), 10);
    var filled = "";
    var empty = "";
    for (var i = 0; i < pct; i++) filled += "🟩";
    for (var i = pct; i < 10; i++) empty += "⬜";
    var percent = Math.min(Math.floor((current / required) * 100), 100);
    return filled + empty + "  " + current + "/" + required + " (" + percent + "%)";
  }

  function pf(url) {
    if (!url || url.trim() === "") return " · ` нет `";
    return " · [📎 док](" + url.trim() + ")";
  }

  function itemLine(emoji, label, count, mult, proofUrl) {
    var score = count * mult;
    if (count === 0 && (!proofUrl || proofUrl.trim() === "")) return "";
    return emoji + " " + label + ": **" + count + "** шт → **" + score + "** б." + pf(proofUrl) + "\n";
  }

  // Собираем строки
  var tabletsLines = "";
  tabletsLines += itemLine("💊", "ELSH (×1)", t1, 1, data.proofT1);
  tabletsLines += itemLine("💊", "Sandy (×2)", t2, 2, data.proofT2);

  var vaccLines = "";
  vaccLines += itemLine("💉", "ELSH (×2)", v1, 2, data.proofV1);
  vaccLines += itemLine("💉", "Sandy (×4)", v2, 4, data.proofV2);

  var pmpLines = "";
  pmpLines += itemLine("🌞", "День (×3)", p1, 3, data.proofP1);
  pmpLines += itemLine("🌙", "Ночь (×5)", p2, 5, data.proofP2);

  var spravkiLines = "";
  spravkiLines += itemLine("📋", "ELSH (×4)", s1, 4, data.proofS1);
  spravkiLines += itemLine("📋", "Sandy (×5)", s2, 5, data.proofS2);

  var psyLines = itemLine("🧠", "Психолог (×60)", psy, 60, data.proofPsy);

  var dutyLines = "";
  dutyLines += itemLine("🏥", "ELSH (×40)", d1, 40, data.proofD1);
  dutyLines += itemLine("🏥", "Sandy (×52)", d2, 52, data.proofD2);

  var checkLines = "";
  checkLines += itemLine("🔍", "Участие (×50)", c1, 50, data.proofC1);
  checkLines += itemLine("🔍", "Проведение (×100)", c2, 100, data.proofC2);

  var waveLines = itemLine("🌊", "Гос волна (×30)", wave, 30, data.proofWave);
  var extraLines = "";
  if (extra > 0) {
    extraLines = "➕ Доп. баллы: **" + extra + "** б." + pf(data.proofExtra) + "\n";
  }

  var msg = {
    content: "# 📋 Новый недельный отчёт\n" +
             role1 + " " + role2 + "\n" +
             "Сотрудник " + userMention + " сдал недельный отчёт!",
    embeds: [
      {
        title: "👤 Информация о сотруднике",
        color: 5793266,
        fields: [
          { name: "📛 Имя",     value: "```" + (data.name || "—") + "```",      inline: true },
          { name: "🔢 Статик",  value: "```" + (data.staticVal || "—") + "```", inline: true },
          { name: "💬 Discord", value: userMention,                              inline: true }
        ]
      },
      {
        title: "💊 Выдача таблеток  ·  " + tabletsScore + " б.",
        color: 3066993,
        description: tabletsLines || "` Нет данных `"
      },
      {
        title: "💉 Вакцинация  ·  " + vaccScore + " б.",
        color: 3447003,
        description: vaccLines || "` Нет данных `"
      },
      {
        title: "🚑 ПМП  ·  " + pmpScore + " б.  (" + totalPmp + " из 30)",
        color: 15844367,
        description: pmpLines || "` Нет данных `"
      },
      {
        title: "📄 Справки  ·  " + spravkiScore + " б.  (" + totalSpravki + " из 50)",
        color: 10181046,
        description: spravkiLines || "` Нет данных `"
      },
      {
        title: "🧠 Психолог  ·  " + psyScore + " б.",
        color: 15277667,
        description: psyLines || "` Нет данных `"
      },
      {
        title: "🏥 Дежурство  ·  " + dutyScore + " б.",
        color: 16750848,
        description: dutyLines || "` Нет данных `"
      },
      {
        title: "🔍 Проверки  ·  " + checkScore + " б.  (" + totalChecks + " из 2)",
        color: 3447003,
        description: checkLines || "` Нет данных `"
      },
      {
        title: "🌊 Гос волна  ·  " + waveScore + " б.",
        color: 1752220,
        description: (waveLines || "` Нет данных `") + (extraLines ? "\n" + extraLines : "")
      },
      {
        title: normIcon + " Итоговый результат",
        color: normColor,
        fields: [
          { name: "🏆 Общий балл", value: "```fix\n" + total + " баллов\n```",            inline: true },
          { name: "➕ Доп. баллы",  value: "```" + extra + "```",                          inline: true },
          { name: "📊 Статус",      value: "```" + (data.normStatus || "—") + "```",       inline: true },
          { name: "\u200b",         value: "**Прогресс выполнения норм:**",                inline: false },
          { name: "🔍 Проверки (≥2)", value: progressBar(totalChecks, 2),                  inline: false },
          { name: "🚑 ПМП (≥30)",    value: progressBar(totalPmp, 30),                    inline: false },
          { name: "📋 Справки (≥50)", value: progressBar(totalSpravki, 50),                inline: false },
          { name: "⭐ Баллы (≥600)",  value: progressBar(total, 600),                      inline: false }
        ],
        footer: { text: "PSED Report System" },
        timestamp: new Date().toISOString()
      }
    ]
  };

  UrlFetchApp.fetch(WEBHOOK, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(msg)
  });

  return { ok: true };
}
