// ============================================================
// course.js — Course Detail page
// Handles: Load course details, 3-step scheduling (weekly
//          schedule → time slot → session type), price
//          calculation, enroll button, review submission,
//          auth-gate display
// ============================================================

const API_BASE = 'https://api.redclass.redberryinternship.ge/api';
import { fetchCourses } from './api.js';
function getToken() { return localStorage.getItem('lp_token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('lp_user')); } catch { return null; }
}

function authHeaders(json = false) {
  const token = getToken();
  const h = { 'Accept': 'application/json' };
  if (json) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// ─── Read course ID from URL ──────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const COURSE_ID = urlParams.get('id');

// ─── UI element refs ──────────────────────────────────────────
const titleEl       = document.querySelector('.main-course-title');
const imgEl         = document.querySelector('.course-image');
const weeksEl       = document.querySelector('.weeks-text');
const hoursEl       = document.querySelector('.days-text');
const ratingEl      = document.querySelector('.rating-big span');
const tagEl         = document.querySelector('.tag');
const instrChip     = document.querySelector('.instructor-chip');
const descEl        = document.querySelector('.course-info-description');
const breadCategory = document.querySelector('.breadcrumbs-course');

// Scheduling UI
const schedChoices    = document.querySelector('.scheduling-choices');
const timeSlotSection = document.querySelector('.time-slot');
const timeChoices     = document.querySelector('.scheduling-choices-time');
const sessionSection  = document.querySelector('.session-type');
const sessionChoices  = document.querySelector('.scheduling-choices-session');

// Price UI
const totalPriceEl   = document.querySelector('.total-price-calculated');
const basePriceAddEl = document.querySelector('.base-price-add');
const sessTypeAddEl  = document.querySelector('.session-price-add');
const enrollBtn      = document.querySelector('.enroll-button');
const authReqBox     = document.querySelector('.authentication-req');

// ─── State ────────────────────────────────────────────────────
let courseData        = null;
let selectedScheduleId = null;
let selectedTimeSlotId = null;
let selectedSessionId  = null;
let basePrice          = 0;
let sessionExtraPrice  = 0;

// ─── Helpers ─────────────────────────────────────────────────
const chevronSVG = `<svg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.27548 0.193912C1.20331 0.131926 1.11841 0.0834684 1.02563 0.0513033C0.932857 0.0191383 0.834018 0.00389618 0.73476 0.00644822C0.635501 0.00900026 0.537768 0.0292959 0.44714 0.0661764C0.356512 0.103057 0.274764 0.1558 0.206563 0.221394C0.138363 0.286988 0.0850452 0.36415 0.0496549 0.448472C0.0142646 0.532794 -0.00250549 0.622625 0.000302383 0.712837C0.00311025 0.803049 0.025441 0.891876 0.0660195 0.974245C0.106598 1.05661 0.16463 1.13091 0.236802 1.1929L7.04038 7.0329C7.18073 7.1535 7.36656 7.2207 7.55972 7.2207C7.75287 7.2207 7.9387 7.1535 8.07906 7.0329L14.8834 1.1929C14.9571 1.13132 15.0167 1.05704 15.0586 0.974366C15.1005 0.891695 15.1239 0.802281 15.1275 0.711318C15.131 0.620355 15.1146 0.529656 15.0793 0.444491C15.044 0.359325 14.9904 0.28139 14.9216 0.215212C14.8528 0.149034 14.7703 0.095932 14.6788 0.0589914C14.5873 0.0220509 14.4886 0.00200796 14.3884 2.62363e-05C14.2883 -0.00195549 14.1888 0.014163 14.0955 0.0474472C14.0023 0.080731 13.9173 0.130516 13.8455 0.193911L7.55972 5.5887L1.27548 0.193912Z" fill="#130E67"/></svg>`;

function updatePriceUI() {
  const total = basePrice + sessionExtraPrice;
  if (totalPriceEl)   totalPriceEl.textContent   = `$${total}`;
  if (basePriceAddEl) basePriceAddEl.textContent  = `+ $${basePrice}`;
  if (sessTypeAddEl)  sessTypeAddEl.textContent   = `+ $${sessionExtraPrice}`;
}

function updateEnrollButton() {
  if (!enrollBtn) return;
  const user = getUser();
  const allSelected = selectedScheduleId && selectedTimeSlotId && selectedSessionId;

  if (!user) {
    enrollBtn.classList.add('disabled');
    enrollBtn.textContent = 'Enroll Now';
    if (authReqBox) authReqBox.style.display = '';
    return;
  }

  if (authReqBox) authReqBox.style.display = 'none';

  if (allSelected) {
    enrollBtn.classList.remove('disabled');
  } else {
    enrollBtn.classList.add('disabled');
  }
}

// ─── Load Course Info ─────────────────────────────────────────
async function loadCourse() {
  if (!COURSE_ID) return;

  try {
    const data = await fetch(`${API_BASE}/courses/${COURSE_ID}`, {
      headers: { 'Accept': 'application/json' }
    }).then(r => r.json());

    courseData = data.course || data;
    basePrice = parseFloat(courseData.price) || 0;

    // Populate DOM
    if (titleEl)       titleEl.textContent        = courseData.title || '';
    if (imgEl)         imgEl.src                  = courseData.cover || 'assets/coursep.jpg';
    if (weeksEl)       weeksEl.textContent         = courseData.duration_weeks ? `${courseData.duration_weeks} Weeks` : '';
    if (hoursEl)       hoursEl.textContent         = courseData.duration_hours ? `${courseData.duration_hours} Hours` : '';
    if (ratingEl)      ratingEl.textContent        = courseData.rating != null ? Number(courseData.rating).toFixed(1) : '—';
    if (breadCategory) breadCategory.textContent   = courseData.category?.name || 'Course';
    if (tagEl)         tagEl.textContent           = courseData.category?.name || '';

    if (instrChip && courseData.instructor) {
      instrChip.innerHTML = `
        <img src="${courseData.instructor.avatar || 'assets/instructor1.jpg'}" alt="${courseData.instructor.name}" onerror="this.src='assets/instructor1.jpg'">
        <span>${courseData.instructor.name}</span>`;
    }

    if (descEl && courseData.description) {
      descEl.innerHTML = courseData.description.split('\n\n').map(p => `<p>${p}</p>`).join('<br/>');
    }

    document.title = courseData.title || 'Course';
    updatePriceUI();
    updateEnrollButton();
    loadWeeklySchedules();
  } catch (err) {
    console.error('Failed to load course:', err);
  }
}

// ─── Step 1: Weekly Schedules ─────────────────────────────────
async function loadWeeklySchedules() {
  if (!schedChoices || !COURSE_ID) return;
  schedChoices.innerHTML = '<span style="color:#8A8A8A;font-size:13px;">Loading…</span>';

  try {
    const data = await fetch(`${API_BASE}/courses/${COURSE_ID}/weekly-schedules`, {
      headers: { 'Accept': 'application/json' }
    }).then(r => r.json());

    const schedules = Array.isArray(data) ? data : (data.data || []);

    schedChoices.innerHTML = schedules.map(s =>
      `<span class="scheduling-choice${s.available === false ? ' disabled' : ''}" data-id="${s.id}">
        ${s.label || s.days || s.name || 'Schedule'}
      </span>`
    ).join('');

    schedChoices.querySelectorAll('.scheduling-choice:not(.disabled)').forEach(chip => {
      chip.addEventListener('click', () => {
        schedChoices.querySelectorAll('.scheduling-choice').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedScheduleId = chip.dataset.id;
        selectedTimeSlotId = null;
        selectedSessionId  = null;
        sessionExtraPrice  = 0;
        updatePriceUI();
        updateEnrollButton();
        loadTimeSlots();
      });
    });
  } catch (err) {
    console.error('Failed to load weekly schedules:', err);
    schedChoices.innerHTML = '<span style="color:#e53935;font-size:13px;">Could not load schedules.</span>';
  }
}

// ─── Step 2: Time Slots ───────────────────────────────────────
const timeIcons = { morning: 'assets/cloudy.svg', afternoon: 'assets/sun.svg', evening: 'assets/moon.svg' };

async function loadTimeSlots() {
  if (!timeChoices || !selectedScheduleId) return;

  // Enable step 2 header
  const step2Btn = document.querySelector('.time-slot .weekly-schedule-button');
  if (step2Btn) step2Btn.classList.remove('disabled');

  timeChoices.innerHTML = '<span style="color:#8A8A8A;font-size:13px;">Loading…</span>';
  // Reset step 3
  if (sessionChoices) sessionChoices.innerHTML = '';
  const step3Btn = document.querySelector('.session-type .weekly-schedule-button');
  if (step3Btn) step3Btn.classList.add('disabled');

  try {
    const data = await fetch(
      `${API_BASE}/courses/${COURSE_ID}/time-slots?weekly_schedule_id=${selectedScheduleId}`,
      { headers: { 'Accept': 'application/json' } }
    ).then(r => r.json());

    const slots = Array.isArray(data) ? data : (data.data || []);

    timeChoices.innerHTML = slots.map(slot => {
      const label = slot.label || slot.period || '';
      const key = label.toLowerCase();
      const icon = timeIcons[key] || 'assets/sun.svg';
      const time = slot.time || slot.time_range || '';
      const disabled = slot.available === false ? ' disabled' : '';
      return `
        <div class="scheduling-choice-time${disabled}" data-id="${slot.id}" data-price="${slot.extra_price || 0}">
          <div class="scheduling-choice-time-inside">
            <img src="${icon}" alt="">
            <div class="scheduling-choice-time-inside-txt">
              <span class="scheduling-wd">${label}</span>
              <span class="scheduling-time">${time}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    timeChoices.querySelectorAll('.scheduling-choice-time:not(.disabled)').forEach(card => {
      card.addEventListener('click', () => {
        timeChoices.querySelectorAll('.scheduling-choice-time').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedTimeSlotId = card.dataset.id;
        selectedSessionId  = null;
        sessionExtraPrice  = 0;
        updatePriceUI();
        updateEnrollButton();
        loadSessionTypes();
      });
    });
  } catch (err) {
    console.error('Failed to load time slots:', err);
    timeChoices.innerHTML = '<span style="color:#e53935;font-size:13px;">Could not load time slots.</span>';
  }
}

// ─── Step 3: Session Types ────────────────────────────────────
const sessionTypeIcons = {
  online: 'assets/Desktop.svg',
  'in-person': 'assets/Users.svg',
  hybrid: 'assets/Intersect.svg',
};

async function loadSessionTypes() {
  if (!sessionChoices || !selectedScheduleId || !selectedTimeSlotId) return;

  const step3Btn = document.querySelector('.session-type .weekly-schedule-button');
  if (step3Btn) step3Btn.classList.remove('disabled');

  sessionChoices.innerHTML = '<span style="color:#8A8A8A;font-size:13px;">Loading…</span>';

  try {
    const data = await fetch(
      `${API_BASE}/courses/${COURSE_ID}/session-types?weekly_schedule_id=${selectedScheduleId}&time_slot_id=${selectedTimeSlotId}`,
      { headers: { 'Accept': 'application/json' } }
    ).then(r => r.json());

    const sessions = Array.isArray(data) ? data : (data.data || []);

    sessionChoices.innerHTML = sessions.map(s => {
      const typeKey = (s.type || s.name || '').toLowerCase();
      const icon = sessionTypeIcons[typeKey] || 'assets/Desktop.svg';
      const label = s.label || s.name || s.type || 'Session';
      const location = s.location || s.address || (typeKey === 'online' ? 'Google Meet' : '');
      const extra = parseFloat(s.extra_price || s.price_addition || 0);
      const priceLabel = extra > 0 ? `+ $${extra}` : 'Included';
      const seats = s.available_seats;
      const noSeats = seats === 0;
      const disabled = noSeats ? ' disabled' : '';
      const seatsLabel = noSeats ? 'No Seats Available' : (seats != null ? `${seats} Seats Available` : '');

      return `
        <div class="scheduling-choice-session-wrapper">
          <div class="scheduling-choice-session${disabled}" data-id="${s.id}" data-extra="${extra}">
            <div class="scheduling-choice-session-inside">
              <div class="scheduling-choice-session-inside">
                <div class="session-icon"><img src="${icon}" alt=""></div>
                <div class="session-texts">
                  <div class="session-texts-top">
                    <span class="session-type-txt">${label}</span>
                    <div class="session-address">
                      ${typeKey !== 'online' ? `<img class="session-location" src="assets/session-location.svg" alt="">` : ''}
                      <span class="address">${location}</span>
                    </div>
                  </div>
                  <span class="session-price">${priceLabel}</span>
                </div>
              </div>
            </div>
          </div>
          ${seatsLabel ? `<span class="seat-availability">${seatsLabel}</span>` : ''}
        </div>`;
    }).join('');

    sessionChoices.querySelectorAll('.scheduling-choice-session:not(.disabled)').forEach(card => {
      card.addEventListener('click', () => {
        sessionChoices.querySelectorAll('.scheduling-choice-session').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedSessionId = card.dataset.id;
        sessionExtraPrice = parseFloat(card.dataset.extra) || 0;
        updatePriceUI();
        updateEnrollButton();
      });
    });
  } catch (err) {
    console.error('Failed to load session types:', err);
    sessionChoices.innerHTML = '<span style="color:#e53935;font-size:13px;">Could not load session types.</span>';
  }
}

// ─── Enroll ───────────────────────────────────────────────────
if (enrollBtn) {
  enrollBtn.addEventListener('click', async () => {
    if (enrollBtn.classList.contains('disabled')) return;
    if (!getToken()) return;

    enrollBtn.disabled = true;
    enrollBtn.textContent = 'Enrolling…';

    try {
      const res = await fetch(`${API_BASE}/enrollments`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          course_id:         parseInt(COURSE_ID),
          weekly_schedule_id: parseInt(selectedScheduleId),
          time_slot_id:       parseInt(selectedTimeSlotId),
          session_type_id:    parseInt(selectedSessionId),
        }),
      });

      if (res.ok) {
        enrollBtn.textContent = '✓ Enrolled!';
        enrollBtn.classList.add('disabled');
        showCourseToast('Successfully enrolled! 🎉');
      } else {
        const err = await res.json().catch(() => ({}));
        showCourseToast(err.message || 'Enrollment failed. Please try again.');
        enrollBtn.disabled = false;
        enrollBtn.textContent = 'Enroll Now';
      }
    } catch (err) {
      showCourseToast('Network error. Please try again.');
      enrollBtn.disabled = false;
      enrollBtn.textContent = 'Enroll Now';
    }
  });
}

// ─── Simple toast for this page ───────────────────────────────
function showCourseToast(msg) {
  // Reuse auth.js toast if available, otherwise create one
  const existing = document.getElementById('auth-toast');
  if (existing) {
    existing.textContent = msg;
    existing.classList.add('show');
    setTimeout(() => existing.classList.remove('show'), 2800);
    return;
  }
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#0A0A0A;color:#fff;padding:12px 24px;border-radius:99px;font-size:14px;font-weight:500;z-index:9999;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

// ─── Show/hide auth-required box based on login state ────────
function syncAuthBox() {
  const user = getUser();
  if (authReqBox) authReqBox.style.display = user ? 'none' : '';
  updateEnrollButton();
}

// ─── Init ─────────────────────────────────────────────────────
if (COURSE_ID) {
  loadCourse();
} else {
  // No ID in URL — keep existing static content
  console.warn('No course ID in URL. Showing static content.');
}

syncAuthBox();
