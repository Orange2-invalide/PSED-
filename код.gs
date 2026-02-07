const WEBHOOK = "https://discord.com/api/webhooks/1469647368621391913/Enz4RWQbIyr9Xvmroi2vPsqD_jU52Nize7d_HQLwZdSrCcHateDG577wZ0uGq9oIw9D6";
const SHEET_ID = "1Uio02r-l23au8HclHr7VnUwa0bdXzUBRwSvy2JWInmk";

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
      "Табл ELSH", "Табл Sandy",
      "Вакц ELSH", "Вакц Sandy",
      "ПМП День", "ПМП Ночь",
      "Справки ELSH", "Справки Sandy",
      "Психолог", "Деж ELSH", "Деж Sandy",
      "Участие пров", "Провед пров",
      "Гос волна", "Доп баллы",
      "Итого", "Статус норм"
    ]);
  }

  sheet.appendRow([
    new Date(),
    data.name, data.staticVal, data.discordId,
    data.t1, data.t2,
    data.v1, data.v2,
    data.p1, data.p2,
    data.s1, data.s2,
    data.psy, data.d1, data.d2,
    data.c1, data.c2,
    data.wave, data.extra,
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

  var msg = {
    content: "# 📋 Новый недельный отчёт\n" +
             role1 + " " + role2 + "\n" +
             "Сотрудник " + userMention + " сдал недельный отчёт!",
    embeds: [
      {
        title: "👤 Информация о сотруднике",
        color: 5793266,
        fields: [
          { name: "📛 Имя",        value: "```" + (data.name || "—") + "```",      inline: true },
          { name: "🔢 Статик",     value: "```" + (data.staticVal || "—") + "```", inline: true },
          { name: "💬 Discord",    value: userMention,                              inline: true }
        ]
      },
      {
        title: "💊 Выдача таблеток  ·  " + tabletsScore + " баллов",
        color: 3066993,
        fields: [
          { name: "ELSH (×1)",  value: "```" + t1 + " шт → " + (t1 * 1) + " б.```",  inline: true },
          { name: "Sandy (×2)", value: "```" + t2 + " шт → " + (t2 * 2) + " б.```",  inline: true }
        ]
      },
      {
        title: "💉 Вакцинация  ·  " + vaccScore + " баллов",
        color: 3447003,
        fields: [
          { name: "ELSH (×2)",  value: "```" + v1 + " шт → " + (v1 * 2) + " б.```",  inline: true },
          { name: "Sandy (×4)", value: "```" + v2 + " шт → " + (v2 * 4) + " б.```",  inline: true }
        ]
      },
      {
        title: "🚑 ПМП  ·  " + pmpScore + " баллов",
        color: 15844367,
        fields: [
          { name: "День (×3)",  value: "```" + p1 + " шт → " + (p1 * 3) + " б.```", inline: true },
          { name: "Ночь (×5)",  value: "```" + p2 + " шт → " + (p2 * 5) + " б.```", inline: true },
          { name: "Всего ПМП",  value: "```" + totalPmp + " из 30```",               inline: true }
        ]
      },
      {
        title: "📄 PSED  ·  " + (spravkiScore + psyScore + dutyScore + checkScore + waveScore) + " баллов",
        color: 10181046,
        fields: [
          { name: "📋 Справки ELSH (×4)",          value: "```" + s1 + " шт → " + (s1 * 4) + " б.```",    inline: true },
          { name: "📋 Справки Sandy (×5)",         value: "```" + s2 + " шт → " + (s2 * 5) + " б.```",    inline: true },
          { name: "📊 Всего справок",              value: "```" + totalSpravki + " из 50```",               inline: true },
          { name: "🧠 Психолог (×60)",             value: "```" + psy + " шт → " + psyScore + " б.```",   inline: true },
          { name: "🏥 Дежурство ELSH (×40)",       value: "```" + d1 + " шт → " + (d1 * 40) + " б.```",   inline: true },
          { name: "🏥 Дежурство Sandy (×52)",      value: "```" + d2 + " шт → " + (d2 * 52) + " б.```",   inline: true },
          { name: "🔍 Участие проверка (×50)",     value: "```" + c1 + " шт → " + (c1 * 50) + " б.```",   inline: true },
          { name: "🔍 Проведение проверка (×100)", value: "```" + c2 + " шт → " + (c2 * 100) + " б.```",  inline: true },
          { name: "🌊 Гос волна (×30)",            value: "```" + wave + " шт → " + waveScore + " б.```",  inline: true }
        ]
      },
      {
        title: normIcon + " Итоговый результат",
        color: normColor,
        fields: [
          { name: "🏆 Общий балл",   value: "```fix\n" + total + " баллов\n```", inline: true },
          { name: "➕ Доп. баллы",    value: "```" + extra + "```",               inline: true },
          { name: "📊 Статус",        value: "```" + (data.normStatus || "—") + "```", inline: true },
          { name: "\u200b",           value: "**Прогресс выполнения норм:**",     inline: false },
          { name: "🔍 Проверки (≥2)", value: progressBar(totalChecks, 2),          inline: false },
          { name: "🚑 ПМП (≥30)",    value: progressBar(totalPmp, 30),            inline: false },
          { name: "📋 Справки (≥50)", value: progressBar(totalSpravki, 50),        inline: false },
          { name: "⭐ Баллы (≥600)",  value: progressBar(total, 600),              inline: false }
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
