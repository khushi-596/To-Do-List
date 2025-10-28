window.onload = function () {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formatted = `${yyyy}-${mm}-${dd}`;
  const dateInput = document.getElementById("dueDateInput");
  if (dateInput) {
    dateInput.value = formatted;
    dateInput.min = formatted;
  }
  loadTasks();
};

document.getElementById("taskInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") addTask();
});

function toggleDailyTask() {
  const isDaily = document.getElementById("dailyTaskCheckbox").checked;
  const dateInput = document.getElementById("dueDateInput");
  const priorityInput = document.getElementById("priorityInput");
  
  if (isDaily) {
    dateInput.style.display = "none";
    priorityInput.style.display = "none";
  } else {
    dateInput.style.display = "block";
    priorityInput.style.display = "block";
  }
}

function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const dateInputEl = document.getElementById("dueDateInput");
  const isDaily = document.getElementById("dailyTaskCheckbox").checked;
  let date = dateInputEl.value;
  const priority = document.getElementById("priorityInput").value;
  if (text === "") return;

  if (isDaily) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const currentDate = `${yyyy}-${mm}-${dd}`;
    createTaskElement(text, "", "Medium", false, true, currentDate);
  } else {
    const todayMin = dateInputEl.min || (function(){
      const t = new Date();
      const y = t.getFullYear();
      const m = String(t.getMonth() + 1).padStart(2, "0");
      const d = String(t.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    })();
    if (date && date < todayMin) {
      alert("Please select a valid date (today or future). Date has been reset to today.");
      date = todayMin;
      dateInputEl.value = todayMin;
    }
    createTaskElement(text, date, priority, false, false, null);
  }

  saveTasks();
  document.getElementById("taskInput").value = "";
  document.getElementById("dailyTaskCheckbox").checked = false;
  toggleDailyTask();
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  document.getElementById("dueDateInput").value = `${yyyy}-${mm}-${dd}`;
  document.getElementById("priorityInput").value = "Low";
}

function sortByDate() {
  const list = Array.from(document.querySelectorAll("#taskList li"));
  list.sort((a, b) => {
    const aIsDaily = a.classList.contains("daily-task");
    const bIsDaily = b.classList.contains("daily-task");
    
    if (aIsDaily && !bIsDaily) return -1;
    if (!aIsDaily && bIsDaily) return 1;
    
    const ad = a.querySelector(".due")?.textContent?.replace("Due: ", "") || "";
    const bd = b.querySelector(".due")?.textContent?.replace("Due: ", "") || "";
    if (ad === "" && bd === "") return 0;
    if (ad === "") return 1;
    if (bd === "") return -1;
    if (ad < bd) return -1;
    if (ad > bd) return 1;
    return 0;
  });
  const ul = document.getElementById("taskList");
  ul.innerHTML = "";
  list.forEach(li => ul.appendChild(li));
  saveTasks();
}

function sortByPriority() {
  const map = { High: 1, Medium: 2, Low: 3, Daily: 0 };
  const list = Array.from(document.querySelectorAll("#taskList li"));
  list.sort((a, b) => {
    const aIsDaily = a.classList.contains("daily-task");
    const bIsDaily = b.classList.contains("daily-task");
    
    if (aIsDaily && !bIsDaily) return -1;
    if (!aIsDaily && bIsDaily) return 1;
    
    const ap = a.querySelector(".priority")?.textContent || "Low";
    const bp = b.querySelector(".priority")?.textContent || "Low";
    return map[ap] - map[bp];
  });
  const ul = document.getElementById("taskList");
  ul.innerHTML = "";
  list.forEach(li => ul.appendChild(li));
  saveTasks();
}

function createTaskElement(text, date, priority, completed, isDailyTask = false, currentDate = null) {
  const li = document.createElement("li");
  if (completed) li.classList.add("completed");
  if (isDailyTask) li.classList.add("daily-task");

  const taskText = document.createElement("div");
  taskText.style.display = "flex";
  taskText.style.flexDirection = "column";
  taskText.style.flexGrow = "1";

  const title = document.createElement("strong");
  title.textContent = text;
  title.style.cursor = "pointer";
  title.onclick = () => {
    li.classList.toggle("completed");
    saveTasks();
  };

  taskText.appendChild(title);

  if (isDailyTask) {
    const dailyLabel = document.createElement("span");
    dailyLabel.className = "daily-label";
    dailyLabel.textContent = "Daily Task";
    dailyLabel.style.fontSize = "0.8em";
    dailyLabel.style.color = "#666";
    taskText.appendChild(dailyLabel);
  } else if (date) {
    const due = document.createElement("span");
    due.className = "due";
    due.textContent = `Due: ${date}`;
    taskText.appendChild(due);
  }

  li.appendChild(taskText);

  if (isDailyTask) {
    const dailyBadge = document.createElement("span");
    dailyBadge.className = "priority Daily";
    dailyBadge.textContent = "Daily";
    li.appendChild(dailyBadge);
  } else {
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority ${priority}`;
    priorityBadge.textContent = priority;
    li.appendChild(priorityBadge);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = () => {
    li.remove();
    saveTasks();
  };

  li.appendChild(deleteBtn);
  document.getElementById("taskList").appendChild(li);
}

function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    const text = li.querySelector("strong").textContent;
    const isDailyTask = li.classList.contains("daily-task");
    
    if (isDailyTask) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const currentDate = `${yyyy}-${mm}-${dd}`;
      
      tasks.push({
        text: text,
        date: "",
        priority: "Medium",
        completed: li.classList.contains("completed"),
        isDailyTask: true,
        currentDate: currentDate
      });
    } else {
      const date = li.querySelector(".due")?.textContent?.replace("Due: ", "") || "";
      const priority = li.querySelector(".priority").textContent;
      tasks.push({
        text: text,
        date: date,
        priority: priority,
        completed: li.classList.contains("completed"),
        isDailyTask: false,
        currentDate: null
      });
    }
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  
  saved.forEach(t => {
    if (t.isDailyTask) {
      const shouldReset = t.currentDate !== todayStr;
      const completedStatus = shouldReset ? false : t.completed;
      createTaskElement(t.text, t.date, t.priority, completedStatus, t.isDailyTask, todayStr);
    } else {
      createTaskElement(t.text, t.date, t.priority, t.completed, t.isDailyTask || false, t.currentDate);
    }
  });
}

function clearAll() {
  document.getElementById("taskList").innerHTML = "";
  localStorage.removeItem("tasks");
}
