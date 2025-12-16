// Game Time System
// 1 real second = 1 game day

export interface GameDate {
  year: number;
  month: number;
  day: number;
}

export interface TimeState {
  date: GameDate;
  totalDays: number;
  speed: number; // 1 = normal, 2 = 2x, etc.
  paused: boolean;
}

// Callbacks registered to run each step
type StepCallback = (date: GameDate, totalDays: number) => void;

export const GameTime = {
  date: { year: 2010, month: 1, day: 1 } as GameDate,
  totalDays: 0,
  speed: 1,
  paused: true,

  intervalId: null as number | null,
  stepCallbacks: [] as StepCallback[],

  // DOM elements
  dateDisplay: null as HTMLElement | null,
  pauseBtn: null as HTMLElement | null,
  speedBtn: null as HTMLElement | null,

  init(): void {
    this.dateDisplay = document.getElementById('game-date');
    this.pauseBtn = document.getElementById('time-pause');
    this.speedBtn = document.getElementById('time-speed');

    this.bindEvents();
    this.render();
  },

  bindEvents(): void {
    this.pauseBtn?.addEventListener('click', () => this.togglePause());
    this.speedBtn?.addEventListener('click', () => this.cycleSpeed());
  },

  // Register a callback to run each game step
  onStep(callback: StepCallback): void {
    this.stepCallbacks.push(callback);
  },

  // Remove a step callback
  offStep(callback: StepCallback): void {
    this.stepCallbacks = this.stepCallbacks.filter(cb => cb !== callback);
  },

  start(): void {
    this.paused = false;
    this.scheduleNext();
    this.render();
  },

  pause(): void {
    this.paused = true;
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.render();
  },

  togglePause(): void {
    if (this.paused) {
      this.start();
    } else {
      this.pause();
    }
  },

  cycleSpeed(): void {
    // Cycle through 1x, 2x, 5x, 10x
    const speeds = [1, 2, 5, 10];
    const currentIndex = speeds.indexOf(this.speed);
    this.speed = speeds[(currentIndex + 1) % speeds.length];

    // Reschedule with new speed
    if (!this.paused) {
      if (this.intervalId !== null) {
        clearTimeout(this.intervalId);
      }
      this.scheduleNext();
    }
    this.render();
  },

  scheduleNext(): void {
    if (this.paused) return;

    const interval = 1000 / this.speed; // 1 second at 1x, 500ms at 2x, etc.
    this.intervalId = window.setTimeout(() => this.step(), interval);
  },

  step(): void {
    // Advance one day
    this.totalDays++;
    this.advanceDate();

    // Run all step callbacks
    for (const callback of this.stepCallbacks) {
      callback(this.date, this.totalDays);
    }

    this.render();
    this.scheduleNext();
  },

  advanceDate(): void {
    this.date.day++;

    const daysInMonth = this.getDaysInMonth(this.date.year, this.date.month);
    if (this.date.day > daysInMonth) {
      this.date.day = 1;
      this.date.month++;

      if (this.date.month > 12) {
        this.date.month = 1;
        this.date.year++;
      }
    }
  },

  getDaysInMonth(year: number, month: number): number {
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let days = daysPerMonth[month - 1];

    // Leap year check for February
    if (month === 2 && this.isLeapYear(year)) {
      days = 29;
    }

    return days;
  },

  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  },

  formatDate(): string {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[this.date.month - 1]} ${this.date.day}, ${this.date.year}`;
  },

  render(): void {
    if (this.dateDisplay) {
      this.dateDisplay.textContent = this.formatDate();
    }
    if (this.speedBtn) {
      this.speedBtn.textContent = `${this.speed}x`;
    }
    if (this.pauseBtn) {
      this.pauseBtn.textContent = this.paused ? '▶' : '||';
    }
  },

  // State management for save/load
  getState(): TimeState {
    return {
      date: { ...this.date },
      totalDays: this.totalDays,
      speed: this.speed,
      paused: this.paused
    };
  },

  loadState(state: TimeState): void {
    this.date = { ...state.date };
    this.totalDays = state.totalDays;
    this.speed = state.speed;
    this.paused = state.paused;

    if (!this.paused) {
      this.scheduleNext();
    }
    this.render();
  },

  reset(): void {
    this.pause();
    this.date = { year: 2010, month: 1, day: 1 };
    this.totalDays = 0;
    this.speed = 1;
    this.render();
  }
};
