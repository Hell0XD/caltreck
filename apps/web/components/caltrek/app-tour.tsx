"use client";

import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import { useEffect, useMemo, useState } from "react";

export function AppTour({ run, onDone }: { run: boolean; onDone: () => void }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const steps = useMemo<Step[]>(
    () => [
      {
        target: "[data-tour='dashboard-date']",
        content: "Jump between days and open the calendar to review your nutrition history.",
      },
      {
        target: "[data-tour='macro-summary']",
        content: "Track calories and macros against the targets you set during onboarding.",
      },
      {
        target: "[data-tour='add-food']",
        content: "Add foods from search, recent items, favorites, or manual entry.",
      },
      {
        target: "[data-tour='meal-log']",
        content: "Your meals stay grouped by breakfast, lunch, dinner, and snacks.",
      },
      {
        target: isDesktop ? "[data-tour='desktop-navigation']" : "[data-tour='mobile-navigation']",
        content: "Move between the journal, search, scanner, and food library from here.",
      },
      {
        target: isDesktop ? "[data-tour='desktop-account-link']" : "[data-tour='mobile-account-link']",
        content: "Update your profile, weight progress, targets, and replay this tour from Account.",
      },
    ],
    [isDesktop],
  );

  function handleEvent(data: EventData) {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      onDone();
    }
  }

  return (
    <Joyride
      continuous
      onEvent={handleEvent}
      run={run}
      steps={steps}
      options={{
        arrowColor: "var(--card)",
        backgroundColor: "var(--card)",
        buttons: ["back", "skip", "primary"],
        closeButtonAction: "skip",
        overlayClickAction: false,
        overlayColor: "rgba(0, 0, 0, 0.45)",
        primaryColor: "var(--primary)",
        scrollOffset: 80,
        showProgress: true,
        textColor: "var(--foreground)",
        zIndex: 1000,
      }}
    />
  );
}
