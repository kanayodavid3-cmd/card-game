# 🎮 Interactive Card Game (UI/UX Focused)

## 📌 Overview

This project is a browser-based card game designed with a strong focus on user experience and clean interface design. The goal was to create an intuitive and engaging gameplay experience where users can easily understand rules, interact with the interface, and receive clear feedback during each turn.

---

## 🎯 Objective

To design and develop a card game that emphasizes:

* Simple and intuitive gameplay
* Clear user flows and interaction patterns
* Consistent and visually organized interface

---

## 🧠 Game Rules

* Players (User vs CPU) are dealt random cards
* A card is placed in the center to start
* The player must play a card that matches:

  * The **shape** OR
  * The **number**
* If no valid move is available, the player draws from the market
* Players alternate turns until:

  * A player runs out of cards (default win condition)
    OR
  * The market runs out (optional mode)

### 🏁 Alternative Ending Mode

If the market runs out:

* The winner is determined by the **lower total card value**

---

## 🔄 User Flow

Start Game
→ Deal Cards
→ Display First Card
→ User Turn (Play or Draw)
→ CPU Turn
→ Repeat Loop
→ End Game (Win / Score)

---

## 🎨 UI/UX Design Highlights

### ✅ Intuitive Layout

* Center: Active card (main focus)
* Bottom: User’s hand (interactive)
* Top: CPU number of cards (non-interactive)
* Side: Market (draw pile)

### ✅ Clear Feedback

* Visual indication of valid/invalid moves
* Turn indicators (User vs CPU)
* Immediate updates after each action

### ✅ Interaction Design

* Clickable cards for easy selection
* Disabled or visually distinct unplayable cards
* Simple and accessible controls

### ✅ Game Customization

* Option to choose how the game ends:

  * Player finishes cards
  * Market runs out

---

## ⚙️ Technologies Used

* HTML
* CSS
* JavaScript (using JQuery)

---

## 🚀 Live Demo

👉 [Play the game here](https://yourusername.github.io/card-game-ui/)

---

## 💻 Repository

👉 https://github.com/kanayodavid3-cmd/card-game

---

## 🔧 Future Improvements

* Improve onboarding/tutorial for first-time users
* Enhance accessibility (e.g., colorblind-friendly indicators)
* Add sound effects
* Improve CPU decision-making logic

---

## 📷 Screenshots (Optional)

*Add screenshots of your game interface here*

---

## 🙌 Author

Kanayo Otiono
