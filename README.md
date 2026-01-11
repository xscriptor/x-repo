# Xos Website Project

This is the official website for the Xos Operating System, an Arch-based distro.

## Features

- **Modern Design**: Built with Next.js 14, Tailwind CSS, and Framer Motion.
- **I18n Support**: Full support for English and Spanish.
- **Dark/Light Mode**: Uses a custom palette inspired by Monokai Pro.
- **Animations**: Custom "Black Hole" event horizon animation on the homepage.
- **Interactive Forms**: Contact and Developer application forms (simulated).
- **Download Logic**: Timer-based auto-download simulation.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- React Hook Form
- Next Themes

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Navbar, BlackHole, etc.).
- `lib/`: Utilities, including the i18n context.
