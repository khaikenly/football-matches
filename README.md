# Description
Crawl Data.

## Project setup manual

```bash
$ cp .env.example .env && npm install
```

### Migration Database setup

- Notice: Make sure you have created the database before running this command
```bash
# migration
$ npm run migration:run
```

### Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Project setup with Docker
- Run command and select the option you want to install (select option 1)
```bash
$ ./install.sh
```

## Documentation and API
- You can access the documentation at the following URL:
```
| service       │ 'FOOTBALL-MATCHES'                │
│ url           │ 'http://[::1]:3000/api/{version}' │
│ documentation │ 'http://[::1]:3000/documentation' |
```