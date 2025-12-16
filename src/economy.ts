// Economy System - Budget allocation and daily step calculations

import { GameTime } from './time';
import { Research } from './research';

export interface EconomyState {
  monthlyRevenue: number;
  researchBudget: number; // Dollar amount (not percentage)
}

// Game reference (set via setGame to avoid circular dependency)
let gameRef: {
  capital: number;
  updateCapitalDisplay: () => void;
} | null = null;

export function setEconomyGameRef(game: typeof gameRef): void {
  gameRef = game;
}

export const Economy = {
  // Base monthly revenue (for testing)
  monthlyRevenue: 10_000_000, // $10M/month

  // Research budget in dollars (not percentage)
  researchBudget: 5_000_000, // Default $5M to research

  // DOM elements
  revenueDisplay: null as HTMLElement | null,
  expensesDisplay: null as HTMLElement | null,
  netIncomeDisplay: null as HTMLElement | null,
  allocationSlider: null as HTMLInputElement | null,
  sliderFill: null as HTMLElement | null,
  allocationValue: null as HTMLElement | null,
  rpPerMonthDisplay: null as HTMLElement | null,
  rpPerMonthInline: null as HTMLElement | null,
  researchRateDisplay: null as HTMLElement | null,

  init(): void {
    this.revenueDisplay = document.getElementById('economy-revenue');
    this.expensesDisplay = document.getElementById('total-expenses');
    this.netIncomeDisplay = document.getElementById('net-income');
    this.allocationSlider = document.getElementById('research-slider') as HTMLInputElement;
    this.sliderFill = document.getElementById('research-slider-fill');
    this.allocationValue = document.getElementById('research-allocation-value');
    this.rpPerMonthDisplay = document.getElementById('rp-per-month');
    this.rpPerMonthInline = document.getElementById('rp-per-month-inline');
    this.researchRateDisplay = document.getElementById('research-rate');

    this.updateSliderMax();
    this.bindEvents();
    this.render();

    // Register step callback for daily updates
    GameTime.onStep(() => this.onDayPassed());
  },

  bindEvents(): void {
    this.allocationSlider?.addEventListener('input', () => {
      this.researchBudget = parseInt(this.allocationSlider!.value);
      this.render();
    });
  },

  // Update slider max when revenue changes
  updateSliderMax(): void {
    if (this.allocationSlider) {
      this.allocationSlider.max = String(this.monthlyRevenue);
      // Clamp current value to max
      if (this.researchBudget > this.monthlyRevenue) {
        this.researchBudget = this.monthlyRevenue;
      }
      this.allocationSlider.value = String(this.researchBudget);
    }
  },

  // Called each game day
  onDayPassed(): void {
    if (!gameRef) return;

    // Daily revenue = monthly / 30
    const dailyRevenue = this.monthlyRevenue / 30;

    // Research cost (OpEx) = daily portion of research budget
    const dailyResearchCost = this.researchBudget / 30;

    // Net daily income
    const netDailyIncome = dailyRevenue - dailyResearchCost;

    // Add to capital
    gameRef.capital += netDailyIncome;
    gameRef.updateCapitalDisplay();

    // Calculate research points
    // RP per day = research cost / 200,000 (scaled so $10M/mo @ 100% = 50 RP/mo)
    const dailyRP = dailyResearchCost / 200_000;
    Research.addPoints(dailyRP);
  },

  // Get monthly research points based on current budget
  getMonthlyRP(): number {
    return this.researchBudget / 200_000;
  },

  // Get monthly net income after research OpEx
  getMonthlyNetIncome(): number {
    return this.monthlyRevenue - this.researchBudget;
  },

  render(): void {
    const netIncome = this.monthlyRevenue - this.researchBudget;
    const fillPercent = this.monthlyRevenue > 0
      ? (this.researchBudget / this.monthlyRevenue) * 100
      : 0;

    if (this.revenueDisplay) {
      this.revenueDisplay.textContent = '$' + Math.floor(this.monthlyRevenue).toLocaleString();
    }
    if (this.expensesDisplay) {
      // For now, expenses = research budget (will expand later)
      this.expensesDisplay.textContent = '$' + Math.floor(this.researchBudget).toLocaleString();
    }
    if (this.netIncomeDisplay) {
      this.netIncomeDisplay.textContent = '$' + Math.floor(netIncome).toLocaleString();
    }
    if (this.allocationValue) {
      this.allocationValue.textContent = '$' + Math.floor(this.researchBudget).toLocaleString();
    }
    if (this.sliderFill) {
      this.sliderFill.style.width = `${fillPercent}%`;
    }
    const monthlyRP = this.getMonthlyRP();
    if (this.rpPerMonthDisplay) {
      this.rpPerMonthDisplay.textContent = monthlyRP.toFixed(1);
    }
    if (this.rpPerMonthInline) {
      this.rpPerMonthInline.textContent = monthlyRP.toFixed(1);
    }
    if (this.researchRateDisplay) {
      this.researchRateDisplay.textContent = monthlyRP.toFixed(1);
    }
  },

  // State management for save/load
  getState(): EconomyState {
    return {
      monthlyRevenue: this.monthlyRevenue,
      researchBudget: this.researchBudget
    };
  },

  loadState(state: EconomyState & { researchAllocation?: number }): void {
    this.monthlyRevenue = state.monthlyRevenue;

    // Handle backward compatibility: old saves had researchAllocation (0-100%)
    if (state.researchBudget !== undefined) {
      this.researchBudget = state.researchBudget;
    } else if (state.researchAllocation !== undefined) {
      // Convert percentage to dollar amount
      this.researchBudget = (state.researchAllocation / 100) * this.monthlyRevenue;
    } else {
      this.researchBudget = this.monthlyRevenue / 2; // Default 50%
    }

    this.updateSliderMax();
    this.render();
  },

  reset(): void {
    this.monthlyRevenue = 10_000_000;
    this.researchBudget = 5_000_000;
    this.updateSliderMax();
    this.render();
  }
};
