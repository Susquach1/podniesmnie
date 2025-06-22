(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  const defaultData = { deaths: 0, falls: 0, slyskLifts: 0, patrykLifts: 0 };
  let data = { ...defaultData };

  async function loadData() {
    try {
      const res = await fetch("https://8217-89-65-148-74.ngrok-free.app/stats");
      const json = await res.json();
      data = { ...defaultData, ...json };
      render();
    } catch (e) {
      console.error("Nie można pobrać danych", e);
    }
  }

  async function saveData(newData) {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      alert("Sesja wygasła. Zaloguj się ponownie.");
      return;
    }

    const res = await fetch("https://8217-89-65-148-74.ngrok-free.app/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ stats: newData }),
    });

    const result = await res.json();

    if (res.ok) {
      data = newData;
      render();
      alert("Zapisano dane!");
    } else {
      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        alert("Token wygasł. Zaloguj się ponownie.");
      } else {
        alert("Błąd: " + (result.error || "Nieznany błąd"));
      }
    }
  }

  function render() {
    $("#deathValue").textContent = data.deaths;
    $("#fallValue").textContent = data.falls;
    $("#slyskValue").textContent = data.slyskLifts;
    $("#patrykValue").textContent = data.patrykLifts;
  }

  function buildAdminForm() {
    modalContent.innerHTML = `
      <h2>Edycja statystyk</h2>
      <label>Śmierci<input type="number" id="dInp" value="${data.deaths}"></label>
      <label>Podnieś mnie<input type="number" id="fInp" value="${data.falls}"></label>
      <label>ŚlyskoNogi podniesień<input type="number" id="sInp" value="${data.slyskLifts}"></label>
      <label>Patryk podniesień<input type="number" id="pInp" value="${data.patrykLifts}"></label>
      <button id="saveBtn">Zapisz</button>
    `;
    $("#saveBtn").addEventListener("click", () => {
      const newData = {
        deaths: parseInt($("#dInp").value) || 0,
        falls: parseInt($("#fInp").value) || 0,
        slyskLifts: parseInt($("#sInp").value) || 0,
        patrykLifts: parseInt($("#pInp").value) || 0,
      };
      saveData(newData);
    });
  }

  adminBtn.addEventListener("click", () => {
    modalContent.innerHTML = `
      <h2>Panel admina</h2>
      <label>Hasło<input type="password" id="pwd"></label>
      <button id="pwdBtn">Wejdź</button>
    `;
    $("#pwdBtn").addEventListener("click", async () => {
      const pwd = $("#pwd").value.trim();
      if (!pwd) return;

      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("admin_token", result.token);
        buildAdminForm();
      } else {
        alert("Błędne hasło");
      }
    });
    openModal();
  });

  const hamburger = $("#hamburger");
  const sideNav = $("#sideNav");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    sideNav.classList.toggle("open");
  });

  $$("a", sideNav).forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.dataset.target;
      $$("section").forEach(sec => sec.classList.toggle("active", sec.id === target));
      $$("a", sideNav).forEach(l => l.classList.toggle("active", l === link));
      hamburger.classList.remove("open");
      sideNav.classList.remove("open");
    });
  });

  $$(".stat-box").forEach(box => {
    box.addEventListener("pointermove", e => {
      const rect = box.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const maxTilt = 12;
      const rx = y * maxTilt;
      const ry = -x * maxTilt;
      box.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    box.addEventListener("pointerleave", () => {
      box.style.transform = "rotateX(0) rotateY(0)";
    });
  });

  const modal = $("#modal");
  const modalContent = $("#modalContent");

  function openModal() {
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  loadData();
})();