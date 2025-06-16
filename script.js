// 전역 변수
let categoryList = JSON.parse(localStorage.getItem("categoryList")) || [];
let taskList = JSON.parse(localStorage.getItem("taskList")) || [];
let currentView = "all";
let currentCategory = null;

// DOM
const sidebarHamburger = document.getElementById("sidebar-hamburger");
const mainHamburger = document.getElementById("main-hamburger");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const customCategoryContainer = document.getElementById("custom-category-container");
const taskContainer = document.getElementById("task-container");
const mainHeader = document.getElementById("main-header");
const categoryModal = document.getElementById("category-modal");
const taskModal = document.getElementById("task-modal");
const categoryForm = document.getElementById("category-form");
const taskForm = document.getElementById("task-form");
const addCategoryButton = document.getElementById("add-category-button");
const addTaskButton = document.getElementById("add-task-button");
const cancelAddCategoryButton = document.getElementById("cancel-add-category-button");
const cancelAddTaskButton = document.getElementById("cancel-add-task-button");

// 초기화 실행
init();

// 초기화
function init() {
  renderCategoryList();
  renderTaskList();
  updateTaskCount();
  updateTaskCategorySelectOption();
}

// 카테고리 목록 출력
function renderCategoryList() {
  customCategoryContainer.innerHTML = "";
  categoryList.forEach((category) => {
    const categoryElement = document.createElement("button");
    categoryElement.className = "category";
    categoryElement.dataset.view = "category";
    categoryElement.dataset.category = category.id;

    const count = taskList.filter((task) => task.category === category.id && !task.isCompleted).length;

    categoryElement.innerHTML = `
        <div class="category-content">
          <span>📁</span>
          <p>${category.name}</p>
        </div>
        ${count > 0 ? `<div class="category-task-count">${count}</div>` : ""}`;

    categoryElement.addEventListener("click", (e) => {
      setActiveView("category", category.id, category.name);
    });
    customCategoryContainer.appendChild(categoryElement);
  });
}

// 팀 출력
function renderTeam() {
  const teamMembers = [
    {
      name: "최정빈",
      img: "https://avatars.githubusercontent.com/u/202569352?v=4",
      github: "https://github.com/Choejungbeen",
      portfolio: "https://midtest-lime.vercel.app/",
    },
    {
      name: "신준혁",
      img: "https://avatars.githubusercontent.com/u/68908725?v=4",
      github: "https://github.com/JunHyeokShin",
      portfolio: "https://hyk-portfolio.vercel.app/",
    },
    {
      name: "송명석",
      img: "https://avatars.githubusercontent.com/u/144006149?v=4",
      github: "https://github.com/JoongBuGit",
      portfolio: "http://52.231.101.23:3001/projects_test",
    },
    {
      name: "김용섭",
      img: "https://avatars.githubusercontent.com/u/181037662?v=4",
      github: "https://github.com/yongseop712",
      portfolio: "https://yongseop123.vercel.app/",
    },
  ];

  taskContainer.innerHTML = `
    <section>
      
      <div class="team-grid">
        ${teamMembers
          .map(
            (member) => `
          <div class="team-member">
            <div class="member-img">
              ${member.img ? `<img src="${member.img}" alt="${member.name} 프로필 사진">` : ""}
            </div>
            <h3>${member.name}</h3>
            <p><a href="${member.github}" target="_blank">GitHub</a></p>
            <p><a href="${member.portfolio}" target="_blank">Portfolio</a></p>
          </div>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

// 할 일 목록 출력
function renderTaskList() {
  let ongoingTaskList = [];
  let completedTaskList = [];

  // 진행 중인 할 일들은 날짜 기준 오름차순 정렬, 날짜가 없으면 생성된 시간 기준 오름차순 정렬
  // 완료된 할 일들은 날짜 기준 내림차순 정렬, 날짜가 없으면 생성된 시간 기준 내림차순 정렬
  if (currentView === "all") {
    ongoingTaskList = taskList
      .filter((task) => !task.isCompleted)
      .sort((a, b) => {
        if (a.date === null && b.date === null) {
          return parseInt(a.id) - parseInt(b.id);
        }
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return new Date(a.date) - new Date(b.date);
      });
  } else if (currentView === "common") {
    ongoingTaskList = taskList
      .filter((task) => !task.isCompleted && !task.category)
      .sort((a, b) => {
        if (a.date === null && b.date === null) {
          return parseInt(a.id) - parseInt(b.id);
        }
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return new Date(a.date) - new Date(b.date);
      });
  } else if (currentView === "completed") {
    completedTaskList = taskList
      .filter((task) => task.isCompleted)
      .sort((a, b) => {
        if (a.date === null && b.date === null) {
          return parseInt(b.id) - parseInt(a.id);
        }
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return new Date(b.date) - new Date(a.date);
      });
  } else if (currentView === "category") {
    ongoingTaskList = taskList
      .filter((task) => !task.isCompleted && task.category === currentCategory)
      .sort((a, b) => {
        if (a.date === null && b.date === null) {
          return parseInt(a.id) - parseInt(b.id);
        }
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return new Date(a.date) - new Date(b.date);
      });
    completedTaskList = taskList
      .filter((task) => task.isCompleted && task.category === currentCategory)
      .sort((a, b) => {
        if (a.date === null && b.date === null) {
          return parseInt(b.id) - parseInt(a.id);
        }
        if (a.date === null) return 1;
        if (b.date === null) return -1;
        return new Date(b.date) - new Date(a.date);
      });
  }

  taskContainer.innerHTML = "";

  ongoingTaskList.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task";

    const categoryName = task.category ? categoryList.find((category) => category.id === task.category)?.name || "작업" : "작업";

    taskElement.innerHTML = `
        <input type="checkbox" onchange="toggleTask('${task.id}')" />
        <div class="task-content">
          <p>${task.title}</p>
          <div class="task-info">
            ${task.category ? `<p>${categoryName}</p>` : `<p>작업</>`}
            ${task.date ? `<span>•</span><p>${task.date}</p>` : ""}
          </div>
        </div>
        <button class="delete-button" onclick="deleteTask('${task.id}')">×</button>`;
    taskContainer.appendChild(taskElement);
  });

  if (ongoingTaskList.length !== 0 && completedTaskList.length !== 0) {
    const hr = document.createElement("hr");
    hr.style.margin = "0.75rem 0.5rem";
    taskContainer.appendChild(hr);
  }

  completedTaskList.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task";

    const categoryName = task.category ? categoryList.find((category) => category.id === task.category)?.name || "작업" : "작업";

    taskElement.innerHTML = `
        <input type="checkbox" checked onchange="toggleTask('${task.id}')" />
        <div class="task-content">
          <p class="completed">${task.title}</p>
          <div class="task-info">
            ${task.category ? `<p>${categoryName}</p>` : `<p>작업</p>`}
            ${task.date ? `<span>•</span><p>${task.date}</p>` : ""}
          </div>
        </div>
        <button class="delete-button" onclick="deleteTask('${task.id}')">×</button>`;
    taskContainer.appendChild(taskElement);
  });
}

