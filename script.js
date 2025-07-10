// ========== Modal Logic ==========
const modal = document.createElement("div");
modal.id = "lesson-modal";
modal.innerHTML = `
  <div class="modal-backdrop"></div>
  <div class="modal-content">
    <button class="modal-close">&times;</button>
    <div class="modal-body"></div>
  </div>
`;
document.body.appendChild(modal);

const closeModal = () => modal.classList.remove("show");
modal.querySelector(".modal-close").onclick = closeModal;
modal.querySelector(".modal-backdrop")?.addEventListener("click", closeModal);

function openModalWithLesson(path) {
  fetch(path)
    .then(res => res.text())
    .then(html => {
      modal.querySelector(".modal-body").innerHTML = html;
      modal.classList.add("show");
      document.querySelectorAll(".chessnotes").forEach(initBoard);
    });
}

// ========== Load JSON & Render ==========
document.addEventListener("DOMContentLoaded", () => {
  addEndgamesTitle();

  const files = [
    "lessons/endgames/2v1.json",
    "lessons/endgames/2v2.json",
    "lessons/endgames/3v1.json"
  ];

  Promise.all(files.map(f => fetch(f).then(r => r.json())))
    .then(jsonList => {
      const container = document.createElement("div");
      container.className = "card-container";

      jsonList.forEach(data => {
        const card = createCard(data);
        container.appendChild(card);
      });

      document.body.appendChild(container);
    });
});

function addEndgamesTitle() {
  const wrapper = document.createElement("div");
  wrapper.className = "endgames-title";

  const hr1 = document.createElement("hr");
  const h2 = document.createElement("h2");
  h2.textContent = "Endgames";
  const hr2 = document.createElement("hr");

  wrapper.append(hr1, h2, hr2);
  document.body.appendChild(wrapper);
}

function createCard(data) {
  const card = document.createElement("div");
  card.className = "card";

  const h3 = document.createElement("h3");
  h3.textContent = data.title;
  card.appendChild(h3);

 data.sections.forEach(section => {
  const sectionBlock = document.createElement("div");
  sectionBlock.className = "section-block";

  const h4 = document.createElement("h4");
  h4.textContent = section.title;
  sectionBlock.appendChild(h4);

  const group = document.createElement("div");
  group.className = "button-group";

  section.lessons.forEach(lesson => {
    const btn = document.createElement("button");
    btn.className = "lesson-btn";
    btn.textContent = lesson.title;
    btn.onclick = () => openModalWithLesson(`lessons/endgames/${lesson.file}`);
    group.appendChild(btn);
  });

  sectionBlock.appendChild(group);
  card.appendChild(sectionBlock);
});

  return card;
}