const $ = (id) => document.getElementById(id);
let currentPortfolio = null;

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const result = response.status === 204 ? {} : await response.json();
  if (response.status === 401) {
    window.location.href = "/";
    throw new Error("Please log in again.");
  }
  if (!response.ok) throw new Error(result.message || "Request failed.");
  return result;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function showMessage(id, message, isError = false) {
  $(id).textContent = message;
  $(id).className = isError ? "message error" : "message success";
}

async function loadPortfolio() {
  const { user } = await api("/api/auth/me");
  $("welcomeUser").textContent = `Hi, ${user.name.split(" ")[0]}`;
  $("heroName").textContent = user.name;
  $("yearNow").textContent = new Date().getFullYear();

  const { portfolio } = await api("/api/portfolio");
  currentPortfolio = portfolio;
  $("heroHeadline").textContent = portfolio.headline;
  $("headline").value = portfolio.headline || "";
  $("aboutText").value = portfolio.about || "";
  $("location").value = portfolio.location || "";
  $("phone").value = portfolio.phone || "";
  renderEducation();
  renderSkills();
  renderProjects();
}

function renderEducation() {
  $("educationList").innerHTML = currentPortfolio.education.length
    ? currentPortfolio.education.map(item => `
      <article class="data-row">
        <div><strong>${escapeHTML(item.course)}</strong><p>${escapeHTML(item.institution)} ${item.year ? "· " + escapeHTML(item.year) : ""}</p></div>
        <div class="row-actions"><button class="text-button" data-edit-education="${item._id}">Edit</button><button class="text-button danger" data-delete-education="${item._id}">Delete</button></div>
      </article>`).join("")
    : '<p class="empty-state">Your education details will appear here. Add your first entry above.</p>';
}

function renderSkills() {
  $("skillList").innerHTML = currentPortfolio.skills.length
    ? currentPortfolio.skills.map(skill => `<span class="skill-chip">${escapeHTML(skill)} <button aria-label="Delete ${escapeHTML(skill)}" data-delete-skill="${escapeHTML(skill)}">×</button></span>`).join("")
    : '<p class="empty-state">Add the skills you are learning or practising.</p>';
}

function renderProjects() {
  $("projectList").innerHTML = currentPortfolio.projects.length
    ? currentPortfolio.projects.map(item => `
      <article class="project-tile">
        <div class="project-symbol">✧</div><h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description || "A project in my learning journey.")}</p>
        ${item.link ? `<a href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">View project ↗</a>` : ""}
        <div class="row-actions"><button class="text-button" data-edit-project="${item._id}">Edit</button><button class="text-button danger" data-delete-project="${item._id}">Delete</button></div>
      </article>`).join("")
    : '<p class="empty-state">Your projects will appear here. Add something you have built.</p>';
}

$("profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const { portfolio } = await api("/api/portfolio", {
      method: "PUT",
      body: JSON.stringify({
        headline: $("headline").value,
        about: $("aboutText").value,
        location: $("location").value,
        phone: $("phone").value
      })
    });
    currentPortfolio = portfolio;
    $("heroHeadline").textContent = portfolio.headline;
    showMessage("profileMessage", "Your profile has been saved.");
  } catch (error) { showMessage("profileMessage", error.message, true); }
});

$("educationForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const { portfolio } = await api("/api/portfolio/education", {
      method: "POST",
      body: JSON.stringify({ course: $("course").value, institution: $("institution").value, year: $("year").value })
    });
    currentPortfolio = portfolio;
    $("educationForm").reset();
    renderEducation();
  } catch (error) { alert(error.message); }
});

$("skillForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const { portfolio } = await api("/api/portfolio/skills", {
      method: "POST", body: JSON.stringify({ skill: $("skillInput").value })
    });
    currentPortfolio = portfolio;
    $("skillForm").reset();
    renderSkills();
  } catch (error) { alert(error.message); }
});

$("projectForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const { portfolio } = await api("/api/portfolio/projects", {
      method: "POST",
      body: JSON.stringify({
        title: $("projectTitle").value,
        description: $("projectDescription").value,
        link: $("projectLink").value
      })
    });
    currentPortfolio = portfolio;
    $("projectForm").reset();
    renderProjects();
  } catch (error) { alert(error.message); }
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  try {
    if (target.dataset.deleteSkill) {
      if (!confirm(`Delete the skill "${target.dataset.deleteSkill}"?`)) return;
      const { portfolio } = await api("/api/portfolio/skills", {
        method: "DELETE", body: JSON.stringify({ skill: target.dataset.deleteSkill })
      });
      currentPortfolio = portfolio; renderSkills();
    }

    if (target.dataset.deleteEducation) {
      if (!confirm("Delete this education record?")) return;
      const { portfolio } = await api(`/api/portfolio/education/${target.dataset.deleteEducation}`, { method: "DELETE" });
      currentPortfolio = portfolio; renderEducation();
    }

    if (target.dataset.editEducation) {
      const item = currentPortfolio.education.find(x => x._id === target.dataset.editEducation);
      const course = prompt("Course / class:", item.course);
      if (course === null) return;
      const institution = prompt("School / college:", item.institution);
      if (institution === null) return;
      const year = prompt("Year:", item.year || "");
      if (year === null) return;
      const { portfolio } = await api(`/api/portfolio/education/${item._id}`, {
        method: "PUT", body: JSON.stringify({ course, institution, year })
      });
      currentPortfolio = portfolio; renderEducation();
    }

    if (target.dataset.deleteProject) {
      if (!confirm("Delete this project?")) return;
      const { portfolio } = await api(`/api/portfolio/projects/${target.dataset.deleteProject}`, { method: "DELETE" });
      currentPortfolio = portfolio; renderProjects();
    }

    if (target.dataset.editProject) {
      const item = currentPortfolio.projects.find(x => x._id === target.dataset.editProject);
      const title = prompt("Project title:", item.title);
      if (title === null) return;
      const description = prompt("Description:", item.description || "");
      if (description === null) return;
      const link = prompt("Project link (optional):", item.link || "");
      if (link === null) return;
      const { portfolio } = await api(`/api/portfolio/projects/${item._id}`, {
        method: "PUT", body: JSON.stringify({ title, description, link })
      });
      currentPortfolio = portfolio; renderProjects();
    }
  } catch (error) { alert(error.message); }
});

$("logoutButton").addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  } catch (error) { alert(error.message); }
});

loadPortfolio().catch(error => alert(error.message));
