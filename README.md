# PDF Review App

A React-based web application for reviewing PDF documents and adding comments to selected text. Built with TypeScript and styled using Tailwind CSS.

## Features

- PDF document upload via drag-and-drop or file selection
- PDF viewing with page navigation
- Text selection and commenting functionality
- Markdown support for comments
- Comment export functionality
- Local storage persistence for comments
- Page offset adjustment for reference numbering
- Responsive layout design

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- react-pdf for PDF rendering
- react-dropzone for file uploads
- react-markdown for comment formatting
- Local Storage for data persistence

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pdf-commenter.git
   cd pdf-commenter
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

The application will automatically reload if you make changes to the code.

### Building for Production

To create a production build:
```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.
