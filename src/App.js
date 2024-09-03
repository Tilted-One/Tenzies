import React from "react"
import Die from "./component/Die"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"
import style from './App.css'

export default function App() {

    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [diceCount, setDiceCount] = React.useState(0)
    const [seconds, setSeconds] = React.useState(0)
    const [minutes, setMinutes] = React.useState(0)
    const [bestTime, setBestTime] = React.useState(0)
    
    React.useEffect(() => {
        if (tenzies) {
            if (minutes == 0) {
                if (bestTime == 0) {
                    localStorage.setItem("bestTime", JSON.stringify(seconds))
                }
                else if (JSON.parse(localStorage.getItem("bestTime")) > (minutes * 60) + seconds) {
                    localStorage.setItem("bestTime", JSON.stringify(seconds))
                }
                setBestTime(JSON.parse(localStorage.getItem("bestTime")))
            }
            else if (minutes > 0) {
                if (bestTime == 0) {
                    localStorage.setItem("bestTime", JSON.stringify((minutes * 60) + seconds))
                }
                else if (JSON.parse(localStorage.getItem("bestTime")) > (minutes * 60) + seconds) {
                    localStorage.setItem("bestTime", JSON.stringify(seconds))
                }
                setBestTime(JSON.parse(localStorage.getItem("bestTime")))
            }
        }
    }, [tenzies])

    React.useEffect(() => {
        if (!tenzies) {
            const interval = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000
            )
            return () => clearInterval(interval);
        }
    }, [tenzies])

    if (seconds == 60) {
        setMinutes(minutes + 1)
        setSeconds(0)
    }

    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
        }
    }, [dice])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }

    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }

    function rollDice() {
        if (!tenzies) {
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ?
                    die :
                    generateNewDie()
            }))
        } else {
            setTenzies(false)
            setDice(allNewDice())
        }
        if (!tenzies)
            setDiceCount(diceCount + 1)
        else if (tenzies) {
            setDiceCount(0)
            setSeconds(0)
            setMinutes(0)
        }
    }

    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ?
                { ...die, isHeld: !die.isHeld } :
                die
        }))
    }

    const diceElements = dice.map(die => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={die.isHeld}
            holdDice={() => holdDice(die.id)}
        />
    ))

    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same.
                Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button
                className="roll-dice"
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
            <div className="results">
                <p>Dice roll count: {diceCount}</p>
                <p>Timer:  {minutes > 0 ? minutes + " : " : ''} {seconds}</p>
                {bestTime > 0 ? <p>Best time: {bestTime >= 60 ? Math.floor(bestTime / 60) + " : " + bestTime % 60 : bestTime}</p> : " "}
            </div>
        </main>
    )
}