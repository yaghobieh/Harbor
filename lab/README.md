# Harbor lab

Local app for the 1.6.5 marked routes. It depends on this repo through `file:..`, so it runs the version you are building.

```bash
cd Harbor
npm run build
cd lab
npm install
npm test
npm start
```

`npm start` listens on `http://127.0.0.1:4391`.

```bash
curl -X POST http://127.0.0.1:4391/api/users \
  -H 'content-type: application/json' \
  -d '{"name":"Ada","email":"ada@harbor.dev"}'

curl -X DELETE http://127.0.0.1:4391/api/users/1 \
  -H 'x-lab-token: lab'
```
