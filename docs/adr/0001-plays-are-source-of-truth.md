# Plays are the source of truth

Wordle-style stored counters (played, wins, streak) cannot be merged across devices, repaired after a timezone bug, or shown as a history of Puzzles. We store Plays (at most one per Player per Game Day). Statistics and Streak are computed from those Plays, never stored as facts.
