export const TRANSITION_TIMINGS = {
  MAIN: 600,
  CLOSE: 400,
  CONTENT_FADE: 300,
  CONTENT_DELAY: 400,
};

export function waitForMainTransition() {
  return new Promise((resolve) =>
    setTimeout(resolve, TRANSITION_TIMINGS.MAIN)
  );
}

export function waitForCloseTransition() {
  return new Promise((resolve) =>
    setTimeout(resolve, TRANSITION_TIMINGS.CLOSE)
  );
}
