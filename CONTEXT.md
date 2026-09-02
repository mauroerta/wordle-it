# Parle

Italian Wordle. One Puzzle per Game Day. Players may play as Guests or with an Account.

## Language

### Game

**Game Day**:
The calendar date in Europe/Rome that selects today’s Puzzle.
_Avoid_: local date, UTC day, “midnight wherever you are”

**First Game Day**:
3 January 2022 in Europe/Rome. Game Day 0. Same as the live Parle.
_Avoid_: epoch (as a timestamp)

**Puzzle**:
The unique five-letter Italian word for one Game Day. The sequence of Puzzles is the live Parle list (same shuffle, same First Game Day).
_Avoid_: solution, word of the day (as a second official name)

**Allowed Guess**:
A five-letter word that may be submitted. The allowed-guess list is larger than the Puzzle list.
_Avoid_: dictionary (as if there were only one list)

**Play**:
A Player’s attempt at one Puzzle: the board, guesses, and whether it is in progress, won, or lost. At most one Play per Player per Game Day. Plays are the source of truth.
_Avoid_: gameState, session, match, partita, result, score

**Streak**:
Consecutive Game Days on which the Player won the Puzzle. Computed from Plays.
_Avoid_: currentStreak (as a stored fact)

**Statistics**:
A view of a Player’s Plays: games played, wins, win percentage, current Streak, max Streak, and guess distribution. Not a record of its own; always computed from Plays.
_Avoid_: scores, results, score

### Players

**Player**:
Anyone playing, with or without an Account.
_Avoid_: user

**Guest**:
A Player without an Account. Creating an Account is this Player becoming that Account. Logging into an existing Account is switching to a different Player. Logging out is becoming a new Guest with no Plays on that device.
_Avoid_: anonymous user, unauthenticated user

**Account**:
The identity a Player can create. It owns that Player’s Plays across devices.
_Avoid_: user, login (as the noun for the person)
