"use strict";
(() => {
  // src/client/screens/today.js
  function createTodayScreen(ui) {
    const { enter, heading, readinessMarkup, saveStatus, bindSaveStatus, route, checkin, sheet } = ui;
    function today() {
      enter("home-overview", "home");
      const resume = REP_TRAINING_SESSION.isResumableWorkout(state, sessions), plan = window.REP_ENHANCEMENTS_UI.adaptiveTodayPlan(), id = resume ? state.session : plan.targetSession, s = sessions[id] || { name: "Recovery day", meta: "No scheduled workout", description: plan.detail, exercises: [] }, ls = sessionText(id, s), duration = id ? s.duration || ls.meta.match(/\d+[–-]\d+ min|\d+ min/)?.[0] || "" : "";
      const sessionDetail = id ? [duration || null, `${s.exercises.length} exercises`, resume ? `Exercise ${state.index + 1}` : null].filter(Boolean).map(esc).join(" \xB7 ") : "A lighter day for rest, gentle movement, and your daily practices.";
      app.innerHTML = REP_SAFE_DOM.sanitize(`${heading("Today", (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }))}<section class="today-session" data-today-session><div><span class="muted">${resume ? "In progress" : id ? "Today's workout" : "Today\u2019s focus"}</span><h2>${esc(ls.name)}</h2><p>${sessionDetail}</p></div><button class="primary-action" data-today-start>${resume ? "Resume workout" : id ? "Start workout" : "Review recovery"}</button><button class="quiet-action" data-today-preview>${id ? "Review exercises" : "View routines"}</button></section>${readinessMarkup()}<nav class="quick-actions" aria-label="Quick actions"><button data-adjust-today>Adjust today</button><button data-today-activity>Log activity</button><button data-today-food>Meal / water</button><button data-today-checkin>Check-in</button></nav>${saveStatus()}<section data-daily-routines></section>`);
      document.querySelector("[data-today-start]").onclick = () => {
        if (!id) {
          route("health-vitals");
          return;
        }
        if (!resume) REP_ADAPTIVE_COACH.applyPlan(state, plan, sessions);
        startSession(id);
      };
      document.querySelector("[data-today-preview]").onclick = () => id ? showSessionPreview(id) : route("training-program");
      document.querySelector("[data-adjust-today]").onclick = () => sheet("Adjust today", `<p>Choose a lighter option using your existing plan.</p><button class="primary-action" data-adjust-light>Short workout</button><button data-adjust-schedule>Move this workout</button>`, (root, close) => {
        root.querySelector("[data-adjust-light]").onclick = () => {
          close();
          renderBadDay();
        };
        root.querySelector("[data-adjust-schedule]").onclick = () => {
          close();
          route("settings-schedule");
        };
      });
      document.querySelector("[data-today-activity]").onclick = () => showLogActivity();
      document.querySelector("[data-today-food]").onclick = () => route("nutrition-log");
      document.querySelector("[data-today-checkin]").onclick = checkin;
      window.REP_HABITS.mount();
      bindSaveStatus();
      const totals = foodTotals(), water = Number(state.water?.[isoDay()] || 0), overview = document.createElement("nav");
      overview.className = "daily-overview";
      overview.setAttribute("aria-label", "Daily overview");
      overview.innerHTML = REP_SAFE_DOM.sanitize(`<a href="#/nutrition/today"><strong>${Math.round(totals.calories || 0)}</strong><span>Calories logged</span></a><a href="#/nutrition/today"><strong>${esc(window.waterDisplay(water))}</strong><span>Water today</span></a><a href="#/wellbeing/recovery"><strong>Check in</strong><span>Recovery & sleep</span></a>`);
      app.querySelector(".quick-actions")?.before(overview);
    }
    return { today };
  }

  // src/client/screens/training.js
  function createTrainingScreen(ui) {
    const { enter, heading, route, preferences, sheet } = ui;
    let library = { query: "", equipment: "all", muscle: "all" };
    function routineCard(id, s) {
      const favourite = state.routineFavourites.includes(id), resume = REP_TRAINING_SESSION.isResumableWorkout(state, sessions, id);
      return `<article class="routine-card" data-routine-card="${esc(id)}"><div><h2>${esc(s.name)}</h2><p>${s.exercises.length} exercises${s.duration ? ` \xB7 ${esc(s.duration)}` : ""}</p></div><button data-routine-favourite="${esc(id)}" aria-pressed="${favourite}" aria-label="${favourite ? "Unfavourite" : "Favourite"} ${esc(s.name)}">${favourite ? "\u2605" : "\u2606"}</button><div class="routine-actions"><button class="primary-action" data-session="${esc(id)}">${resume ? "Resume" : "Preview"}</button>${id.startsWith("custom-") ? `<button data-edit-custom="${esc(id)}">Edit</button>` : ""}</div></article>`;
    }
    function train() {
      enter("home", "train");
      state.trainingView = "program";
      window.REP_CUSTOM_WORKOUTS.getCustomRoutines();
      const ids = Object.keys(sessions).filter((id) => !["bad", "gymLite"].includes(id)).sort((a, b) => Number(state.routineFavourites.includes(b)) - Number(state.routineFavourites.includes(a)));
      app.innerHTML = REP_SAFE_DOM.sanitize(`${heading("Train", "Your routines, this week, and exercise technique.")}<nav class="screen-shortcuts" aria-label="Training shortcuts"><button data-train-jump="routines">Routines</button><button data-train-jump="library">Find exercise</button><button data-train-jump="schedule">Schedule</button></nav><section class="train-week"><h2>This week</h2><div class="week-plan">${window.REP_ENHANCEMENTS_UI.dayNames.map((day) => {
        const focus = window.REP_ENHANCEMENTS_UI.daySchedule(day)?.focus || state.preferences?.schedule?.[day]?.focus || "rest";
        return `<div><span>${esc(day.slice(0, 3))}</span><strong>${esc(window.REP_ENHANCEMENTS_UI.focusLabel(focus))}</strong></div>`;
      }).join("")}</div><button data-train-schedule>Edit schedule</button></section><div class="section-title"><h2>Workout routines</h2><button class="primary-action" data-create-new-routine>New routine</button></div><section class="routine-list">${ids.map((id) => routineCard(id, sessions[id])).join("")}</section><section class="exercise-library"><h2>Exercise library</h2><label>Search exercises<input type="search" data-library-search value="${esc(library.query)}" placeholder="Exercise or muscle"></label><div class="library-filters"><label>Equipment<select data-library-equipment>${["all", "machines", "dumbbells", "barbell", "bands", "bodyweight", "cardio"].map((x) => `<option value="${x}" ${library.equipment === x ? "selected" : ""}>${x === "all" ? "All equipment" : x}</option>`).join("")}</select></label><label>Muscle<select data-library-muscle><option value="all">All muscles</option>${[...new Set(REP_EXERCISES.list().flatMap((x) => x.muscleTags))].sort().map((x) => `<option ${library.muscle === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></label></div><p data-library-count role="status"></p><div data-library-results></div></section><details class="supporting-details"><summary>Plan tools and safety</summary><button data-train-review>Technique review</button><button data-train-planreview>Program checkpoint</button><button data-train-export>Export / share plan</button></details>`);
      app.querySelectorAll("[data-train-jump]").forEach((button) => button.onclick = () => {
        const target = app.querySelector({ routines: ".routine-list", library: ".exercise-library", schedule: ".train-week" }[button.dataset.trainJump]);
        target?.scrollIntoView({ block: "start", behavior: "instant" });
        if (button.dataset.trainJump === "library") target.querySelector("input")?.focus({ preventScroll: true });
      });
      document.querySelectorAll("[data-session]").forEach((b) => b.onclick = () => showSessionPreview(b.dataset.session));
      document.querySelectorAll("[data-routine-favourite]").forEach((b) => b.onclick = () => {
        preferences.toggleFavourite(state, b.dataset.routineFavourite);
        persist();
        train();
      });
      document.querySelectorAll("[data-edit-custom]").forEach((b) => b.onclick = () => window.REP_CUSTOM_WORKOUTS.openRoutineBuilderModal(b.dataset.editCustom));
      document.querySelector("[data-create-new-routine]").onclick = () => window.REP_CUSTOM_WORKOUTS.openRoutineBuilderModal();
      document.querySelector("[data-train-schedule]").onclick = () => route("settings-schedule");
      document.querySelector("[data-train-review]").onclick = renderReview;
      document.querySelector("[data-train-planreview]").onclick = renderProgramReview;
      document.querySelector("[data-train-export]").onclick = () => {
        sheet("Plan tools", "<button data-plan-export>Export plan</button>", (root) => root.querySelector("[data-plan-export]").onclick = exportData);
      };
      for (const [selector, key] of [["[data-library-search]", "query"], ["[data-library-equipment]", "equipment"], ["[data-library-muscle]", "muscle"]]) document.querySelector(selector).addEventListener(key === "query" ? "input" : "change", (e) => {
        library[key] = e.target.value;
        renderLibrary();
      });
      renderLibrary();
    }
    function renderLibrary() {
      const query = library.query.toLowerCase().trim(), rows = REP_EXERCISES.list().filter((x) => (!query || `${x.name} ${x.targetMuscles || ""}`.toLowerCase().includes(query)) && (library.equipment === "all" || x.equipmentTags.includes(library.equipment)) && (library.muscle === "all" || x.muscleTags.includes(library.muscle)));
      const results = document.querySelector("[data-library-results]");
      if (!results) return;
      document.querySelector("[data-library-count]").textContent = `${rows.length} exercises`;
      results.innerHTML = REP_SAFE_DOM.sanitize(rows.map((x) => `<button class="library-row" data-library-exercise="${esc(x.name)}"><strong>${esc(x.name)}</strong><span>${esc(x.targetMuscles || x.category || "General movement")}</span></button>`).join("") || "<p>No matching exercise. Change your search or filters.</p>");
      results.querySelectorAll("[data-library-exercise]").forEach((b) => b.onclick = () => exerciseDetails(b.dataset.libraryExercise));
    }
    function exerciseDetails(name) {
      const item = REP_EXERCISES.get(name);
      sheet(name, `<div class="library-demo">${REP_MEDIA_PLAYER.markup(item, { preview: true, context: "library" })}</div><p>${esc(item.setup)}</p><p>${esc(item.execution)}</p><p><strong>Key cue:</strong> ${esc(item.cues)}</p><p><strong>Avoid:</strong> ${esc(item.avoid)}</p>`, () => REP_MEDIA_PLAYER.mount());
    }
    return { train };
  }

  // src/client/screens/nutrition.js
  function createNutritionScreen(ui) {
    const { enter, heading, route, core } = ui;
    function nutrition() {
      enter("nutrition", "food");
      core.nutrition();
      window.REP_ENHANCEMENTS_UI.nutrition();
      const head = app.querySelector(".food-head"), disclosure = app.querySelector(".nutrition-disclosure");
      if (head) head.innerHTML = REP_SAFE_DOM.sanitize(heading("Nutrition", "Today\u2019s food, water, and quick meal entry."));
      app.querySelector(".connection-banner")?.remove();
      const composer = app.querySelector(".meal-composer"), dashboard = app.querySelector(".macro-dashboard");
      const summary = document.createElement("section");
      summary.className = "nutrition-summary";
      const totals = foodTotals(todayFoodEntries()), profile = foodProfile(), water = Number(state.water[isoDay()]) || 0;
      summary.innerHTML = REP_SAFE_DOM.sanitize(`<h2>Today so far</h2><dl><div><dt>Energy</dt><dd>${Math.round(totals.calories)}<span>/ ${profile.calories} kcal</span></dd></div><div><dt>Protein</dt><dd>${Math.round(totals.protein_g)}<span>/ ${profile.protein} g</span></dd></div><div><dt>Water</dt><dd>${esc(window.waterDisplay(water))}<span>/ ${esc(window.waterDisplay(profile.water))}</span></dd></div></dl>`);
      head?.after(summary);
      const shortcut = document.createElement("nav");
      shortcut.className = "nutrition-actions";
      shortcut.setAttribute("aria-label", "Nutrition actions");
      shortcut.innerHTML = REP_SAFE_DOM.sanitize('<button class="primary-action" data-nutrition-log>Log meal</button><button data-nutrition-water>Water</button>');
      summary.after(shortcut);
      shortcut.querySelector("[data-nutrition-log]").onclick = () => route("nutrition-log");
      shortcut.querySelector("[data-nutrition-water]").onclick = () => {
        state.nutritionView = "today";
        nutrition();
        app.querySelector(".water-card")?.scrollIntoView({ block: "center" });
      };
      if (state.nutritionView === "today") {
        const navSection = app.querySelector('[data-nav-for="nutrition"]'), recent = app.querySelector(".food-log");
        if (recent && navSection) navSection.after(recent);
        if (dashboard) {
          const details = document.createElement("details");
          details.className = "nutrition-details";
          details.innerHTML = REP_SAFE_DOM.sanitize("<summary>Targets and nutrition breakdown</summary>");
          dashboard.replaceWith(details);
          details.append(dashboard);
        }
        const reminder = app.querySelector(".reminder-strip");
        if (reminder) {
          const details = document.createElement("details");
          details.className = "nutrition-details";
          details.innerHTML = REP_SAFE_DOM.sanitize("<summary>Nutrition routine and supplements</summary>");
          reminder.replaceWith(details);
          details.append(reminder);
        }
      }
      if (composer) {
        composer.querySelector(".estimate-pill").textContent = "Optional AI estimate";
        if (disclosure) composer.append(disclosure);
      }
      const connection = document.createElement("button");
      connection.className = "quiet-action";
      connection.dataset.nutritionConnect = "true";
      connection.textContent = "Set up nutrition connections";
      connection.onclick = () => route("settings-sync");
      app.append(connection);
      if (state.nutritionView === "log") composer?.scrollIntoView({ block: "start" });
      app.querySelectorAll("[data-food-text],[data-food-macro]").forEach((input) => input.addEventListener("input", () => {
        if (!state.foodDraft) return;
        if (input.dataset.foodText) state.foodDraft[input.dataset.foodText] = String(input.value || "").slice(0, 2e3);
        if (input.dataset.foodMacro) state.foodDraft[input.dataset.foodMacro] = Math.max(0, Number(input.value) || 0);
        persistDebounced();
      }));
    }
    return { nutrition };
  }

  // src/client/screens/progress.js
  function createProgressScreen(ui) {
    const { enter, heading, route } = ui;
    let historyFilter = { query: "", from: "", to: "" };
    function historyMarkup() {
      const q = historyFilter.query.toLowerCase(), rows = (state.history || []).filter((x) => {
        const day = String(x.date || "").slice(0, 10);
        return (!historyFilter.from || day >= historyFilter.from) && (!historyFilter.to || day <= historyFilter.to) && (!q || `${sessions[x.session]?.name || x.activityLabel || x.session} ${(x.entries || []).map((e) => e.exercise).join(" ")}`.toLowerCase().includes(q));
      });
      return `<p>${rows.length} sessions</p>${rows.map((x) => `<article class="history-result"><h3>${esc(sessions[x.session]?.name || x.activityLabel || x.session)}</h3><p>${esc(String(x.date || "").slice(0, 10))} \xB7 ${Math.round((Number(x.duration) || 0) / 60)} min \xB7 ${Number(x.sets) || 0} sets</p><details><summary>Logged exercises</summary>${(x.entries || []).map((e) => `<p>${esc(e.exercise)} \xB7 ${esc(String(e.weight || "\u2014"))} kg \xB7 ${esc(String(e.reps || "\u2014"))} reps${e.rpe ? ` \xB7 RPE ${esc(e.rpe)}` : ""}</p>`).join("") || "<p>No detailed set records.</p>"}</details></article>`).join("") || "<p>Complete your first workout to see its history here.</p>"}`;
    }
    function progress() {
      enter("insights", "insights");
      const weekly = REP_PRODUCT_SUITE.weeklySummary(state, void 0, REP_PERFORMANCE_INSIGHTS), model = REP_PERFORMANCE_INSIGHTS.analyze(state), lifts = model.strength?.exercises || [], selected = state.progressExercise || lifts[0]?.exercise, exercise = lifts.find((x) => x.exercise === selected), proposals = state.progressionProposals || [];
      app.innerHTML = REP_SAFE_DOM.sanitize(`${heading("Progress", "Consistency, performance, and your next step.")}<nav class="screen-shortcuts" aria-label="Progress shortcuts"><button data-open-weekly>Weekly report</button><button data-open-history>Workout history</button></nav><section class="progress-overview"><h2>Am I following my plan?</h2><p class="metric-value">${weekly.completed} / ${weekly.planned}</p><p>Planned sessions completed this week${weekly.totalWorkouts > weekly.completed ? ` \xB7 ${weekly.totalWorkouts - weekly.completed} additional activities` : ""}</p></section><section class="exercise-progress"><h2>Am I improving?</h2>${lifts.length ? `<label>Exercise<select data-progress-exercise>${lifts.map((x) => `<option ${x.exercise === selected ? "selected" : ""}>${esc(x.exercise)}</option>`).join("")}</select></label><p>${esc(exercise?.recommendation || "Establishing a baseline")} \xB7 ${exercise?.sessionCount || 0} logged sessions</p>${exercise?.currentE1rm ? `<p>Best estimated 1RM: ${esc(String(exercise.currentE1rm))} kg</p><p>${exercise.change28d === null ? "More sessions are needed for a 28-day comparison." : `${exercise.change28d > 0 ? "+" : ""}${exercise.change28d}% over 28 days`}</p>` : ""}` : "<p>Log weight and reps across several sessions to see a reliable exercise trend.</p>"}</section><section class="next-step"><h2>What should I do next?</h2><p>${esc(weekly.nextAction)}</p><button class="primary-action" data-progress-train>Open routines</button>${proposals.length ? `<details><summary>Next-session targets</summary>${window.REP_ENHANCEMENTS_UI.progressionCard(proposals)}</details>` : ""}</section><section class="progress-history"><h2>Workout history</h2><label>Search sessions or exercises<input type="search" data-history-search value="${esc(historyFilter.query)}"></label><div class="history-dates"><label>From<input type="date" data-history-from value="${historyFilter.from}"></label><label>To<input type="date" data-history-to value="${historyFilter.to}"></label></div><div data-history-results>${historyMarkup()}</div></section><details class="supporting-details progress-analysis"><summary>Weekly report and detailed analysis</summary><div class="trends-grid"></div>${window.REP_PRODUCT_UI.weeklyCard()}${window.REP_PRODUCT_UI.experimentsCard()}${window.REP_HEALTH_UI.trendMarkup()}</details>`);
      app.querySelector("[data-open-weekly]").onclick = () => {
        app.querySelector(".progress-analysis").open = true;
        const report = app.querySelector("[data-product-weekly]");
        report.scrollIntoView({ block: "start", behavior: "instant" });
        const title = report.querySelector("h2");
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
      };
      app.querySelector("[data-open-history]").onclick = () => {
        app.querySelector(".progress-history").scrollIntoView({ block: "start", behavior: "instant" });
        app.querySelector("[data-history-search]").focus({ preventScroll: true });
      };
      document.querySelector("[data-progress-train]").onclick = () => route("training-program");
      document.querySelector("[data-accept-progression]")?.addEventListener("click", () => {
        window.REP_ENHANCEMENTS_UI.acceptProgression(proposals);
        progress();
      });
      document.querySelector("[data-progress-exercise]")?.addEventListener("change", (e) => {
        state.progressExercise = e.target.value;
        progress();
      });
      for (const [selector, key] of [["[data-history-search]", "query"], ["[data-history-from]", "from"], ["[data-history-to]", "to"]]) document.querySelector(selector).addEventListener(key === "query" ? "input" : "change", (e) => {
        historyFilter[key] = e.target.value;
        document.querySelector("[data-history-results]").innerHTML = REP_SAFE_DOM.sanitize(historyMarkup());
      });
      window.REP_PRODUCT_UI.bindWeekly(app.querySelector("[data-product-weekly]"));
      window.REP_PRODUCT_UI.bindExperiments(app.querySelector("[data-product-experiments]"));
      window.REP_PERFORMANCE_UI.mount();
      window.REP_HEALTH_UI.bind();
    }
    return { progress };
  }

  // src/client/screens/wellbeing.js
  function createWellbeingScreens(ui) {
    const { enter, heading, readinessMarkup, saveStatus, bindSaveStatus, route, checkin, core } = ui;
    function wellbeing() {
      enter("wellbeing", "wellbeing");
      app.innerHTML = REP_SAFE_DOM.sanitize(`${heading("Wellbeing", "Daily practices and recovery in one place.")}<section class="more-menu">${[["Daily practices", "Habits, hygiene and journal", "health-wellness"], ["Recovery & health", "Sleep, check-ins and measurements", "health-vitals"]].map(([title, detail, id]) => `<button data-more-route="${id}"><strong>${title}</strong><span>${detail}</span><b aria-hidden="true">\u2192</b></button>`).join("")}</section><section data-daily-routines></section>${readinessMarkup()}${saveStatus()}`);
      app.querySelectorAll("[data-more-route]").forEach((b) => b.onclick = () => route(b.dataset.moreRoute));
      window.REP_HABITS.mount();
      bindSaveStatus();
    }
    function recovery() {
      enter("vitals", "vitals");
      core.vitals();
      const old = document.createElement("div");
      while (app.firstChild) old.append(app.firstChild);
      const sleep = old.querySelector(".sleep-card");
      app.innerHTML = REP_SAFE_DOM.sanitize(`${heading("Recovery", "Sleep and recovery inputs support your training.")}<button data-more-back>\u2190 Wellbeing</button>${readinessMarkup()}<nav class="quick-actions"><button data-recovery-checkin>Quick check-in</button><button data-recovery-measurements>Measurements</button></nav><details class="recovery-sleep"><summary>Log sleep</summary></details><details class="supporting-details recovery-data"><summary>Health data, baselines and setup</summary>${window.REP_HEALTH_UI.trendMarkup()}</details>`);
      if (sleep) app.querySelector(".recovery-sleep").append(sleep);
      old.querySelectorAll(".hero,.strain-recovery-card,.recovery-head").forEach((x) => x.remove());
      app.querySelector(".recovery-data").append(old);
      app.querySelector("[data-more-back]").onclick = () => route("wellbeing");
      app.querySelector("[data-recovery-checkin]").onclick = checkin;
      app.querySelector("[data-recovery-measurements]").onclick = () => {
        app.querySelector(".recovery-data").open = true;
        app.querySelector("[data-body-measurement]")?.scrollIntoView({ block: "center" });
      };
      window.REP_HEALTH_UI.bind({ onMeasurementSaved: () => {
        recovery();
        app.querySelector(".recovery-data").open = true;
        showToast("Measurements saved on device.");
      } });
      window.REP_PRODUCT_UI.mount();
      updatePrimaryTabs();
    }
    function routines() {
      enter("care", "care");
      core.wellness();
      const oldHead = app.querySelector(".module-head,.recovery-head");
      if (oldHead) oldHead.innerHTML = REP_SAFE_DOM.sanitize(heading("Daily routines", "Your existing hygiene, wellness and journal routines."));
      const back = document.createElement("button");
      back.dataset.moreBack = "true";
      back.textContent = "\u2190 Wellbeing";
      back.onclick = () => route("wellbeing");
      app.prepend(back);
      window.REP_HABITS.mount();
      window.REP_PRODUCT_UI.mount();
      updatePrimaryTabs();
    }
    return { wellbeing, recovery, routines };
  }

  // src/client/screens/registry.ts
  function createScreenRegistry(features) {
    let current = null;
    return Object.freeze({
      show(id) {
        if (current !== null && current !== id) features[current].destroy();
        current = id;
        features[id].mount();
      },
      update() {
        if (current !== null) features[current].update();
      },
      destroy() {
        if (current !== null) features[current].destroy();
        current = null;
      },
      current: () => current
    });
  }

  // src/client/screens/settings.js
  function createSettingsScreen() {
    const mount = () => {
      window.REP_ENHANCEMENTS_UI.settings(state.settingsSection);
      window.AWJ_LOCALE?.apply();
    };
    return { mount, update: mount, destroy() {
    } };
  }

  // src/client/screens/locale.js
  var arabic = {
    "Today": "\u0627\u0644\u064A\u0648\u0645",
    "Train": "\u0627\u0644\u062A\u0645\u0631\u064A\u0646",
    "Nutrition": "\u0627\u0644\u062A\u063A\u0630\u064A\u0629",
    "Wellbeing": "\u0627\u0644\u0639\u0627\u0641\u064A\u0629",
    "Progress": "\u0627\u0644\u062A\u0642\u062F\u0645",
    "Settings": "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A",
    "Daily practices": "\u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
    "Habits, hygiene and journal": "\u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0639\u0646\u0627\u064A\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0648\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A",
    "Recovery & health": "\u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0648\u0627\u0644\u0635\u062D\u0629",
    "Sleep, check-ins and measurements": "\u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0648\u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A",
    "Today\u2019s focus": "\u062A\u0631\u0643\u064A\u0632 \u0627\u0644\u064A\u0648\u0645",
    "Today's workout": "\u062A\u0645\u0631\u064A\u0646 \u0627\u0644\u064A\u0648\u0645",
    "In progress": "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630",
    "Recovery day": "\u064A\u0648\u0645 \u0644\u0644\u062A\u0639\u0627\u0641\u064A",
    "A lighter day for rest, gentle movement, and your daily practices.": "\u064A\u0648\u0645 \u0623\u062E\u0641 \u0644\u0644\u0631\u0627\u062D\u0629 \u0648\u0627\u0644\u062D\u0631\u0643\u0629 \u0627\u0644\u0647\u0627\u062F\u0626\u0629 \u0648\u0639\u0627\u062F\u0627\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629.",
    "Review recovery": "\u0631\u0627\u062C\u0639 \u0627\u0644\u062A\u0639\u0627\u0641\u064A",
    "View routines": "\u0639\u0631\u0636 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646",
    "Review exercises": "\u0639\u0631\u0636 \u0627\u0644\u062D\u0631\u0643\u0627\u062A",
    "Start workout": "\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u0645\u0631\u064A\u0646",
    "Resume workout": "\u0627\u0633\u062A\u0623\u0646\u0641 \u0627\u0644\u062A\u0645\u0631\u064A\u0646",
    "Why this recommendation?": "\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u062A\u0648\u0635\u064A\u0629\u061F",
    "Adjust today": "\u062A\u0639\u062F\u064A\u0644 \u062E\u0637\u0629 \u0627\u0644\u064A\u0648\u0645",
    "Log activity": "\u0633\u062C\u0651\u0644 \u0646\u0634\u0627\u0637\u064B\u0627",
    "Meal / water": "\u0627\u0644\u0637\u0639\u0627\u0645 \u0648\u0627\u0644\u0645\u0627\u0621",
    "Check-in": "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629",
    "Check in": "\u0633\u062C\u0651\u0644 \u062D\u0627\u0644\u062A\u0643",
    "Calories logged": "\u0627\u0644\u0633\u0639\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629",
    "Water today": "\u0627\u0644\u0645\u0627\u0621 \u0627\u0644\u064A\u0648\u0645",
    "Recovery & sleep": "\u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0648\u0627\u0644\u0646\u0648\u0645",
    "Saved on device": "\u0645\u062D\u0641\u0648\u0638 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632",
    "Saving on device\u2026": "\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0641\u0638 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632\u2026",
    "Saved on device \xB7 records synced": "\u0645\u062D\u0641\u0648\u0638 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632 \xB7 \u062A\u0645\u062A \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629",
    "Save needs attention \xB7 open backups": "\u0627\u0644\u062D\u0641\u0638 \u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0627\u0646\u062A\u0628\u0627\u0647 \xB7 \u0627\u0641\u062A\u062D \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629",
    "Daily habits": "\u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
    "DAILY HABITS": "\u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
    "Build the day you want.": "\u0627\u0628\u0646\u0650 \u064A\u0648\u0645\u0643 \u0628\u0639\u0627\u062F\u0627\u062A\u0643.",
    "Reorder": "\u062A\u0631\u062A\u064A\u0628",
    "Open Habit Log": "\u0627\u0641\u062A\u062D \u0633\u062C\u0644 \u0627\u0644\u0639\u0627\u062F\u0627\u062A",
    "View habits": "\u0639\u0631\u0636 \u0627\u0644\u0639\u0627\u062F\u0627\u062A",
    "Close habits": "\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0639\u0627\u062F\u0627\u062A",
    "Sleep": "\u0627\u0644\u0646\u0648\u0645",
    "7\u20138 hours of night sleep": "\u0667\u2013\u0668 \u0633\u0627\u0639\u0627\u062A \u0645\u0646 \u0627\u0644\u0646\u0648\u0645 \u0644\u064A\u0644\u064B\u0627",
    "Night prayer": "\u0642\u064A\u0627\u0645 \u0627\u0644\u0644\u064A\u0644",
    "Fajr prayer": "\u0635\u0644\u0627\u0629 \u0627\u0644\u0641\u062C\u0631",
    "Sadqa": "\u0627\u0644\u0635\u062F\u0642\u0629",
    "Quran wird": "\u0648\u0650\u0631\u062F \u0627\u0644\u0642\u0631\u0622\u0646",
    "Read pages of the Quran": "\u0642\u0631\u0627\u0621\u0629 \u0635\u0641\u062D\u0627\u062A \u0645\u0646 \u0627\u0644\u0642\u0631\u0622\u0646",
    "Quran memorization": "\u062D\u0641\u0638 \u0627\u0644\u0642\u0631\u0622\u0646",
    "Workout": "\u0627\u0644\u062A\u0645\u0631\u064A\u0646",
    "Morning & evening adhkar": "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062D \u0648\u0627\u0644\u0645\u0633\u0627\u0621",
    "Reading": "\u0627\u0644\u0642\u0631\u0627\u0621\u0629",
    "Water": "\u0627\u0644\u0645\u0627\u0621",
    "Surat Al-Kahf": "\u0633\u0648\u0631\u0629 \u0627\u0644\u0643\u0647\u0641",
    "Dua for Baba": "\u062F\u0639\u0627\u0621 \u0644\u0628\u0627\u0628\u0627",
    "START TODAY": "\u0627\u0628\u062F\u0623 \u0627\u0644\u064A\u0648\u0645",
    "Last 7 days": "\u0622\u062E\u0631 \u0667 \u0623\u064A\u0627\u0645",
    "View progress": "\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u062F\u0645",
    "Your routines, this week, and exercise technique.": "\u062A\u0645\u0627\u0631\u064A\u0646\u0643 \u0648\u062E\u0637\u062A\u0643 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629 \u0648\u0637\u0631\u064A\u0642\u0629 \u0623\u062F\u0627\u0621 \u0627\u0644\u062D\u0631\u0643\u0627\u062A.",
    "Routines": "\u0627\u0644\u0628\u0631\u0627\u0645\u062C",
    "Find exercise": "\u0627\u0628\u062D\u062B \u0639\u0646 \u062D\u0631\u0643\u0629",
    "Schedule": "\u0627\u0644\u062C\u062F\u0648\u0644",
    "This week": "\u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639",
    "Edit schedule": "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062C\u062F\u0648\u0644",
    "Workout routines": "\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0645\u0631\u064A\u0646",
    "New routine": "\u0628\u0631\u0646\u0627\u0645\u062C \u062C\u062F\u064A\u062F",
    "Preview": "\u0645\u0639\u0627\u064A\u0646\u0629",
    "Resume": "\u0627\u0633\u062A\u0626\u0646\u0627\u0641",
    "Edit": "\u062A\u0639\u062F\u064A\u0644",
    "Exercise library": "\u0645\u0643\u062A\u0628\u0629 \u0627\u0644\u062D\u0631\u0643\u0627\u062A",
    "Search exercises": "\u0627\u0628\u062D\u062B \u0639\u0646 \u062D\u0631\u0643\u0629",
    "Exercise or muscle": "\u0627\u0644\u062D\u0631\u0643\u0629 \u0623\u0648 \u0627\u0644\u0639\u0636\u0644\u0629",
    "Equipment": "\u0627\u0644\u0645\u0639\u062F\u0627\u062A",
    "Muscle": "\u0627\u0644\u0639\u0636\u0644\u0629",
    "Plan tools and safety": "\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u062E\u0637\u0629 \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629",
    "Technique review": "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0623\u062F\u0627\u0621",
    "Program checkpoint": "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C",
    "Export / share plan": "\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062E\u0637\u0629 \u0623\u0648 \u0645\u0634\u0627\u0631\u0643\u062A\u0647\u0627",
    "Today\u2019s food, water, and quick meal entry.": "\u0627\u0644\u0637\u0639\u0627\u0645 \u0648\u0627\u0644\u0645\u0627\u0621 \u0648\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0648\u062C\u0628\u0627\u062A \u0627\u0644\u064A\u0648\u0645.",
    "Log meal": "\u0633\u062C\u0651\u0644 \u0648\u062C\u0628\u0629",
    "Calories": "\u0627\u0644\u0633\u0639\u0631\u0627\u062A",
    "Protein": "\u0627\u0644\u0628\u0631\u0648\u062A\u064A\u0646",
    "Targets and nutrition breakdown": "\u0627\u0644\u0623\u0647\u062F\u0627\u0641 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u063A\u0630\u064A\u0629",
    "Nutrition routine and supplements": "\u0639\u0627\u062F\u0627\u062A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0645\u0643\u0645\u0644\u0627\u062A",
    "Optional AI estimate": "\u062A\u0642\u062F\u064A\u0631 \u0627\u062E\u062A\u064A\u0627\u0631\u064A \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    "Set up nutrition connections": "\u0625\u0639\u062F\u0627\u062F \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u062A\u063A\u0630\u064A\u0629",
    "Weekly report": "\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A",
    "Workout history": "\u0633\u062C\u0644 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646",
    "Am I following my plan?": "\u0647\u0644 \u0623\u0644\u062A\u0632\u0645 \u0628\u062E\u0637\u062A\u064A\u061F",
    "Am I improving?": "\u0647\u0644 \u064A\u062A\u062D\u0633\u0646 \u0623\u062F\u0627\u0626\u064A\u061F",
    "What should I do next?": "\u0645\u0627 \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629\u061F",
    "Open routines": "\u0627\u0641\u062A\u062D \u0627\u0644\u0628\u0631\u0627\u0645\u062C",
    "Next-session targets": "\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u062C\u0644\u0633\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629",
    "Search sessions or exercises": "\u0627\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0623\u0648 \u0627\u0644\u062D\u0631\u0643\u0627\u062A",
    "From": "\u0645\u0646",
    "To": "\u0625\u0644\u0649",
    "Logged exercises": "\u0627\u0644\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629",
    "No detailed set records.": "\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0641\u0627\u0635\u064A\u0644 \u0644\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A.",
    "Complete your first workout to see its history here.": "\u0623\u0643\u0645\u0644 \u0623\u0648\u0644 \u062A\u0645\u0631\u064A\u0646 \u0644\u0639\u0631\u0636 \u0633\u062C\u0644\u0647 \u0647\u0646\u0627.",
    "Weekly report and detailed analysis": "\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A",
    "Quick check-in": "\u0645\u062A\u0627\u0628\u0639\u0629 \u0633\u0631\u064A\u0639\u0629",
    "Measurements": "\u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A",
    "Log sleep": "\u0633\u062C\u0651\u0644 \u0627\u0644\u0646\u0648\u0645",
    "Health data, baselines and setup": "\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u062E\u0637 \u0627\u0644\u0623\u0633\u0627\u0633 \u0648\u0627\u0644\u0625\u0639\u062F\u0627\u062F",
    "\u2190 Wellbeing": "\u2190 \u0627\u0644\u0639\u0627\u0641\u064A\u0629",
    "Close": "\u0625\u063A\u0644\u0627\u0642",
    "Back": "\u0631\u062C\u0648\u0639",
    "General": "\u0639\u0627\u0645",
    "Targets": "\u0627\u0644\u0623\u0647\u062F\u0627\u0641",
    "Coach": "\u0627\u0644\u062A\u0648\u062C\u064A\u0647",
    "Sync": "\u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629",
    "Security": "\u0627\u0644\u0623\u0645\u0627\u0646",
    "YOUR PREFERENCES": "\u062A\u0641\u0636\u064A\u0644\u0627\u062A\u0643",
    "Make the app feel familiar": "\u0627\u062C\u0639\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0645\u0646\u0627\u0633\u0628\u064B\u0627 \u0644\u0643",
    "Theme Mode": "\u0627\u0644\u0645\u0638\u0647\u0631",
    "Emerald & Ivory": "\u0627\u0644\u0632\u0645\u0631\u062F \u0648\u0627\u0644\u0639\u0627\u062C",
    "Night Emerald": "\u0627\u0644\u0632\u0645\u0631\u062F \u0627\u0644\u0644\u064A\u0644\u064A",
    "Sound Pack": "\u0627\u0644\u0623\u0635\u0648\u0627\u062A",
    "Digital": "\u0631\u0642\u0645\u064A",
    "Clicks": "\u0646\u0642\u0631\u0627\u062A",
    "Gong": "\u062C\u0631\u0633",
    "Accent": "\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
    "Emerald": "\u0632\u0645\u0631\u062F\u064A",
    "Teal": "\u0641\u064A\u0631\u0648\u0632\u064A",
    "Copper": "\u0646\u062D\u0627\u0633\u064A",
    "Violet": "\u0628\u0646\u0641\u0633\u062C\u064A",
    "Weight": "\u0627\u0644\u0648\u0632\u0646",
    "Run guided setup again": "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0648\u062C\u0651\u0647",
    "Install AWJ on this device": "\u062A\u062B\u0628\u064A\u062A \u0623\u0648\u062C \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062C\u0647\u0627\u0632",
    "Log set": "\u0633\u062C\u0651\u0644 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
    "Log Set": "\u0633\u062C\u0651\u0644 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
    "Rest": "\u0631\u0627\u062D\u0629",
    "REST": "\u0631\u0627\u062D\u0629",
    "Pause": "\u0625\u064A\u0642\u0627\u0641 \u0645\u0624\u0642\u062A",
    "Skip": "\u062A\u062E\u0637\u0651\u064E",
    "Finish": "\u0625\u0646\u0647\u0627\u0621",
    "Finish workout": "\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062A\u0645\u0631\u064A\u0646",
    "Finish session": "\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062C\u0644\u0633\u0629",
    "Next set": "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629",
    "Start now": "\u0627\u0628\u062F\u0623 \u0627\u0644\u0622\u0646",
    "Weight (kg)": "\u0627\u0644\u0648\u0632\u0646 (\u0643\u062C\u0645)",
    "Reps": "\u0627\u0644\u062A\u0643\u0631\u0627\u0631\u0627\u062A",
    "Use the planned session": "\u0627\u062A\u0628\u0639 \u0627\u0644\u062C\u0644\u0633\u0629 \u0627\u0644\u0645\u062E\u0637\u0637\u0629",
    "There is not enough reliable data to adjust the plan. Use your warm-up and effort rating as the final check.": "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0643\u0627\u0641\u064A\u0629 \u0644\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062E\u0637\u0629. \u0627\u0633\u062A\u0639\u0646 \u0628\u0627\u0644\u0625\u062D\u0645\u0627\u0621 \u0648\u062A\u0642\u064A\u064A\u0645 \u0645\u062C\u0647\u0648\u062F\u0643 \u0642\u0628\u0644 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629.",
    "More recovery observations are needed.": "\u0646\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u0632\u064A\u062F \u0645\u0646 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A.",
    "No imported health data": "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0635\u062D\u064A\u0629 \u0645\u0633\u062A\u0648\u0631\u062F\u0629"
  };
  function translate(value) {
    const trimmed = value.trim();
    if (arabic[trimmed]) return value.replace(trimmed, arabic[trimmed]);
    if (/^Saved on device · \d+ waiting to sync$/.test(trimmed)) return trimmed.replace(/Saved on device · (\d+) waiting to sync/, "\u0645\u062D\u0641\u0648\u0638 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632 \xB7 $1 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629");
    if (/^\d+\/\d+ complete$/.test(trimmed)) return trimmed + " \u0645\u0643\u062A\u0645\u0644";
    return value;
  }
  function applyLocale(root = document) {
    if (document.documentElement.lang !== "ar") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, parent = node.parentElement;
      if (!parent || parent.closest("script,style,textarea,input,option,[data-user-content]")) continue;
      node.textContent = translate(node.textContent || "");
    }
    root.querySelectorAll?.("[aria-label],[placeholder],[title]").forEach((element) => {
      for (const attribute of ["aria-label", "placeholder", "title"]) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, translate(value));
      }
    });
  }

  // src/client/training-first-ui.js
  (function() {
    const nav = window.REP_NAVIGATION, core = window.REP_CORE_PAGES, preferences = window.REP_TRAINING_PREFERENCES;
    const route = (id) => nav.navigate(id), date = () => isoDay();
    preferences.normalize(state);
    const arabicCopy = { Today: "\u0627\u0644\u064A\u0648\u0645", Train: "\u0627\u0644\u062A\u0645\u0631\u064A\u0646", Nutrition: "\u0627\u0644\u062A\u063A\u0630\u064A\u0629", Wellbeing: "\u0627\u0644\u0639\u0627\u0641\u064A\u0629", Progress: "\u0627\u0644\u062A\u0642\u062F\u0645", Recovery: "\u0627\u0644\u062A\u0639\u0627\u0641\u064A", "Daily routines": "\u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629", "Your planned sessions, favourite routines and exercise library.": "\u062C\u0644\u0633\u0627\u062A\u0643 \u0627\u0644\u0645\u062E\u0637\u0637\u0629 \u0648\u062A\u0645\u0627\u0631\u064A\u0646\u0643 \u0627\u0644\u0645\u0641\u0636\u0644\u0629 \u0648\u0645\u0643\u062A\u0628\u0629 \u0627\u0644\u062D\u0631\u0643\u0627\u062A.", "Daily practices and recovery in one place.": "\u0639\u0627\u062F\u0627\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0648\u062A\u0639\u0627\u0641\u064A\u0643 \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F.", "Sleep and recovery inputs support your training.": "\u064A\u0633\u0627\u0639\u062F \u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0639\u0644\u0649 \u062A\u0648\u062C\u064A\u0647 \u062A\u0645\u0631\u064A\u0646\u0643.", "Your existing hygiene, wellness and journal routines.": "\u0639\u0627\u062F\u0627\u062A\u0643 \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0648\u0645\u0644\u0627\u062D\u0638\u0627\u062A\u0643.", "Consistency, performance, and your next step.": "\u0627\u0644\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0648\u0627\u0644\u0623\u062F\u0627\u0621 \u0648\u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u062A\u0627\u0644\u064A\u0629.", "Daily practices": "\u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629", "Habits, hygiene and journal": "\u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0639\u0646\u0627\u064A\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0648\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A", "Recovery & health": "\u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0648\u0627\u0644\u0635\u062D\u0629", "Sleep, check-ins and measurements": "\u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0648\u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A", "Today\u2019s focus": "\u062A\u0631\u0643\u064A\u0632 \u0627\u0644\u064A\u0648\u0645", "Recovery day": "\u064A\u0648\u0645 \u0644\u0644\u062A\u0639\u0627\u0641\u064A", "Review recovery": "\u0631\u0627\u062C\u0639 \u0627\u0644\u062A\u0639\u0627\u0641\u064A", "View routines": "\u0639\u0631\u0636 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646", "Start workout": "\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u0645\u0631\u064A\u0646", "Resume workout": "\u0627\u0633\u062A\u0623\u0646\u0641 \u0627\u0644\u062A\u0645\u0631\u064A\u0646" };
    const tr = (value) => state.preferences?.language === "ar" ? arabicCopy[value] || value : value;
    function enter(view, tab) {
      stopExerciseClock();
      stopSessionClock();
      document.body.classList.remove("workout-mode", "workout-complete-mode", "rest-mode-active");
      timerDock.classList.add("is-hidden");
      timerDock.setAttribute("inert", "");
      if (state.timer?.interval) {
        clearInterval(state.timer.interval);
        state.timer.interval = null;
      }
      state.view = view;
      state.activeTab = tab;
      persistDebounced();
      updatePrimaryTabs();
    }
    function heading(title, description = "") {
      return `<header class="page-heading"><h1>${esc(tr(title))}</h1>${description ? `<p>${esc(tr(description))}</p>` : ""}</header>`;
    }
    function sheet(title, content, bind = () => {
    }) {
      const overlay = document.createElement("div");
      overlay.className = "rep-modal-backdrop";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", title);
      overlay.innerHTML = REP_SAFE_DOM.sanitize(`<section class="rep-modal-sheet"><header class="sheet-header"><h2>${esc(title)}</h2><button class="sheet-close" aria-label="Close">\xD7</button></header>${content}</section>`);
      const previous = document.activeElement;
      let closing = false;
      const close = async () => {
        if (closing) return;
        closing = true;
        await window.REP_MOTION.dismiss(overlay);
        if (previous?.isConnected) previous.focus();
      };
      overlay.querySelector(".sheet-close").onclick = close;
      overlay.onclick = (e) => {
        if (e.target === overlay) close();
      };
      overlay.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
        if (event.key === "Tab") {
          const controls = [...overlay.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')].filter((el) => !el.disabled && el.getClientRects().length);
          const first = controls[0], last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      });
      document.body.append(overlay);
      bind(overlay, close);
      overlay.querySelector("button,input")?.focus();
      return overlay;
    }
    function readiness() {
      const engine = window.REP_HEALTH_ENGINE, value = engine.readiness(state, date(), state.healthProfile), advice = engine.trainingRecommendation(state, date(), state.healthProfile, value);
      const imported = state.lastVitalsImportDate, age = daysSinceVitalsImport();
      return { value, advice, age, source: imported ? `Health data ${age === 0 ? "today" : `${age} day${age === 1 ? "" : "s"} ago`}` : "No imported health data", confidence: value.confidence || "low" };
    }
    function readinessMarkup() {
      const r = readiness();
      return `<section class="readiness-note"><div><h2>${esc(r.advice.title)}</h2><p>${esc(r.advice.detail || r.advice.message || "Use your warm-up as the final check. You can log manually without a watch.")}</p></div><details><summary>Why this recommendation?</summary><p>${esc(r.source)} \xB7 ${esc(r.confidence)} confidence</p><p>${r.value.score === null ? "More recovery observations are needed." : `Wellness estimate: ${r.value.score}%`}</p><p>${esc((r.value.reasons || []).map((x) => typeof x === "string" ? x : x.detail || x.label || "").filter(Boolean).join(" "))}</p></details></section>`;
    }
    function saveStatus() {
      const queued = window.REP_SYNC_OUTBOX?.summary(state.syncQueue)?.total || 0, storage = window.REP_STORE?.saveStatus;
      const label = storage === "failed" ? "Save needs attention \xB7 open backups" : storage === "saving" ? "Saving on device\u2026" : queued ? `Saved on device \xB7 ${queued} waiting to sync` : state.lastSyncedAt ? "Saved on device \xB7 records synced" : "Saved on device";
      return `<button type="button" class="save-status ${queued ? "has-pending" : ""} ${storage === "failed" ? "save-failed" : ""}" data-save-status>${label}</button>`;
    }
    function bindSaveStatus() {
      document.querySelector("[data-save-status]")?.addEventListener("click", () => route(window.REP_STORE?.saveStatus === "failed" ? "settings-security" : "settings-sync"));
    }
    window.addEventListener("rep:storage-status", (event) => {
      const button = document.querySelector("[data-save-status]");
      if (button) {
        const holder = document.createElement("div");
        holder.innerHTML = REP_SAFE_DOM.sanitize(saveStatus());
        const fresh = holder.firstElementChild;
        if (fresh) {
          button.replaceWith(fresh);
          bindSaveStatus();
        }
      }
      document.querySelector(".awj-save-warning")?.remove();
      if (event.detail.status !== "failed") return;
      const warning = document.createElement("div"), message = document.createElement("span"), action = document.createElement("button");
      warning.className = "awj-save-warning";
      warning.setAttribute("role", "alert");
      message.textContent = "Could not save on this device. Keep AWJ open and check available storage.";
      action.type = "button";
      action.textContent = "Backups and recovery";
      action.addEventListener("click", () => route("settings-security"));
      warning.append(message, action);
      document.body.append(warning);
    });
    function checkin() {
      sheet("Quick recovery check-in", window.REP_HEALTH_UI.checkinMarkup(), (_root, close) => window.REP_HEALTH_UI.bind({ onSaved: () => {
        close();
        screenRegistry.update();
        showToast("Check-in saved on device.");
      } }));
    }
    function guardStart(id, proceed) {
      if (REP_TRAINING_SESSION.isResumableWorkout(state, sessions) && state.session !== id) {
        sheet("Workout in progress", '<p>Resume or explicitly end the current workout before starting another.</p><button class="primary-action" data-resume-active>Resume current workout</button>', (root, close) => root.querySelector("[data-resume-active]").onclick = () => {
          close();
          startSession(state.session, { acknowledgeWarnings: true });
        });
        return true;
      }
      const r = readiness();
      if (r.advice.mode === "pause") {
        sheet("Review your recovery warning", `<p>${esc(r.advice.detail || r.advice.message || r.advice.title)}</p><button class="primary-action" data-review-recovery>Review recovery</button><button data-acknowledge-workout>Record a modified workout</button>`, (root, close) => {
          root.querySelector("[data-review-recovery]").onclick = () => {
            close();
            route("health-vitals");
          };
          root.querySelector("[data-acknowledge-workout]").onclick = () => {
            close();
            proceed();
          };
        });
        return true;
      }
      return false;
    }
    const ui = { enter, heading, readinessMarkup, saveStatus, bindSaveStatus, route, checkin, core, preferences, sheet, date, tr, readiness };
    const { today } = createTodayScreen(ui), { train } = createTrainingScreen(ui), { nutrition } = createNutritionScreen(ui), { progress } = createProgressScreen(ui), { wellbeing, recovery, routines } = createWellbeingScreens(ui);
    window.AWJ_LOCALE = Object.freeze({ apply: applyLocale });
    const lifecycle = (mount) => ({ mount() {
      mount();
      applyLocale();
    }, update() {
      mount();
      applyLocale();
    }, destroy() {
      document.querySelectorAll(".rep-modal-backdrop").forEach((node) => node.remove());
    } });
    const screenRegistry = createScreenRegistry({ today: lifecycle(today), train: lifecycle(train), nutrition: lifecycle(nutrition), progress: lifecycle(progress), wellbeing: lifecycle(wellbeing), recovery: lifecycle(recovery), routines: lifecycle(routines), settings: createSettingsScreen() });
    const show = (id) => () => screenRegistry.show(id);
    window.REP_TRAINING_UI = Object.freeze({ today: show("today"), train: show("train"), nutrition: show("nutrition"), progress: show("progress"), wellbeing: show("wellbeing"), more: show("wellbeing"), recovery: show("recovery"), routines: show("routines"), checkin, sheet, guardStart });
    document.body.classList.add("training-first-app");
    nav.register([{ id: "today", path: "/today", title: "Today", activate: show("today") }, { id: "training-program", path: "/train", aliases: ["/training/program", "/training/today", "/program-active"], title: "Train", activate: show("train") }, { id: "training-today", path: "/training/today", title: "Today", activate: show("today") }, { id: "insights", path: "/progress", aliases: ["/insights"], title: "Progress", activate: show("progress") }, { id: "training-history", path: "/progress/history", aliases: ["/training/history"], title: "History", activate: show("progress") }, { id: "wellbeing", path: "/wellbeing", title: "Wellbeing", activate: show("wellbeing") }, { id: "more", path: "/more", title: "Wellbeing", activate: show("wellbeing") }, { id: "health-vitals", path: "/wellbeing/recovery", aliases: ["/more/recovery", "/health/vitals"], title: "Recovery", activate: show("recovery") }, { id: "health-wellness", path: "/wellbeing/routines", aliases: ["/more/routines", "/health/wellness"], title: "Daily routines", activate: show("routines") }]);
    nav.register([
      ...["today", "log", "plan"].map((view) => ({ id: "nutrition-" + view, path: "/nutrition/" + view, title: "Nutrition", activate: () => {
        state.nutritionView = view;
        screenRegistry.show("nutrition");
      } })),
      ...["general", "schedule", "targets", "coach", "sync", "security"].map((section) => ({ id: "settings-" + section, path: "/settings/" + section, title: "Settings", activate: () => {
        state.settingsSection = section;
        screenRegistry.show("settings");
      } }))
    ]);
    nav.setTabResolver((tab) => ({ home: "today", train: "training-program", food: "nutrition-today", wellbeing: "wellbeing", insights: "insights", more: "wellbeing", health: "health-vitals", vitals: "health-vitals", care: "health-wellness" })[tab] || tab);
    window.addEventListener("rep:navigation", () => {
      updatePrimaryTabs();
      if (["vitals", "care"].includes(state.activeTab) && !app.querySelector("[data-more-back]")) {
        const back = document.createElement("button");
        back.dataset.moreBack = "true";
        back.textContent = "\u2190 Wellbeing";
        back.onclick = () => route("wellbeing");
        app.prepend(back);
      }
    });
    nav.start({ fallback: "today" });
    const viewport = window.visualViewport;
    let baselineHeight = window.innerHeight, lastWidth = window.innerWidth, viewportFrame = 0;
    const editable = (element) => element?.matches?.("textarea,input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=button]):not([type=submit])") && !element.readOnly && !element.disabled;
    function updateViewport() {
      viewportFrame = 0;
      const scale = viewport?.scale || 1, zoomed = Math.abs(scale - 1) > 0.05, editing = editable(document.activeElement);
      const height = viewport?.height || window.innerHeight, top = viewport?.offsetTop || 0;
      if (Math.abs(window.innerWidth - lastWidth) > 80) {
        baselineHeight = window.innerHeight;
        lastWidth = window.innerWidth;
      }
      if (!editing && !zoomed) baselineHeight = window.innerHeight;
      const inset = Math.max(0, window.innerHeight - height - top);
      const open = Boolean(editing && !zoomed && (inset > 100 || baselineHeight - height > 120));
      document.body.classList.toggle("is-keyboard-open", open);
      const style = document.documentElement.style;
      style.setProperty("--keyboard-bottom", `${open ? Math.round(inset) : 0}px`);
      style.setProperty("--visible-height", `${Math.round(height)}px`);
      style.setProperty("--visible-top", `${Math.round(top)}px`);
      if (open) requestAnimationFrame(() => {
        const input = document.activeElement;
        if (!editable(input)) return;
        const bounds = input.getBoundingClientRect(), action = app.querySelector(".workout-action-band");
        const footer = action?.getClientRects().length ? action.getBoundingClientRect().height + 16 : 16;
        if (bounds.top < top + 12 || bounds.bottom > top + height - footer) input.scrollIntoView({ block: "center", behavior: "instant" });
      });
    }
    const scheduleViewport = () => {
      if (!viewportFrame) viewportFrame = requestAnimationFrame(updateViewport);
    };
    viewport?.addEventListener("resize", scheduleViewport);
    viewport?.addEventListener("scroll", scheduleViewport);
    window.addEventListener("resize", scheduleViewport);
    document.addEventListener("focusin", scheduleViewport);
    document.addEventListener("focusout", () => setTimeout(scheduleViewport, 0));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || !event.target.matches("[data-live-log]")) return;
      event.preventDefault();
      const fields = [...app.querySelectorAll("[data-live-log]")], next = fields[fields.indexOf(event.target) + 1];
      if (next) next.focus();
      else event.target.blur();
    });
    document.addEventListener("pointerdown", (event) => {
      if (event.target.closest("[data-keyboard-dismiss]")) {
        event.preventDefault();
        document.activeElement?.blur();
        scheduleViewport();
      }
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-keyboard-dismiss]")) {
        document.activeElement?.blur();
        scheduleViewport();
      }
    });
    updateViewport();
  })();
})();
