# PDF Review App

A React-based web application for reviewing PDF documents and adding comments to selected text. Built with TypeScript and styled using Tailwind CSS.

## Features

- PDF document upload via drag-and-drop or file selection
- PDF viewing with page navigation
- Text selection and commenting functionality
- Markdown support for comments
- Comment export functionality
- Local storage persistence for comments, saved separately for each PDF
- Page offset adjustment for reference numbering (remembered per PDF)
- Responsive layout design

## Tech Stack

- React 19
- TypeScript
- Vite (build / dev server) and Vitest (tests)
- Tailwind CSS 4
- react-pdf for PDF rendering
- react-dropzone for file uploads
- react-markdown for comment formatting
- Local Storage for data persistence

## Getting Started

### Prerequisites

- Node.js 24.x (see `engines` in `package.json`)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yo-iida/pdf-commenter.git
   cd pdf-commenter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

The application will automatically reload if you make changes to the code.

### Testing

```bash
npm test          # watch mode
npx vitest run    # single run (what CI runs)
```

### Building for Production

To type-check and create a production build:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory. Preview them locally with `npm run preview`.
