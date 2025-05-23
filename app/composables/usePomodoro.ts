const MINUTE_IN_SECONDS = 60 as const
const TEST_TIME = 0.05 * MINUTE_IN_SECONDS
const POMODORO_TIME = 25 * MINUTE_IN_SECONDS
const SHORT_BREAK = 5 * MINUTE_IN_SECONDS
const LONG_BREAK = 15 * MINUTE_IN_SECONDS

const completions = shallowRef(0)
const currentCycle = shallowRef(0)
const isBreak = shallowRef(false)
const isLongBreak = shallowRef(false)

export const usePomodoro = () => {
  const config = useRuntimeConfig()
  const isDev = config.public.appMode === 'development'
  const timer = shallowRef(isDev ? TEST_TIME : POMODORO_TIME)
  const { play } = useSoundEffects()
  const { pause, resume: start, isActive } = useIntervalFn(() => {
    timer.value -= 1

    if (timer.value === 0) {
      play()
      pause()

      if (isBreak.value) {
        isBreak.value = false
        timer.value = isDev ? TEST_TIME : POMODORO_TIME

        if (isLongBreak.value) {
          isLongBreak.value = false
          currentCycle.value = 0
        }
      }
      else {
        completions.value += 1
        currentCycle.value += 1
        isBreak.value = true

        if (currentCycle.value === 4) {
          timer.value = isDev ? TEST_TIME : LONG_BREAK
          isLongBreak.value = true
        }
        else {
          timer.value = isDev ? TEST_TIME : SHORT_BREAK
        }
      }
    }
  }, 1000, { immediate: false })

  const timeLeft = computed(() => {
    const minutes = Math.floor(timer.value / MINUTE_IN_SECONDS)
    const seconds = timer.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  function reset() {
    timer.value = POMODORO_TIME
    if (isActive.value) {
      pause()
      currentCycle.value = 0
      isBreak.value = false
    }
  }

  return {
    completions,
    currentCycle,
    isActive,
    isBreak,
    pause,
    reset,
    start,
    timeLeft,
  }
}
