import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [numbers, setNumbers] = useState({ top: 0, left: 0, right: 0, bottom: 0 })
  const [target, setTarget] = useState(0)
  const [bestTime, setBestTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [lastRandomIndex, setLastRandomIndex] = useState(-1)
  const timeAtStartRef = useRef<number | null>(null)

  const getRandomNumbers = () => {
    const randomNumbers = []
    while (randomNumbers.length < 4) {
      const newNum = Math.floor(Math.random() * 4) + 1
      if (!randomNumbers.includes(newNum)) {
        randomNumbers.push(newNum)
      }
    }
    return randomNumbers
  }

  const initialize = () => {
    const newNumbers = getRandomNumbers()
    setNumbers({
      top: newNumbers[0],
      left: newNumbers[1],
      right: newNumbers[2],
      bottom: newNumbers[3],
    })

    let randomIndex = Math.floor(Math.random() * 4)
    if (randomIndex === lastRandomIndex) {
      initialize()
      return
    }
    setLastRandomIndex(randomIndex)
    setTarget(newNumbers[randomIndex])
    timeAtStartRef.current = Date.now()
    setCurrentTime(0)
  }

  useEffect(() => {
    initialize()
    const storedBestTime = parseInt(sessionStorage.getItem('bestReactionTime') || '0')
    setBestTime(storedBestTime)
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating) return

      const arrowMap: Record<number, keyof typeof numbers> = {
        38: 'top',    // up
        37: 'left',   // left
        39: 'right',  // right
        40: 'bottom', // down
      }

      const direction = arrowMap[e.keyCode]
      if (!direction) return

      e.preventDefault()

      const selectedNumber = numbers[direction]
      const reactionTime = timeAtStartRef.current ? Date.now() - timeAtStartRef.current : 0

      if (selectedNumber === target) {
        setCurrentTime(reactionTime)
        
        if (bestTime === 0 || reactionTime < bestTime) {
          setBestTime(reactionTime)
          sessionStorage.setItem('bestReactionTime', String(reactionTime))
        }

        setIsAnimating(true)
        setTimeout(() => {
          setIsAnimating(false)
          initialize()
        }, 500)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [numbers, target, isAnimating, bestTime])

  const DiamondBox = ({ position, number, isTarget }: { position: 'top' | 'left' | 'right' | 'bottom', number: number, isTarget: boolean }) => (
    <div
      className={`
        absolute w-24 h-24 flex items-center justify-center
        border-4 border-blue-500 rounded-lg font-bold text-2xl
        transition-all duration-200 cursor-pointer
        ${isTarget ? 'bg-blue-400 text-white scale-110' : 'bg-white text-blue-500 hover:bg-blue-50'}
      `}
      style={{
        ...(position === 'top' && { top: '10px', left: '50%', transform: 'translateX(-50%)' }),
        ...(position === 'left' && { left: '10px', top: '50%', transform: 'translateY(-50%)' }),
        ...(position === 'right' && { right: '10px', top: '50%', transform: 'translateY(-50%)' }),
        ...(position === 'bottom' && { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }),
      }}
    >
      {number}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">💎 DiamondSlide</h1>
          <p className="text-indigo-100">Press arrow keys to match the highlighted number</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 relative h-80">
          <DiamondBox position="top" number={numbers.top} isTarget={target === numbers.top} />
          <DiamondBox position="left" number={numbers.left} isTarget={target === numbers.left} />
          <DiamondBox position="right" number={numbers.right} isTarget={target === numbers.right} />
          <DiamondBox position="bottom" number={numbers.bottom} isTarget={target === numbers.bottom} />
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              💎
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/90 rounded-lg p-6 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-1">LAST TIME</p>
            <p className="text-3xl font-bold text-blue-600">
              {currentTime > 0 ? `${currentTime}ms` : '—'}
            </p>
          </div>
          <div className="bg-white/90 rounded-lg p-6 text-center">
            <p className="text-gray-600 text-sm font-semibold mb-1">BEST TIME</p>
            <p className="text-3xl font-bold text-green-600">
              {bestTime > 0 ? `${bestTime}ms` : '—'}
            </p>
          </div>
        </div>

        <div className="text-center text-white text-sm">
          <p>Use ⬆️ ⬅️ ➡️ ⬇️ arrow keys to play</p>
          <p className="text-indigo-200 mt-2">Match the number that appears in the center diamond</p>
        </div>
      </div>
    </div>
  )
}

export default App
