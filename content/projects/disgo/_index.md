---
title: Disgo
date: 2024-10-04T20:57:04-05:00
tags:
  - gamedev
draft: false
summary: A 2D puzzle race against the clock.
---

Let me introduce you to *Disgo*.

{{< figure src="home-screen.png" width="50%" description="Home screen.">}}

This is a project I've been working on for a *long* time. It's a simple game with a simple premise that was surprisingly difficult to crack. *Disgo* is a 2D puzzle game, where the goal is to solve puzzles as fast as you can. It's similar to *Sudoku* in a few ways—there is a grid of chips which have a color and a symbol. Most of the chips are "hidden", but some are revealed to you at the beginning of the game. There can only be 1 of each symbol in each row and each column. Additionally, there can only be 1 of each symbol in each set of colors—using this information, you can deduce the hidden chips' symbols to solve the puzzle. A picture can explain this more clearly than I can though:

{{< figure src="end.png" width="50%" >}}

At the beginning of the game, you are presented with a random board, that looks something like this:

{{< figure src="beginning.png" width="50%" >}}

You know that a symbol can only occur once in each row, column, and color set. Using your powers of deduction, you find a piece that you know you can reveal. To reveal it, you can tap on it to reveal a selector wheel.  

{{< figure src="selectors.png" width="50%" >}}

If you have guessed correctly, then the chip will be revealed, helping you determine the other pieces. If you guess wrong however… then you're hit with a time penalty. Every time you make an incorrect guess, your penalty will be more and more severe, so don't think you can brute force a record time!

## How it Works

### Latin Square

You may have noticed that the grid looks like a Latin square, and you would be correct! For those who have never heard of Latin squares, here's an example:

$$
\begin{matrix}
A & B & C & D \\
B & A & D & C \\
C & D & A & B \\
D & C & B & A \\
\end{matrix}
$$

They are \(N \times N\) matrices where each row and column contains \(N\) different symbols, where each symbol occurs exactly once in each row and column. They don't have to be in order like the example above either, there are many, *many* permutations of a Latin square. *Disgo* creates its grid by starting with a predefined square, and shuffling the rows and columns to create a new random square. This "scrambles" the grid while preserving its Latin square-ness.

### Solvability

So how do we choose where to place the colors when generating a board? I naively thought that the colors could be placed randomly—as it turns out, this is not the case. I discovered that a player would often get a board that they could begin to solve, but halfway through they would hit a roadblock. They couldn't continue without making a guess *somewhere*. Very rarely, they wouldn't even be able to start the game without making a guess.

I churned through many iterations to solve this issue, it was surprisingly *very* difficult to solve. But I think I've landed on the solution. Hopefully it won't take the magic out of the game once you know how it works. When generating the grid, I start with a predefined Latin square where the diagonal is sequential, like this:

$$
\begin{matrix}
 0 & \cdot & \cdot & \cdot \\
\cdot & 1 & \cdot & \cdot \\
\cdot & \cdot & 2 & \cdot \\ 
\cdot & \cdot & \cdot & 3 \\
\end{matrix}
$$

In the code, the symbols are represented as numbers and the symbol textures are stored in an array, so I just loop through the array when loading the grid and the symbols are paired to their integer value correctly. This diagonal also contains the pieces that are revealed at the beginning of the game. The colors are assigned randomly, so 0 isn't always red in each new game, etc. The other pieces are left alone, they remain hidden and don't have a color assigned to them yet, but they do have an assigned numerical value from the Latin square. The grid is then shuffled by rows and by columns, scrambling the grid.

Before I scrambled the grid, I saved the revealed pieces in a buffer. This is so I have easy access to them after scrambling the grid, but also so I can iterate through them for the next step. I have also saved the available color-value mappings in a map. For each revealed piece, I look up, down, and side to side for available pieces who have not been assigned a color yet. I then look at the available color-value mappings and determine which color has the most available mappings, or which color I can place the most down of in this piece's row and column. By doing so, this piece can rule out a giant chunk of a color set. On the first pass, the first revealed piece can rule out all but one piece from another color set, guaranteeing the player can at least start somewhere.

This did the trick… almost. This algorithm drastically improved the solvable grid success rate, but now there is an issue with symmetry. There are instances where 4 pieces, 2 from one color set and 2 from another, mirror each other vertically and horizontally across imaginary lines. This creates a situation where any one of them could theoretically be the correct value, blocking the player from continuing. I think I have a solution for this though, it's cooking in the oven as I write this post.

### Current Status

The game is otherwise complete as an MVP, once the issue with symmetry has been ironed out. Please give it a try and let me know what you think! It's meant to be a mobile game, but it's still online for testing, you can find it [here](https://disgogame.netlify.app/) (I might have forgotten to update this post if it's not there anymore, sorry!).
