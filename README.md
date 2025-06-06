# torq-test

A Vue 3 web application for retrieving and displaying geolocation information by IP address.

## Main Technologies

- Vue 3 (Composition API)
- TypeScript
- Vite
- Axios (for HTTP requests)
- npm

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

### Linting

```sh
npm run lint
```

## Features

- IPv4 address input with mask and validation
- Fetching geolocation data via external API
- Request result caching
- Stale request cancellation (AbortController)
- Error handling and loading state display
- Full TypeScript type safety