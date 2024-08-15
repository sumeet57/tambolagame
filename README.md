# Tambola Game

**Tambola** is an interactive, web-based version of the classic Indian game Tambola (also known as Bingo). The game allows players to join sessions, generate tickets, and mark numbers in real-time for a fun and engaging experience.

## Features

- **Real-Time Gameplay:** Multiple players can join and play simultaneously.
- **Automated Number Generation:** System generates and calls out numbers automatically.
- **Ticket Management:** Players can generate and manage their tickets.
- **Win Conditions:** Automatic detection and announcement of winners.
- **Responsive Design:** Optimized for desktops, tablets, and smartphones.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, React, Tailwind
- **Backend:** Node.js
- **Real-Time Communication:** Socket.io
- **Other Libraries/Tools:** Github, Vs Code, Gsap, React-icons

## Usage

1. **Start a Game Session:**
   - Launch the application and click on "Start New Game" to create a game session.
   - Share the generated session code with other players.

2. **Join the Game:**
   - Players can join the session by entering the session code on the home page and clicking "Join Game."

3. **Generate Tickets:**
   - Each player generates their own tickets by clicking on "Generate Ticket."
   - Tickets will be displayed on the player's screen.

4. **Play the Game:**
   - The system will automatically call out numbers.
   - Players mark off the numbers on their tickets as they are called.

5. **Winning:**
   - The game detects and announces winners based on predefined patterns (e.g., first row, full house).

## Game Rules

- **Tambola Basics:**
  - Each ticket contains a grid of numbers.
  - A caller (the system) generates random numbers.
  - Players mark the numbers on their tickets as they are called.

- **Winning Patterns:**
  - **First Row:** The first player to mark all numbers in the first row wins.
  - **Second Row:** the first player to mark all numbers in the second row wins.
  - **Third Row:** the first player to mark all numbers in the third row wins.
  - **Middle Number:** the first player to mark number on the middle element of the ticket.
  - **Early Five:** the first player to mark all numbers of early five wins.
  - **Early Seven:** the first player to mark all numbers of early seven wins.
  - **Star:** the first player to mark all numbers form star on ticket wins.
  - **Corner:** the first player to mark all numbers of corner on ticket wins.
  - **Full House:** The first player to mark all numbers on their ticket wins.

## Contributing
#read CONTRIBUTING.md
Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
