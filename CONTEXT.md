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
The identity a Player can create. It owns that Player’s Plays across devices. Its name is the WorkOS full name; without one, the part of the email before `@`; never the full address (Members see it).
_Avoid_: user, login (as the noun for the person)

### Groups

**Group**:
A private circle of Accounts. A lens over current Members’ Plays — not a season, not a stored ranking. Not searchable.
_Avoid_: league, team, clan, friend list, season

**Member**:
An Account currently in a Group. Any Member may share the Invite.
_Avoid_: user, participant

**Owner**:
The Member who created the Group, or the longest-standing remaining Member after the previous Owner left. The Owner kicks, renames, rotates or freezes the Invite, and deletes the Group.
_Avoid_: admin, moderator

**Invite**:
The secret link that lets an Account join a Group. One link per Group. Kick does not rotate it; it blocks that Account until the Owner pardons. Rotate is for a leaked link. Freeze closes the door without changing the link (Members keep seeing the Group, nobody new joins); the Owner unfreezes.
_Avoid_: invite code (as a second official name), referral

**Today’s ranking**:
Members ordered for one Game Day: wins by fewer attempts, then losses as X, then not played (in progress counts as not played). Ties share a rank. Computed from Plays. Visible without having played today. No emoji grids.
_Avoid_: leaderboard, scoreboard, Oggi (as the English term)

**Podium**:
The top five places for one Statistics view (current Streak, max Streak, average attempts with a loss as 7, win percentage, games played, losses). Ties share a place, so a tied fifth shows everyone tied. Fewer than five Members: show everyone. A Member with no finished Play has no average and no losses; they sit last, shown as —.
_Avoid_: chart (as the name of the ranking), leaderboard
