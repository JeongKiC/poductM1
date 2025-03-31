// mockChrome.js

const mockTimerState = {
  timeLeft: 0,
  isRunning: false,
};

let mockInterval = null;

function simulateBackgroundTimer() {
  if (mockInterval) clearInterval(mockInterval);

  mockInterval = setInterval(() => {
    if (mockTimerState.isRunning && mockTimerState.timeLeft > 0) {
      mockTimerState.timeLeft--;
      window.dispatchEvent(new CustomEvent('mock-timer-update', {
        detail: {
          timeLeft: mockTimerState.timeLeft,
          isRunning: true,
        },
      }));
    }

    if (mockTimerState.timeLeft <= 0 && mockTimerState.isRunning) {
      mockTimerState.isRunning = false;
      clearInterval(mockInterval);
      console.log('[Mock] 타이머 완료 - 알람 발생 (가상)');
      alert('⏰ [Mock] 타이머 끝!'); // 실제 알람 대신 브라우저 alert 사용
    }
  }, 1000);
}

// 실제 chrome 객체가 없을 때만 mock 적용
if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
  window.chrome = {
    runtime: {
      sendMessage: (message, callback) => {
        console.log('[Mock] message sent:', message);

        switch (message.type) {
          case 'startTimer':
            mockTimerState.timeLeft = message.timeLeft;
            mockTimerState.isRunning = true;
            simulateBackgroundTimer();
            callback?.({ success: true });
            break;

          case 'stopTimer':
            mockTimerState.isRunning = false;
            clearInterval(mockInterval);
            callback?.({ success: true });
            break;

          case 'resetTimer':
            mockTimerState.isRunning = false;
            mockTimerState.timeLeft = 0;
            clearInterval(mockInterval);
            callback?.({ success: true });
            break;

          case 'getTimerState':
            callback?.({
              timeLeft: mockTimerState.timeLeft,
              isRunning: mockTimerState.isRunning,
            });
            break;

          default:
            callback?.({ success: false, error: 'Unknown message type' });
        }
      },

      onMessage: {
        addListener: (cb) => {
          // 대신 window 이벤트 리스너로 흉내냄
          window.addEventListener('mock-timer-update', (event) => {
            cb(event.detail, null, () => {});
          });
        },
      },
    },
  };

  console.log('[Mock] chrome.runtime initialized for web dev');
}
