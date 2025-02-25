// script.js

// -------------------------
// 當頁面載入時，設定標題帶入當前月份與年份
document.addEventListener("DOMContentLoaded", function(){
    const titleElem = document.getElementById("calendarTitle");
    const now = new Date();
    const options = { month: 'long', year: 'numeric' };
    titleElem.innerText = `行事历表格 - ${now.toLocaleDateString('en-US', options)}`;
  });
  
  // -------------------------
  // 全局變數：星期、時段標籤、表格資料
  let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let rowLabels = [];  // 例如 "A:18:30-19:30"
  let tableData = {};  // 儲存資料，key 格式 "row-col"
  
  // -------------------------
  // 時段設定功能：根據起始時間、區段數量與區段時長生成時段標籤
  function generateTimeslots(startMinutes, segments, duration) {
    rowLabels = [];
    for (let i = 0; i < segments; i++) {
      let segStart = startMinutes + i * duration;
      let segEnd = startMinutes + (i + 1) * duration;
      let sh = Math.floor(segStart / 60);
      let sm = segStart % 60;
      let eh = Math.floor(segEnd / 60);
      let em = segEnd % 60;
      let timeslot = `${sh}:${sm.toString().padStart(2, '0')}-${eh}:${em.toString().padStart(2, '0')}`;
      let labelPrefix = i < 26 ? String.fromCharCode(65 + i) : (i + 1).toString();
      rowLabels.push(`${labelPrefix}:${timeslot}`);
    }
  }
  // 預設：起始 18:30 (1110分鐘)，5個區段，60分鐘
  generateTimeslots(18 * 60 + 30, 5, 60);
  
  // -------------------------
  // 建立行事曆表格
  function buildTable() {
    const table = document.getElementById("calendarTable");
    table.innerHTML = "";
    // 表頭
    let headerRow = document.createElement("tr");
    let emptyTh = document.createElement("th");
    emptyTh.innerText = "";
    headerRow.appendChild(emptyTh);
    for (let day of days) {
      let th = document.createElement("th");
      th.innerText = day;
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);
    // 資料列
    for (let i = 0; i < rowLabels.length; i++) {
      let tr = document.createElement("tr");
      let th = document.createElement("th");
      th.innerText = rowLabels[i];
      tr.appendChild(th);
      for (let j = 0; j < days.length; j++) {
        let td = document.createElement("td");
        let key = `${i}-${j}`;
        td.innerText = tableData[key] || "";
        td.style.backgroundColor = updateCellColor(td.innerText);
        td.contentEditable = "true";  // 可直接編輯
        td.addEventListener("blur", function() {
          tableData[key] = td.innerText;
          td.style.backgroundColor = updateCellColor(td.innerText);
        });
        td.addEventListener("dblclick", function() { editCell(i, j); });
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }
  
  // -------------------------
  // 根據儲存格內容更新背景色，空白為白色
  function updateCellColor(text) {
    if (!text.trim()) return "white";
    let entries = text.split(",").map(e => e.trim()).filter(e => e);
    let countTeam = entries.filter(e => e.startsWith("[團體]")).length;
    let countPerson = entries.filter(e => e.startsWith("[個人]")).length;
    if (countPerson === 0) return "lightgreen";
    if (countPerson === 1 && countTeam === 0) return "lightgreen";
    return "red";
  }
  
  // -------------------------
  // 更新控制區下拉選單選項
  function populateControls() {
    const timeSlotSelect = document.getElementById("timeSlotSelect");
    timeSlotSelect.innerHTML = "";
    for (let slot of rowLabels) {
      let opt = document.createElement("option");
      opt.value = slot;
      opt.text = slot;
      timeSlotSelect.appendChild(opt);
    }
    const daySelect = document.getElementById("daySelect");
    daySelect.innerHTML = "";
    for (let day of days) {
      let opt = document.createElement("option");
      opt.value = day;
      opt.text = day;
      daySelect.appendChild(opt);
    }
    const removeTimeSlot = document.getElementById("removeTimeSlotSelect");
    removeTimeSlot.innerHTML = "";
    let allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.text = "全部";
    removeTimeSlot.appendChild(allOpt);
    for (let slot of rowLabels) {
      let opt = document.createElement("option");
      opt.value = slot;
      opt.text = slot;
      removeTimeSlot.appendChild(opt);
    }
    const removeDay = document.getElementById("removeDaySelect");
    removeDay.innerHTML = "";
    let allDayOpt = document.createElement("option");
    allDayOpt.value = "all";
    allDayOpt.text = "全部";
    removeDay.appendChild(allDayOpt);
    for (let day of days) {
      let opt = document.createElement("option");
      opt.value = day;
      opt.text = day;
      removeDay.appendChild(opt);
    }
  }
  populateControls();
  buildTable();
  
  // -------------------------
  // 雙擊編輯功能：使用 prompt 編輯要保留的條目
  function editCell(row, col) {
    let key = `${row}-${col}`;
    let current = tableData[key] || "";
    let entries = current.split(",").map(e => e.trim()).filter(e => e);
    if (entries.length <= 1) {
      alert("此儲存格只有一筆資料，無需選擇。");
      return;
    }
    let newSelection = prompt("請輸入要保留的條目，逗號分隔", current);
    if (newSelection !== null) {
      tableData[key] = newSelection;
      buildTable();
    }
  }
  
  // -------------------------
  // 添加內容功能
  document.getElementById("addEntryButton").addEventListener("click", function(){
    const content = document.getElementById("contentInput").value.trim();
    if (!content) { alert("請輸入內容！"); return; }
    const type = document.querySelector("input[name='entryType']:checked").value;
    const entryStr = `[${type}]${content}`;
    const timeIndices = Array.from(document.getElementById("timeSlotSelect").selectedOptions).map(opt => opt.value);
    const dayList = Array.from(document.getElementById("daySelect").selectedOptions).map(opt => opt.value);
    if(timeIndices.length === 0 || dayList.length === 0){ alert("請選擇時段和星期！"); return; }
    for(let slot of timeIndices){
      let row = rowLabels.indexOf(slot);
      for(let day of dayList){
        let col = days.indexOf(day);
        let key = `${row}-${col}`;
        let current = tableData[key] || "";
        tableData[key] = current ? current + ", " + entryStr : entryStr;
      }
    }
    document.getElementById("contentInput").value = "";
    buildTable();
  });
      
  // -------------------------
  // 清空整個表格功能
  document.getElementById("clearTableButton").addEventListener("click", function(){
    tableData = {};
    buildTable();
  });
      
  // -------------------------
  // 清空指定學生功能：依據指定時段與指定星期條件
  document.getElementById("clearStudentButton").addEventListener("click", function(){
    const student = document.getElementById("removeStudentInput").value.trim();
    if(!student){ alert("請輸入要移除的學生姓名！"); return; }
    const selectedTime = Array.from(document.getElementById("removeTimeSlotSelect").selectedOptions).map(opt => opt.value);
    const selectedWeekdays = Array.from(document.getElementById("removeDaySelect").selectedOptions).map(opt => opt.value);
    let expectedRows = null;
    if(selectedTime.length > 0 && !selectedTime.includes("all")){
      expectedRows = selectedTime.map(slot => rowLabels.indexOf(slot));
    }
    let expectedCols = null;
    if(selectedWeekdays.length > 0 && !selectedWeekdays.includes("all")){
      expectedCols = selectedWeekdays.map(day => days.indexOf(day));
    }
    let count = 0;
    for(let key in tableData){
      let [r, c] = key.split("-").map(Number);
      if(expectedRows && !expectedRows.includes(r)) continue;
      if(expectedCols && !expectedCols.includes(c)) continue;
      let entries = tableData[key].split(",").map(e => e.trim());
      let newEntries = entries.filter(e => !e.includes(student));
      if(newEntries.length !== entries.length){
        tableData[key] = newEntries.join(", ");
        count++;
      }
    }
    alert(`已從 ${count} 個儲存格中移除 ${student}`);
    buildTable();
  });
      
  // -------------------------
  // 輸出 HTML 文件功能：生成 HTML 文件並下載
  document.getElementById("exportHtmlButton").addEventListener("click", function(){
    let html = `<html><head><meta charset='UTF-8'><title>行事历表格</title>
    <style>
      body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 20px; }
      h2 { text-align: center; color: #37474f; }
      table { width: 100%; border-collapse: collapse; background: #fff; }
      th, td { border: 1px solid #b0bec5; padding: 10px; text-align: center; }
      th { background: #607d8b; color: #fff; }
      tr:nth-child(even) td { background: #f1f3f5; }
    </style></head><body><h2>行事历表格</h2><table>`;
    html += "<tr><th></th>";
    for(let day of days) {
      html += `<th>${day}</th>`;
    }
    html += "</tr>";
    for(let i = 0; i < rowLabels.length; i++){
      html += `<tr><th>${rowLabels[i]}</th>`;
      for(let j = 0; j < days.length; j++){
        let key = `${i}-${j}`;
        let cellText = tableData[key] || "";
        html += `<td>${cellText}</td>`;
      }
      html += "</tr>";
    }
    html += "</table></body></html>";
    const blob = new Blob([html], {type: "text/html"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calendar.html";
    a.click();
    URL.revokeObjectURL(url);
  });
      
  // -------------------------
  // 載入 HTML 文件功能：從 HTML 文件讀取資料並更新表格
  document.getElementById("loadHtmlButton").addEventListener("click", function(){
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html";
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const content = e.target.result;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const table = doc.querySelector("table");
        if (!table) {
          alert("未找到表格元素！");
          return;
        }
        const rows = table.querySelectorAll("tr");
        tableData = {};
        for (let i = 1; i < rows.length; i++){
          const cells = rows[i].querySelectorAll("th, td");
          if(cells.length === 0) continue;
          const rowHeader = cells[0].textContent.trim();
          let rowIndex = rowLabels.indexOf(rowHeader);
          if(rowIndex === -1) continue;
          for (let j = 1; j < cells.length; j++){
            let cellText = cells[j].textContent.trim();
            let key = `${rowIndex}-${j-1}`;
            tableData[key] = cellText;
          }
        }
        buildTable();
        alert("已成功載入 HTML 文件並更新表格內容！");
      };
      reader.readAsText(file, "UTF-8");
    };
    input.click();
  });
      
  // -------------------------
  // 時段設定功能：根據起始時間、區段數量與區段時長更新時段，並重建表格與控制選項
  document.getElementById("updateTimeslotButton").addEventListener("click", function(){
    const startTimeStr = document.getElementById("startTimeInput").value.trim();
    const segments = parseInt(document.getElementById("segmentCountInput").value.trim());
    const duration = parseInt(document.getElementById("durationInput").value.trim());
    if(!startTimeStr || isNaN(segments) || isNaN(duration)){
      alert("請輸入有效的起始時間、區段選項及區段時長！");
      return;
    }
    const parts = startTimeStr.split(":");
    if(parts.length !== 2){
      alert("起始時間格式錯誤，請使用 HH:MM 格式！");
      return;
    }
    const startHour = parseInt(parts[0]);
    const startMinute = parseInt(parts[1]);
    const startMinutes = startHour * 60 + startMinute;
    generateTimeslots(startMinutes, segments, duration);
    tableData = {}; // 清空現有資料
    buildTable();
    populateControls();
    alert("已更新時段設定並重建表格。");
  });
      
  // -------------------------
  // 利用 html2canvas 將表格生成圖片並下載
  document.getElementById("generateImageButton").addEventListener("click", function(){
    html2canvas(document.getElementById("calendarTable")).then(canvas => {
      // 生成圖片的 DataURL
      const imgData = canvas.toDataURL("image/png");
      // 建立下載連結
      const a = document.createElement("a");
      a.href = imgData;
      a.download = "calendar.png";
      a.click();
    });
  });
  