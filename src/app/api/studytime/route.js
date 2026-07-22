import { adminDb } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

const PASSWORD = "superstudiopro";
const DEFAULT_DAILY_GOAL = 11 * 3600; // 11 hours
const DEFAULT_WEBHOOK_URL = "https://webhook-notifier.com/join#secret=wn_l0h2bIZDttMXAVAlUwYgcKKlsJluExzOeS_Jeh6dAsw&name=Study+timer";

function getStudyDayAnchor(date = new Date()) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + istOffset);

  if (istDate.getHours() < 8) {
    istDate.setDate(istDate.getDate() - 1);
  }
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, "0");
  const dd = String(istDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calculateStreak(history, currentAnchor, goalSeconds) {
  let streak = 0;
  const [y, m, d] = currentAnchor.split("-").map(Number);
  let checkDate = new Date(y, m - 1, d);

  if ((history[currentAnchor] || 0) >= goalSeconds) {
    streak++;
  }

  while (true) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yyyy = checkDate.getFullYear();
    const mm = String(checkDate.getMonth() + 1).padStart(2, "0");
    const dd = String(checkDate.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;

    const secs = history[key] || 0;
    if (secs >= goalSeconds) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

async function dispatchSirenWebhook(webhookUrl, mode, durationSeconds) {
  if (!webhookUrl) return;
  try {
    let targetUrl = webhookUrl;
    // Handle webhook-notifier.com join URL conversion to notify API endpoint if needed
    if (webhookUrl.includes("webhook-notifier.com/join#secret=")) {
      const match = webhookUrl.match(/secret=([^&]+)/);
      if (match) {
        const secret = match[1];
        targetUrl = `https://webhook-notifier.com/api/notify?secret=${secret}`;
      }
    }

    const payload = {
      title: "🚨 AERO FOCUS TIMER ENDED!",
      body: "TIMER ENDED! GET BACK TO WORK IMMEDIATELY!",
      message: "🚨 TIMER ENDED! GET BACK TO WORK IMMEDIATELY!",
      content: "🚨 TIMER ENDED! GET BACK TO WORK IMMEDIATELY!",
      text: "🚨 TIMER ENDED! GET BACK TO WORK IMMEDIATELY!",
      event: "timer_ended",
      mode: mode || "study",
      durationSeconds: durationSeconds || 3600,
      timestamp: new Date().toISOString(),
    };

    // Attempt POST to targetUrl
    await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Also attempt direct POST to raw webhookUrl if targetUrl was converted
    if (targetUrl !== webhookUrl) {
      try {
        await fetch(webhookUrl.replace("#", "?"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        /* noop */
      }
    }
  } catch (err) {
    console.error("Failed to send siren webhook:", err);
  }
}

async function getOrInitState() {
  const docRef = adminDb.collection("studyTime").doc("globalState");
  const doc = await docRef.get();

  const todayAnchor = getStudyDayAnchor();

  let state = {
    currentStudyDay: todayAnchor,
    todayStudySeconds: 0,
    dailyGoalSeconds: DEFAULT_DAILY_GOAL,
    history: {},
    streak: 0,
    todos: [],
    webhookUrl: DEFAULT_WEBHOOK_URL,
    activeTimer: null,
    lastUpdated: new Date().toISOString(),
  };

  if (doc.exists) {
    const data = doc.data();
    state = {
      ...state,
      ...data,
      dailyGoalSeconds: data.dailyGoalSeconds || DEFAULT_DAILY_GOAL,
      history: data.history || {},
      todos: data.todos || [],
      webhookUrl: data.webhookUrl || DEFAULT_WEBHOOK_URL,
      activeTimer: data.activeTimer || null,
    };

    if (state.currentStudyDay !== todayAnchor) {
      const oldAnchor = state.currentStudyDay;
      if (oldAnchor) {
        state.history[oldAnchor] = state.todayStudySeconds || 0;
      }
      state.currentStudyDay = todayAnchor;
      state.todayStudySeconds = 0;
      state.todos = (state.todos || []).filter((t) => !t.completed);
    }
  }

  // CLOUD TIMER EVALUATION
  if (state.activeTimer && state.activeTimer.isRunning) {
    const now = Date.now();
    const startTimeMs = new Date(state.activeTimer.startTime).getTime();
    const elapsedSecs = Math.floor((now - startTimeMs) / 1000);
    const remainingSecs = Math.max(0, state.activeTimer.durationSeconds - elapsedSecs);

    state.activeTimer.secondsRemaining = remainingSecs;
    state.activeTimer.elapsedSeconds = elapsedSecs;

    if (remainingSecs <= 0 && !state.activeTimer.completed) {
      state.activeTimer.completed = true;
      state.activeTimer.isRunning = false;

      if (state.activeTimer.mode === "study") {
        const addedSeconds = state.activeTimer.durationSeconds;
        state.todayStudySeconds = (state.todayStudySeconds || 0) + addedSeconds;
        state.history[todayAnchor] = state.todayStudySeconds;

        await adminDb.collection("studyTimeLogs").add({
          seconds: addedSeconds,
          mode: state.activeTimer.mode,
          note: state.activeTimer.note || "Cloud Timer Completed",
          anchorDay: todayAnchor,
          timestamp: new Date().toISOString(),
          source: "cloud_timer",
        });
      }

      // Dispatch Webhook Siren Notification
      const targetWebhook = state.webhookUrl || state.activeTimer.webhookUrl || DEFAULT_WEBHOOK_URL;
      await dispatchSirenWebhook(
        targetWebhook,
        state.activeTimer.mode,
        state.activeTimer.durationSeconds
      );
    }
  }

  state.streak = calculateStreak(state.history, todayAnchor, state.dailyGoalSeconds);
  await docRef.set(state, { merge: true });
  return state;
}

// GET /api/studytime?password=superstudiopro
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Incorrect password." }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 500 });
    }

    const state = await getOrInitState();
    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error("Error in GET /api/studytime:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch state" }, { status: 500 });
  }
}

// POST /api/studytime
export async function POST(request) {
  try {
    const body = await request.json();
    const { password, action } = body;

    if (password !== PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Incorrect password." }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 500 });
    }

    const docRef = adminDb.collection("studyTime").doc("globalState");
    const state = await getOrInitState();
    const todayAnchor = getStudyDayAnchor();

    switch (action) {
      case "start_timer": {
        const durationSeconds = Math.max(10, parseInt(body.durationSeconds || 3600, 10));
        const mode = body.mode || "study";
        const note = body.note || "";
        const webhookUrl = body.webhookUrl || state.webhookUrl || DEFAULT_WEBHOOK_URL;

        state.activeTimer = {
          id: "timer_" + Date.now(),
          startTime: new Date().toISOString(),
          durationSeconds,
          mode,
          note,
          webhookUrl,
          isRunning: true,
          completed: false,
          secondsRemaining: durationSeconds,
          elapsedSeconds: 0,
        };
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "pause_timer": {
        if (state.activeTimer && state.activeTimer.isRunning) {
          const now = Date.now();
          const startTimeMs = new Date(state.activeTimer.startTime).getTime();
          const elapsedSecs = Math.floor((now - startTimeMs) / 1000);
          const remainingSecs = Math.max(0, state.activeTimer.durationSeconds - elapsedSecs);

          state.activeTimer.isRunning = false;
          state.activeTimer.secondsRemaining = remainingSecs;
          state.lastUpdated = new Date().toISOString();
        }
        break;
      }

      case "resume_timer": {
        if (state.activeTimer && !state.activeTimer.isRunning && !state.activeTimer.completed) {
          const remaining = state.activeTimer.secondsRemaining || 3600;
          state.activeTimer.startTime = new Date(Date.now() - (state.activeTimer.durationSeconds - remaining) * 1000).toISOString();
          state.activeTimer.isRunning = true;
          state.lastUpdated = new Date().toISOString();
        }
        break;
      }

      case "cancel_timer": {
        state.activeTimer = null;
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "set_webhook": {
        state.webhookUrl = (body.webhookUrl || DEFAULT_WEBHOOK_URL).trim();
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "test_webhook": {
        const targetUrl = body.webhookUrl || state.webhookUrl || DEFAULT_WEBHOOK_URL;
        await dispatchSirenWebhook(targetUrl, "test", 3600);
        break;
      }

      case "log": {
        const addedSeconds = Math.max(0, parseInt(body.seconds || 0, 10));
        const mode = body.mode || "study";
        const note = body.note || "";

        state.todayStudySeconds = (state.todayStudySeconds || 0) + addedSeconds;
        state.history[todayAnchor] = state.todayStudySeconds;
        state.lastUpdated = new Date().toISOString();

        if (addedSeconds > 0) {
          await adminDb.collection("studyTimeLogs").add({
            seconds: addedSeconds,
            mode,
            note,
            anchorDay: todayAnchor,
            timestamp: new Date().toISOString(),
            source: body.source || "api",
          });
        }
        break;
      }

      case "set_seconds": {
        const seconds = Math.max(0, parseInt(body.seconds || 0, 10));
        state.todayStudySeconds = seconds;
        state.history[todayAnchor] = seconds;
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "set_goal": {
        const goalSeconds = Math.max(60, parseInt(body.goalSeconds || DEFAULT_DAILY_GOAL, 10));
        state.dailyGoalSeconds = goalSeconds;
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "reset_today": {
        state.todayStudySeconds = 0;
        state.history[todayAnchor] = 0;
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "add_todo": {
        const text = (body.text || "").trim();
        if (text) {
          const newTodo = {
            id: "todo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
          };
          state.todos = [newTodo, ...(state.todos || [])];
          state.lastUpdated = new Date().toISOString();
        }
        break;
      }

      case "toggle_todo": {
        const id = body.id;
        state.todos = (state.todos || []).map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "delete_todo": {
        const id = body.id;
        state.todos = (state.todos || []).filter((t) => t.id !== id);
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "clear_todos": {
        state.todos = (state.todos || []).filter((t) => !t.completed);
        state.lastUpdated = new Date().toISOString();
        break;
      }

      case "sync": {
        if (body.state) {
          if (typeof body.state.todayStudySeconds === "number") {
            state.todayStudySeconds = body.state.todayStudySeconds;
            state.history[todayAnchor] = state.todayStudySeconds;
          }
          if (Array.isArray(body.state.todos)) {
            state.todos = body.state.todos;
          }
          if (typeof body.state.dailyGoalSeconds === "number") {
            state.dailyGoalSeconds = body.state.dailyGoalSeconds;
          }
          if (typeof body.state.webhookUrl === "string") {
            state.webhookUrl = body.state.webhookUrl;
          }
          state.lastUpdated = new Date().toISOString();
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Invalid action '${action}'` },
          { status: 400 }
        );
    }

    state.streak = calculateStreak(state.history, todayAnchor, state.dailyGoalSeconds);
    await docRef.set(state, { merge: true });

    return NextResponse.json({ success: true, action, state });
  } catch (error) {
    console.error("Error in POST /api/studytime:", error);
    return NextResponse.json({ error: error.message || "Failed to execute action" }, { status: 500 });
  }
}