// 기본 카테고리 카운트 업데이트
function updateTaskCount() {
  const allCount = taskList.filter((task) => !task.isCompleted).length;
  const commonCount = taskList.filter((task) => !task.category && !task.isCompleted).length;
  const allCountElement = document.getElementById("all-count");
  const commonCountElement = document.getElementById("common-count");

  allCountElement.textContent = allCount > 0 ? allCount : "";
  allCountElement.style.display = allCount > 0 ? "flex" : "none";

  commonCountElement.textContent = commonCount > 0 ? commonCount : "";
  commonCountElement.style.display = commonCount > 0 ? "flex" : "none";
}

// 새로운 할 일 카테고리 선택 옵션 업데이트
function updateTaskCategorySelectOption() {
  const select = document.getElementById("task-category-select");
  select.innerHTML = `<option value="">작업</option>`;

  categoryList.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

// 활성 뷰 설정
function setActiveView(view, categoryId = null, title = "") {
  document.querySelectorAll(".category").forEach((item) => {
    item.classList.remove("active");
  });

  currentView = view;
  currentCategory = categoryId;
  if (currentView === "team") {
    mainHeader.innerHTML = `
        <div class="main-header-left">
          <span>👥</span>
          <h2>팀</h2>
        </div>`;
    document.querySelector(`[data-view="team"]`).classList.add("active");
    renderTeam();
  } else if (currentView === "all") {
    mainHeader.innerHTML = `
        <div class="main-header-left">
          <span>♾️</span>
          <h2>모두</h2>
        </div>`;
    document.querySelector(`[data-view="all"]`).classList.add("active");
    renderTaskList();
  } else if (currentView === "common") {
    mainHeader.innerHTML = `
        <div class="main-header-left">
          <span>📋</span>
          <h2>작업</h2>
        </div>`;
    document.querySelector(`[data-view="common"]`).classList.add("active");
    renderTaskList();
  } else if (currentView === "completed") {
    mainHeader.innerHTML = `
        <div class="main-header-left">
          <span>✅</span>
          <h2>완료됨</h2>
        </div>`;
    document.querySelector(`[data-view="completed"]`).classList.add("active");
    renderTaskList();
  } else if (currentView === "category") {
    mainHeader.innerHTML = `
        <div class="main-header-left">
          <span>📁</span>
          <h2>${title}</h2>
        </div>
        <button class="delete-button" onclick="deleteCategory('${categoryId}')">×</button>`;
    document.querySelector(`[data-category="${categoryId}"]`).classList.add("active");
    renderTaskList();
  }

  // 모바일 화면 사이드바 닫기
  if (window.innerWidth <= 800) {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
}

// 할 일 완료 토글
function toggleTask(taskId) {
  const task = taskList.find((task) => task.id === taskId);
  if (task) {
    task.isCompleted = !task.isCompleted;
    localStorage.setItem("taskList", JSON.stringify(taskList));
    renderTaskList();
    updateTaskCount();
    renderCategoryList();
  }
}

// 할 일 삭제
function deleteTask(taskId) {
  if (confirm("이 할 일을 삭제하시겠습니까?")) {
    taskList = taskList.filter((task) => task.id !== taskId);
    localStorage.setItem("taskList", JSON.stringify(taskList));
    renderTaskList();
    renderCategoryList();
    updateTaskCount();
  }
}

// 카테고리 삭제
function deleteCategory(categoryId) {
  if (confirm("이 카테고리를 삭제하시겠습니까?\n이 카테고리에 속한 모든 할 일은 '작업' 카테고리로 이동됩니다.")) {
    filteredTaskList = taskList.filter((task) => task.category === categoryId);
    filteredTaskList.forEach((task) => (task.category = null));
    localStorage.setItem("taskList", JSON.stringify(taskList));

    categoryList = categoryList.filter((category) => category.id !== categoryId);
    localStorage.setItem("categoryList", JSON.stringify(categoryList));

    if (currentView === "category" && currentCategory === categoryId) {
      setActiveView("all", null);
    }

    renderCategoryList();
    renderTaskList();
    updateTaskCount();
    updateTaskCategorySelectOption();
  }
}

// '팀' 카테고리 클릭 이벤트 처리
document.querySelector('[data-view="team"]').addEventListener("click", () => {
  setActiveView("team", null);
});

// '모두' 카테고리 클릭 이벤트 처리
document.querySelector('[data-view="all"]').addEventListener("click", () => {
  setActiveView("all", null);
});

// '작업' 카테고리 클릭 이벤트 처리
document.querySelector('[data-view="common"]').addEventListener("click", () => {
  setActiveView("common", null);
});

// '완료됨' 카테고리 클릭 이벤트 처리
document.querySelector('[data-view="completed"]').addEventListener("click", () => {
  setActiveView("completed", null);
});

// 모바일 화면 햄버거 메뉴 클릭 이벤트 처리
sidebarHamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

// 모바일 화면 햄버거 메뉴 클릭 이벤트 처리
mainHamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

// 모바일 화면 사이드바 외부 빈 공간 클릭 이벤트 처리
overlay.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

// 카테고리 추가 버튼 클릭 이벤트 처리
addCategoryButton.addEventListener("click", () => {
  categoryModal.style.display = "flex";
  document.getElementById("category-name-input").focus();
});

// 할 일 추가 버튼 클릭 이벤트 처리
addTaskButton.addEventListener("click", () => {
  taskModal.style.display = "flex";
  document.getElementById("task-title-input").focus();
});

// 카테고리 추가 모달 취소 버튼 클릭 이벤트 처리
cancelAddCategoryButton.addEventListener("click", () => {
  categoryModal.style.display = "none";
  categoryForm.reset();
});

// 할 일 추가 모달 취소 버튼 클릭 이벤트 처리
cancelAddTaskButton.addEventListener("click", () => {
  taskModal.style.display = "none";
  taskForm.reset();
});

// 카테고리 추가 모달 외부 빈 공간 클릭 이벤트 처리
categoryModal.addEventListener("click", (e) => {
  if (e.target == categoryModal) {
    categoryModal.style.display = "none";
    categoryForm.reset();
  }
});

// 할 일 추가 모달 외부 빈 공간 클릭 이벤트 처리
taskModal.addEventListener("click", (e) => {
  if (e.target == taskModal) {
    taskModal.style.display = "none";
    taskForm.reset();
  }
});

// 카테고리 추가 폼 제출 이벤트 처리
categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("category-name-input").value.trim();

  if (name && !categoryList.find((category) => category.name === name)) {
    const newCategory = {
      id: Date.now().toString(),
      name,
    };

    categoryList.push(newCategory);
    localStorage.setItem("categoryList", JSON.stringify(categoryList));

    renderCategoryList();
    updateTaskCategorySelectOption();
    categoryModal.style.display = "none";
    categoryForm.reset();
  }
});

// 할 일 추가 폼 제출 이벤트 처리
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("task-title-input").value.trim();
  const date = document.getElementById("task-date-input").value !== "" ? document.getElementById("task-date-input").value : null;
  const category = document.getElementById("task-category-select").value !== "" ? document.getElementById("task-category-select").value : null;

  if (title) {
    const newTask = {
      id: Date.now().toString(),
      title,
      date,
      category,
      isCompleted: false,
    };

    taskList.push(newTask);
    localStorage.setItem("taskList", JSON.stringify(taskList));

    renderTaskList();
    renderCategoryList();
    updateTaskCount();
    taskModal.style.display = "none";
    taskForm.reset();
  }
});
