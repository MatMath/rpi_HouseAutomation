module.exports = {
  credentials: {
    comments: `Wait WAHT???  User and password in plain text??? How
      insaine!?! But this is for my house lighting and blind control
      hosted on my Pi so no extreme secret here... You should use
      Passport for User auth and jwt for communication, but I wont.`,
    matmath: 'notGonnaTypeThat',
    bob: 'montreal',
  },
  hardware: {
    cpu: {
      temperature: {
        filepath: '/sys/class/thermal/thermal_zone0/temp',
        threshold: {
          cold: 45000,
          warm: 55000,
        },
      },
    },
  },
  openMorningAt: 7,
  closeEveningAt: 19,
  doorMovementDetectionPin: 23,
  frontMovementDetectionPin: 24,
  aliveLight: 12,
  lightOpenSSR: 21,
  lightOpen_ms: 10000,
  frontMovementBuffer: 10000,
  falseAlarmBuffer: 1000,
  blindMotorControl: [
    { motorOpen: 3, motorClose: 3, openLimitSwitch: 5, closeLimitSwitch: 5 },
    { motorOpen: 4, motorClose: 3, openLimitSwitch: 6, closeLimitSwitch: 5 },
  ],
  processorFanPin: 22,
  note: 'The Processor Fan is because I want to control a FAN to cool the processor, but only when the PI is doing real work like OpenCV and not all the time.',
  possiblePinout: '2 to 27 out of 40 pins',
  disk: {
    eventLogPath: process.env.EVENT_LOG_PATH || '/home/mathieu/logs/rpi_HouseAutomation_events.log',
    requestLogPath: process.env.REQUEST_LOG_PATH || '/home/mathieu/logs/rpi_HouseAutomation__app.log',
    tempImgPath: process.env.TEMP_IMAGE_PATH || '/home/mathieu/tmp',
    saveImgPath: process.env.SAVE_IMAGE_PATH || '/home/mathieu/rpi_HouseAutomation/video',
    minVideoSize: 200000,
    minMbSpace: 10000,
    minDelayBetweenCheck: 20,
  },
  mongourl: process.env.MONGO_URL || '',
  mongoDBName: process.env.MONGO_DBNAME || 'rpi',
};
