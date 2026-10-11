// Calls v5 is a singleton: a stale effect must never leave a newer session.
// Keep ownership until join settles AND onSessionLeft acknowledges teardown.
let sessionQueue = Promise.resolve();
let teardownFailure = null;

export function createInspectionSession({ sdk, sessionId, container, authenticate, onEvent, onError }) {
  let disposed = false;
  let joining = false;
  let left = false;
  let leaveRequested = false;
  let finish;
  let acknowledgeLeft;
  let timeout;
  const subscriptions = [];
  const done = new Promise((resolve) => { finish = resolve; });
  const leftEvent = new Promise((resolve) => { acknowledgeLeft = resolve; });
  const emit = (event, value) => { if (!disposed) onEvent(event, value); };

  const teardown = async () => {
    if (!joining || left || leaveRequested) return;
    leaveRequested = true;
    await sdk.leaveSession();
    if (!left) {
      await Promise.race([
        leftEvent,
        new Promise((_, reject) => {
          timeout = setTimeout(() => reject(new Error('Call teardown was not acknowledged. Reload before starting another call.')), 10000);
        })
      ]);
    }
    clearTimeout(timeout);
  };

  const run = sessionQueue.then(async () => {
    if (disposed) return;
    if (teardownFailure) throw teardownFailure;
    await authenticate();
    if (disposed) return;
    const { token } = await sdk.generateToken(sessionId);
    if (disposed) return;
    if (!token) throw new Error('The call service returned no session token.');
    const events = [
      'onSessionJoined', 'onSessionLeft', 'onSessionTimedOut',
      'onConnectionLost', 'onConnectionRestored', 'onConnectionClosed',
      'onParticipantJoined', 'onParticipantLeft', 'onParticipantListChanged',
      'onAudioMuted', 'onAudioUnMuted', 'onVideoPaused', 'onVideoResumed'
    ];
    events.forEach((event) => subscriptions.push(sdk.addEventListener(event, (value) => {
      if (event === 'onSessionLeft') {
        left = true;
        acknowledgeLeft();
        finish();
      }
      emit(event, value);
    })));
    let result;
    try {
      result = await sdk.joinSession(token, {
        sessionType: 'VIDEO', layout: 'TILE', startAudioMuted: false,
        startVideoPaused: false, hideControlPanel: true
      }, container);
    } catch (error) {
      // A rejected join never owns the singleton session, so don't wait for a
      // leave event that the SDK cannot emit.
      joining = false;
      throw error;
    }
    if (result?.error) {
      joining = false;
      throw new Error(result.error.message || 'Could not join the remote call.');
    }
    joining = true;
    if (!disposed && !left) await done;
  }).catch((error) => {
    if (!disposed) onError(error);
  }).finally(async () => {
    disposed = true;
    try {
      await teardown();
    } catch (error) {
      teardownFailure = error;
      onError(error);
    } finally {
      clearTimeout(timeout);
      subscriptions.forEach((unsubscribe) => unsubscribe());
    }
  });
  // Queuing the complete lifetime also serializes StrictMode replay and retries.
  sessionQueue = run.catch(() => {});
  return {
    dispose() {
      disposed = true;
      finish();
      return run;
    }
  };
}
