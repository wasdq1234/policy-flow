import { create } from 'zustand';

export type ViewType = 'calendar' | 'list';

interface CalendarState {
  currentDate: Date;
  viewType: ViewType;
  setCurrentDate: (date: Date) => void;
  setViewType: (viewType: ViewType) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(),
  viewType: 'calendar',

  setCurrentDate: (date) => set({ currentDate: date }),

  setViewType: (viewType) => set({ viewType }),

  goToNextMonth: () =>
    set((state) => {
      const nextMonth = new Date(state.currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return { currentDate: nextMonth };
    }),

  goToPrevMonth: () =>
    set((state) => {
      const prevMonth = new Date(state.currentDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return { currentDate: prevMonth };
    }),

  goToToday: () => set({ currentDate: new Date() }),
}));
