// 타이머 상태 저장
let timerState = {
  timeLeft: 0,
  isRunning: false,
  alarmTime: null,
  volume: 0.3
};

// 알람 재생 함수
function playAlarm() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'timerImage128.png',
    title: '타이머 완료',
    message: '설정한 시간이 완료되었습니다.',
    priority: 2
  });
  
  // 알람 소리 재생
  const audio = new Audio('Beep.mp4');
  audio.volume = timerState.volume;
  audio.play();
  
  // 5초 후 알람 중지
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 5000);
}

// 타이머 시작
function startTimer(timeLeft) {
  if (timerState.isRunning) return;
  
  timerState.timeLeft = timeLeft;
  timerState.isRunning = true;
  timerState.alarmTime = Date.now() + (timeLeft * 1000);
  
  // 1초마다 타이머 업데이트
  timerState.intervalId = setInterval(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((timerState.alarmTime - now) / 1000));
    const elapsed = Math.floor((Date.now() - (timerState.alarmTime - timeLeft * 1000)) / 1000);
    
    if (remaining <= 0) {
      stopTimer();
      playAlarm();
    }
    
    // 타이머 상태 업데이트
    timerState.timeLeft = remaining;
    
    // 팝업에 상태 전달
    chrome.runtime.sendMessage({
      type: 'timerUpdate',
      timeLeft: remaining,
      isRunning: timerState.isRunning,
      elapsedSeconds: elapsed
    });
  }, 1000);
}

// 타이머 중지
function stopTimer() {
  if (!timerState.isRunning) return;
  
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  
  // 팝업에 상태 전달
  chrome.runtime.sendMessage({
    type: 'timerUpdate',
    timeLeft: timerState.timeLeft,
    isRunning: false
  });
}

// 타이머 초기화
function resetTimer() {
  stopTimer();
  timerState.timeLeft = 0;
  
  // 팝업에 상태 전달
  chrome.runtime.sendMessage({
    type: 'timerUpdate',
    timeLeft: 0,
    isRunning: false
  });
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startTimer') {
    startTimer(message.timeLeft);
    sendResponse({ success: true });
    return true
  } else if (message.type === 'stopTimer') {
    stopTimer();
    sendResponse({ success: true });
  } else if (message.type === 'resetTimer') {
    resetTimer();
    sendResponse({ success: true });
  } else if (message.type === 'getTimerState') {
    sendResponse({
      timeLeft: timerState.timeLeft,
      isRunning: timerState.isRunning
    });
  }
  
  return true; // 비동기 응답을 위해 true 반환
});

// 확장 프로그램 설치 시 알림 권한 요청
chrome.runtime.onInstalled.addListener(() => {
  chrome.permissions.request({
    permissions: ['notifications']
  });
});

// background.js

chrome.notifications.onClicked.addListener((notificationId) => {
  playAlarm() // 소리 재생 함수
});
