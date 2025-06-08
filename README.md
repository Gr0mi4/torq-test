# torq-test

A Vue 3 web application for retrieving and displaying geolocation information by IP address.

## Main Technologies

- Vue 3 (Composition API)
- TypeScript
- Vite
- Axios
- Sass/SCSS
- Vitest
- npm

## Prerequisites

- **Node.js** ≥ v18.12.0
- npm ≥ 8

## Main Commands
### Install dependencies

```sh
npm install
```

### Start development server

```sh
npm run dev
```

### Build for production

```sh
npm run build
```

### Type checking

```sh
npm run type-check
```

## Features

- **IPv4 Input with Smart Mask**: Intelligent input validation
- **Geolocation Data Fetching**: Retrieve country and timezone information via external API
- **Country Flag Display**: Display country flags
- **Fallback Data**: All data have a fallback sources
- **Real-time Clock**: Show local time based on IP location timezone
- **Random IP Generation**: Generate test IPs (Usefull for testing)
- **Loading States**: Visual feedback during API requests
